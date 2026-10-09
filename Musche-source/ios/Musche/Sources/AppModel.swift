import Foundation
import Observation
import MuscheCore

/// 应用共享状态：设置 + 任务池 + 全部日程任务 + 撤销栈。
/// M1 起接 supabase 持久化；M5 起加入 TrackList 状态。
@Observable
final class AppModel {
    var settings: Settings
    var pool: [PoolItem]
    var tasks: [Schedule]
    var history: History
    var dataVersion: Int
    var supabase: SupabaseService?

    /// 自动保存状态（同步按钮据此显示转圈/告警）
    enum SaveState: Equatable {
        case idle
        case saving
        case saved
        case conflict
        case failed(String)
    }
    private(set) var saveState: SaveState = .idle

    /// 当前日程（Session）。写入/重叠检查都按它走，不再硬编码 S_DEFAULT。
    /// 改动会同步进 settings.lastSessionId，跟着自动保存一起上云。
    var currentSessionId: String = Schedule.defaultSessionId {
        didSet {
            guard oldValue != currentSessionId else { return }
            settings.lastSessionId = currentSessionId
            scheduleAutoSave()
        }
    }

    /// 云端数据真正回来之前一律不自动保存：
    /// 启动时 model 里装的是演示数据，抢先推上去会把真实数据覆盖掉。
    private var hasLoadedFromCloud = false
    private var autoSaveTask: Task<Void, Never>?

    init() {
        self.settings = AppModel.demoSettings
        self.pool = AppModel.samplePool
        self.tasks = AppModel.sampleTasks
        self.history = History()
        self.dataVersion = 0
        self.supabase = SupabaseService.fromBundle()
    }

    // MARK: - M1 云端读写（supabase-swift，乐观锁）

    var isSignedIn: Bool { supabase?.isSignedIn ?? false }
    var userEmail: String? { supabase?.email }

    func signIn(email: String, password: String) async throws {
        guard let supabase else { throw NSError(domain: "Musche", code: 1, userInfo: [NSLocalizedDescriptionKey: "未配置 Supabase 凭据"]) }
        try await supabase.signIn(email: email, password: password)
        try? await syncFromCloud()
    }

    func signUp(email: String, password: String) async throws {
        guard let supabase else { throw NSError(domain: "Musche", code: 1, userInfo: [NSLocalizedDescriptionKey: "未配置 Supabase 凭据"]) }
        try await supabase.signUp(email: email, password: password)
        try? await syncFromCloud()
    }

    func signOut() async throws {
        autoSaveTask?.cancel()
        hasLoadedFromCloud = false
        try await supabase?.signOut()
        pool = []
        tasks = []
        settings = Settings.defaults()
        dataVersion = 0
    }

    func restoreSession() async {
        guard let supabase else { return }
        let ok = await supabase.restoreSession()
        if ok { try? await syncFromCloud() }
    }

    /// 从云端读取 user_data 并应用；无数据/未登录返回 false。
    @discardableResult
    func syncFromCloud() async throws -> Bool {
        guard let supabase, supabase.isSignedIn else { return false }
        // 注意：只有请求真的走通（拿到数据、或确认云端还没有数据）才放行自动保存。
        // 抛错时不放行，否则一次网络故障就可能让本地演示数据覆盖云端。
        guard let data = try await supabase.loadUserData() else {
            hasLoadedFromCloud = true
            return false
        }
        pool = data.pool
        // 线上老数据里混着 "2025/12/4" 这种写法，不统一的话这些块在日历上永远找不到格子
        tasks = data.tasks.map { task in
            var normalized = task
            normalized.date = CalendarMath.normalizeYMD(task.date)
            return normalized
        }
        settings = data.settings
        dataVersion = data.version
        restoreSessionSelection()
        hasLoadedFromCloud = true
        return true
    }

    // MARK: - 日程（Session）

    var sessions: [SettingEntry] { settings.sessions }

    var currentSessionName: String {
        settings.sessions.first { $0.id == currentSessionId }?.name ?? "未命名日程"
    }

    /// 任务属于当前日程吗（没写 sessionId 的老数据算默认日程，与 Web 版一致）。
    func belongsToCurrentSession(_ task: Schedule) -> Bool {
        (task.sessionId ?? Schedule.defaultSessionId) == currentSessionId
    }

