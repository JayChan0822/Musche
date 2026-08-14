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
        guard let data = try await supabase.loadUserData() else { return false }
        pool = data.pool
        tasks = data.tasks
        settings = data.settings
        dataVersion = data.version
        return true
    }

    /// 把当前状态上传到云端（乐观锁：云端版本更新则返回 .conflict）。
    @discardableResult
    func pushToCloud() async throws -> Sync.SaveResult {
        guard let supabase, supabase.isSignedIn else {
            throw NSError(domain: "Musche", code: 1, userInfo: [NSLocalizedDescriptionKey: "未登录"])
        }
        let data = UserData(pool: pool, tasks: tasks, settings: settings, version: dataVersion)
        let result = try await supabase.saveUserData(data)
        if case .saved(let v) = result { dataVersion = v }
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
    }

    func undo() {
        if let snap = history.undo() {
            pool = snap.pool
            tasks = snap.tasks
            settings = snap.settings
        }
    }

    func redo() {
        if let snap = history.redo() {
            pool = snap.pool
            tasks = snap.tasks
            settings = snap.settings
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
            sessionId: "S_DEFAULT",
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
            sessionId: "S_DEFAULT", scheduleId: ID.generateUniqueId("S")
        )
        let type = ScheduleMath.taskType(of: s)
        let conflict = ScheduleMath.checkOverlap(
            date: s.date, startTime: s.startTime, durationStr: s.estDuration, excludeId: nil,
            checkType: type, tasks: tasks, currentSessionId: "S_DEFAULT"
        )
        if conflict { return false }
        tasks.append(s)
        pushHistory()
        return true
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
        let rows = Export.buildRows(tasks: tasks, pool: pool, settings: settings, sessionId: "S_DEFAULT")
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
            let duplicate = ImportMatch.findDuplicate(in: pool, sessionId: "S_DEFAULT", projectName: projectName, instrumentName: instrumentName, musicianName: musicianName, settings: settings)
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
                id: ID.generateUniqueId("T"), sessionId: "S_DEFAULT", projectId: projectId,
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