    /// 云端数据落地后恢复上次选中的日程。
    /// 与 Web 版一致：lastSessionId 存的是什么就用什么，即使它已经不在 sessions 列表里
    /// （线上老数据的任务全挂在 S_DEFAULT 上，而 sessions 里只有后来建的几个；
    /// 这时候要是自作主张跳到第一个日程，那 100 多个块会全部变成灰色幽灵）。
    private func restoreSessionSelection() {
        if let last = settings.lastSessionId, !last.isEmpty {
            currentSessionId = last
        } else {
            currentSessionId = Schedule.defaultSessionId
        }
    }

    @discardableResult
    func addSession(name: String) -> String {
        let id = ID.generateUniqueId("S")
        settings.sessions.append(SettingEntry(id: id, name: name))
        currentSessionId = id
        pushHistory()
        return id
    }

    func renameSession(id: String, name: String) {
        guard let index = settings.sessions.firstIndex(where: { $0.id == id }) else { return }
        settings.sessions[index].name = name
        pushHistory()
    }

    /// 删日程。至少保留一个；属于它的任务不删（与 Web 版一致，只是会变成「别的日程的任务」）。
    @discardableResult
    func deleteSession(id: String) -> Bool {
        guard settings.sessions.count > 1,
              let index = settings.sessions.firstIndex(where: { $0.id == id }) else { return false }
        settings.sessions.remove(at: index)
        if currentSessionId == id {
            currentSessionId = settings.sessions.first?.id ?? Schedule.defaultSessionId
        }
        pushHistory()
        return true
    }

    // MARK: - 设置项（乐手/项目/乐器/录音棚/录音师/操作员/助理）

    enum EntryKind: String, CaseIterable, Identifiable {
        case musician = "乐手"
        case project = "项目"
        case instrument = "乐器"
        case studio = "录音棚"
        case engineer = "录音师"
        case operatorRole = "操作员"
        case assistant = "助理"

        public var id: String { rawValue }

        var keyPath: WritableKeyPath<Settings, [SettingEntry]> {
            switch self {
            case .musician: return \.musicians
            case .project: return \.projects
            case .instrument: return \.instruments
            case .studio: return \.studios
            case .engineer: return \.engineers
            case .operatorRole: return \.operators
            case .assistant: return \.assistants
            }
        }

        /// 生成 id 用的前缀，沿用 Web 版的习惯
        var idPrefix: String {
            switch self {
            case .musician: return "M"
            case .project: return "P"
            case .instrument: return "I"
            case .studio: return "ST"
            case .engineer: return "E"
            case .operatorRole: return "O"
            case .assistant: return "A"
            }
        }

        /// 只有乐手/项目有默认倍率
        var hasDefaultRatio: Bool { self == .musician || self == .project }
    }

    func entries(_ kind: EntryKind) -> [SettingEntry] {
        settings[keyPath: kind.keyPath]
    }

    @discardableResult
    func addEntry(_ kind: EntryKind, name: String, color: String? = nil, defaultRatio: Double? = nil) -> String {
        let id = ID.generateUniqueId(kind.idPrefix)
        settings[keyPath: kind.keyPath].append(
            SettingEntry(id: id, name: name, color: color, defaultRatio: defaultRatio)
        )
        pushHistory()
        return id
    }

    func updateEntry(_ kind: EntryKind, _ entry: SettingEntry) {
        guard let index = settings[keyPath: kind.keyPath].firstIndex(where: { $0.id == entry.id }) else { return }
        settings[keyPath: kind.keyPath][index] = entry
        pushHistory()
    }

    /// 删设置项。引用它的任务池条目/日程块会一起清掉引用（避免出现「乐手（未匹配）」）。
    func deleteEntry(_ kind: EntryKind, id: String) {
        settings[keyPath: kind.keyPath].removeAll { $0.id == id }
        for index in pool.indices {
            switch kind {
            case .musician where pool[index].musicianId == id: pool[index].musicianId = nil
            case .project where pool[index].projectId == id: pool[index].projectId = nil
            case .instrument where pool[index].instrumentId == id: pool[index].instrumentId = nil
            default: break
            }
        }
        for index in tasks.indices {
            switch kind {
            case .musician where tasks[index].musicianId == id: tasks[index].musicianId = nil
            case .project where tasks[index].projectId == id: tasks[index].projectId = nil
            case .instrument where tasks[index].instrumentId == id: tasks[index].instrumentId = nil
            default: break
            }
        }
        pushHistory()
    }

    /// 有多少条数据在用这个设置项——删之前提示用
    func usageCount(_ kind: EntryKind, id: String) -> Int {
        func matches(_ musician: String?, _ project: String?, _ instrument: String?) -> Bool {
            switch kind {
            case .musician: return musician == id
            case .project: return project == id
            case .instrument: return instrument == id
            default: return false
            }
        }
        let inPool = pool.filter { matches($0.musicianId, $0.projectId, $0.instrumentId) }.count
        let inTasks = tasks.filter { matches($0.musicianId, $0.projectId, $0.instrumentId) }.count
        return inPool + inTasks
    }

    /// 时间轴可视时段
    func updateHours(startHour: Int, endHour: Int) {
        let start = max(0, min(23, startHour))
        let end = max(start + 1, min(24, endHour))
        guard settings.startHour != start || settings.endHour != end else { return }
        settings.startHour = start
        settings.endHour = end
        pushHistory()
    }

    // MARK: - 自动保存

    /// 任何改动后延迟 1.5s 推一次云端（连续拖动只会触发最后一次）。
    /// 没有这个的话，改动只活在内存里，杀掉 App 再进来就全没了——
    /// 表现就是「明明排了期，重开还是显示已排 0」。
    private func scheduleAutoSave() {
        guard hasLoadedFromCloud, isSignedIn else { return }
        autoSaveTask?.cancel()
        autoSaveTask = Task { @MainActor [weak self] in
            try? await Task.sleep(for: .seconds(1.5))
            guard !Task.isCancelled else { return }
            await self?.autoSave()
        }
    }

    @MainActor
    private func autoSave() async {
        saveState = .saving
        do {
            switch try await pushToCloud() {
            case .saved:
                saveState = .saved
            case .conflict:
                // 云端被别处改过：不覆盖，交给用户在同步面板里决定
                saveState = .conflict
            }
        } catch {
            saveState = .failed(error.localizedDescription)
        }
    }

    /// 把当前状态上传到云端（乐观锁：云端版本更新则返回 .conflict）。
    @discardableResult
    func pushToCloud() async throws -> Sync.SaveResult {
        guard let supabase, supabase.isSignedIn else {
            throw NSError(domain: "Musche", code: 1, userInfo: [NSLocalizedDescriptionKey: "未登录"])
        }
        let data = UserData(pool: pool, tasks: tasks, settings: settings, version: dataVersion)
        let result = try await supabase.saveUserData(data)
        if case .saved(let v) = result {
            dataVersion = v
            hasLoadedFromCloud = true
        }
        return result
    }

    /// 某一天的任务，按开始分钟数排序（历史没补零的时间也不会排错）。
    func tasks(for dateStr: String) -> [Schedule] {
        tasks.filter { $0.date == dateStr }
            .sorted { (TimeMath.timeToMinutes($0.startTime) ?? 0) < (TimeMath.timeToMinutes($1.startTime) ?? 0) }
    }

    func tasks(for date: Date) -> [Schedule] {
        tasks(for: Format.formatYMD(date))
    }

    // MARK: - 撤销栈

    private func snapshot() -> UserData {
        UserData(pool: pool, tasks: tasks, settings: settings, version: 0)
    }

    private func pushHistory() {
        history.push(snapshot())
        scheduleAutoSave()
    }

    func undo() {
        if let snap = history.undo() {
            pool = snap.pool
            tasks = snap.tasks
            settings = snap.settings
            scheduleAutoSave()
        }
    }

    func redo() {
        if let snap = history.redo() {
            pool = snap.pool
            tasks = snap.tasks
            settings = snap.settings
            scheduleAutoSave()
        }
    }

    var canUndo: Bool { history.index > 0 }
    var canRedo: Bool { history.index < history.snapshots.count - 1 }

    // MARK: - 变更（每次变更入撤销栈）

    func updateTask(_ task: Schedule) {
        if let index = tasks.firstIndex(where: { $0.scheduleId == task.scheduleId }) {
            tasks[index] = task
            pushHistory()
        }
    }

    /// 快速添加任务池条目（对应 quick-add.js 的 addItemToPool）。
    func addPoolItem(projectId: String, instrumentId: String, musicianId: String, musicDuration: String) {
        let baseName = settings.instruments.first(where: { $0.id == instrumentId })?.name ?? "未命名"
        let item = Pool.buildItem(
            id: ID.generateUniqueId("T"),
            sessionId: currentSessionId,
            projectId: projectId,
            instrumentId: instrumentId,
            musicianId: musicianId,
            musicDuration: musicDuration,
            baseName: baseName,
            existingPool: pool,
            settings: settings
        )
        pool.append(item)
        pushHistory()
    }

    /// 把任务池条目安排到日历（对应 schedule-drag-drop.js 的 dropToMonth/dropToSchedule）。
    /// 有同类型重叠返回 false（不写入）。
    @discardableResult
    func schedulePoolItem(_ item: PoolItem, dateStr: String, startTime: String) -> Bool {
        let s = ScheduleMath.buildSchedule(
            fromPoolItem: item, date: dateStr, startTime: startTime,
            sessionId: currentSessionId, scheduleId: ID.generateUniqueId("S")
        )
        let type = ScheduleMath.taskType(of: s)
        let conflict = ScheduleMath.checkOverlap(
            date: s.date, startTime: s.startTime, durationStr: s.estDuration, excludeId: nil,
            checkType: type, tasks: tasks, currentSessionId: currentSessionId
        )
        if conflict { return false }
        tasks.append(s)
        pushHistory()
        return true
    }

    /// 删掉日历上的一个时间块（任务池里的条目保留，可以重新排期）。
    func deleteTask(id: String) {
        tasks.removeAll { $0.scheduleId == id }
        pushHistory()
    }

    /// 改任务池条目（按 id 覆盖），入撤销栈。
    func updatePoolItem(_ item: PoolItem) {
        guard let index = pool.firstIndex(where: { $0.id == item.id }) else { return }
        pool[index] = item
        pushHistory()
    }

    /// 删任务池条目；它已经排到日历上的块也一并删掉，否则日历上会留下无主的块。
    func deletePoolItem(id: String) {
        pool.removeAll { $0.id == id }
        tasks.removeAll { $0.templateId == id }
        pushHistory()
    }

    /// 写入录音起止时间，按 recEnd − recStart − 休息 计算实际时长（对应 calcTrackDiff）。
    /// 组级倍率回写的 1.5s 防抖（坑 #6）由 MuscheCore.Debouncer 承载，接入持久化层时再接。
    func saveRecording(taskId: String, recStart: String, recEnd: String, breakMinutes: Double) {
        guard let index = tasks.firstIndex(where: { $0.scheduleId == taskId }) else { return }
        let actualDuration = TrackRecord.calculateActualDuration(recStart: recStart, recEnd: recEnd, breakMinutes: breakMinutes)
        if tasks[index].records == nil {
            tasks[index].records = Records(musician: nil, project: nil, instrument: nil)
        }
        tasks[index].records?.musician = Record(recStart: recStart, recEnd: recEnd, actualDuration: actualDuration, breakMinutes: breakMinutes)
        pushHistory()
    }

    /// 导出当前会话的日程为 CSV 文本（对应 export-csv.js 的取数 + CSV 写出）。
    func exportCSV() -> String {
        let rows = Export.buildRows(tasks: tasks, pool: pool, settings: settings, sessionId: currentSessionId)
        return Export.csvString(rows: rows)
    }

    /// CSV 导入预览：每行 [项目名, 乐手名, 乐器名, 时长]，解析名称并判定 NEW/SKIP。
    func previewCSVImport(_ rows: [[String]]) -> [CSVImportRow] {
        rows.compactMap { cols in
            guard cols.count >= 4 else { return nil }
            let projectName = cols[0], musicianName = cols[1], instrumentName = cols[2], duration = cols[3]
            let valid = NameLookup.id(forName: projectName, type: "project", settings: settings) != nil &&
                        NameLookup.id(forName: musicianName, type: "musician", settings: settings) != nil &&
                        NameLookup.id(forName: instrumentName, type: "instrument", settings: settings) != nil
            guard valid else {
                return CSVImportRow(projectName: projectName, musicianName: musicianName, instrumentName: instrumentName, duration: duration, status: "SKIP")
            }
            let duplicate = ImportMatch.findDuplicate(in: pool, sessionId: currentSessionId, projectName: projectName, instrumentName: instrumentName, musicianName: musicianName, settings: settings)
            let status = ImportMatch.calculateStatus(hasData: true, isDuplicate: duplicate, hasSpecificDiff: false, isTaskMode: true)
            return CSVImportRow(projectName: projectName, musicianName: musicianName, instrumentName: instrumentName, duration: duration, status: status)
        }
    }

    /// 导入 NEW 行到任务池，返回导入条数。
    @discardableResult
    func confirmCSVImport(_ rows: [CSVImportRow]) -> Int {
        var count = 0
        for row in rows where row.status == "NEW" {
            guard let projectId = NameLookup.id(forName: row.projectName, type: "project", settings: settings),
                  let musicianId = NameLookup.id(forName: row.musicianName, type: "musician", settings: settings),
                  let instrumentId = NameLookup.id(forName: row.instrumentName, type: "instrument", settings: settings) else { continue }
            let item = Pool.buildItem(
                id: ID.generateUniqueId("T"), sessionId: currentSessionId, projectId: projectId,
                instrumentId: instrumentId, musicianId: musicianId, musicDuration: row.duration,
                baseName: row.instrumentName, existingPool: pool, settings: settings
            )
            pool.append(item)
            count += 1
        }
        if count > 0 { pushHistory() }
        return count
    }

    // MARK: - 示例数据（M1 起接真实云端数据）

    static var demoSettings: Settings {
        var s = Settings.defaults()
        s.musicians = [
            SettingEntry(id: "M1", name: "王老师", defaultRatio: 20),
            SettingEntry(id: "M2", name: "李老师", defaultRatio: 25),
        ]
        s.projects = [
            SettingEntry(id: "P1", name: "专辑 A", defaultRatio: 20),
            SettingEntry(id: "P2", name: "专辑 B", defaultRatio: 20),
        ]
        return s
    }

    static var samplePool: [PoolItem] {
        let settings = demoSettings
        var items: [PoolItem] = []
        for (name, dur) in [("曲笛", "02:00"), ("钢琴", "01:30"), ("二胡", "02:00")] {
            let instrumentId = settings.instruments.first(where: { $0.name.hasPrefix(name) })?.id ?? "I1"
            items.append(
                Pool.buildItem(
                    id: ID.generateUniqueId("T"), sessionId: "S_DEFAULT", projectId: "P1", instrumentId: instrumentId,
                    musicianId: "M1", musicDuration: dur, baseName: name, existingPool: items, settings: settings
                )
            )
        }
        return items
    }

    static var sampleTasks: [Schedule] {
        let cal = Calendar.current
        func dateStr(_ offset: Int) -> String {
            Format.formatYMD(cal.date(byAdding: .day, value: offset, to: Date())!)
        }
        return [
            Schedule(scheduleId: "1", date: dateStr(0), startTime: "10:00", estDuration: "00:30:00", musicianId: "M1", ratio: 20, musicDuration: "02:00"),
            Schedule(scheduleId: "2", date: dateStr(0), startTime: "11:30", estDuration: "01:00:00", projectId: "P1", ratio: 20, musicDuration: "02:00"),
            Schedule(scheduleId: "3", date: dateStr(0), startTime: "14:00", estDuration: "00:30:00", musicianId: "M2", ratio: 20, musicDuration: "01:30"),
            Schedule(scheduleId: "4", date: dateStr(0), startTime: "16:00", estDuration: "00:30:00", instrumentId: "I1", ratio: 20, musicDuration: "02:00"),
            Schedule(scheduleId: "5", date: dateStr(1), startTime: "09:30", estDuration: "00:30:00", musicianId: "M1", ratio: 20, musicDuration: "02:00"),
            Schedule(scheduleId: "6", date: dateStr(2), startTime: "13:00", estDuration: "00:30:00", projectId: "P2", ratio: 20, musicDuration: "02:00"),
        ]
    }
}

/// CSV 导入预览行。
struct CSVImportRow: Identifiable {
    let id = UUID()
    let projectName: String
    let musicianName: String
    let instrumentName: String
    let duration: String
    var status: String
}
