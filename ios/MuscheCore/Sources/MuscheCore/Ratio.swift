import Foundation

/// `app/scripts/features/ratio.js` 的直译移植（取数与回写的纯逻辑部分）。
public enum Ratio {

    public static let fallbackRatio: Double = 20

    // MARK: - ensureItemRecords

    /// 移植 `ensureItemRecords`：把顶层旧字段迁移进三套 records / ratios，并补全结构。
    @discardableResult
    public static func ensureItemRecords(_ item: inout PoolItem) -> PoolItem {
        SplitState.ensureItemSplitViews(&item)
        ensureRecords(&item.records, &item.ratios, ratio: item.ratio, musicianId: item.musicianId,
                      actualDuration: item.actualDuration, recStart: item.recStart, recEnd: item.recEnd, breakMinutes: item.breakMinutes)
        return item
    }

    /// 移植 `ensureItemRecords` 作用在日程任务上的版本（ratio.js 的 updateTask 也作用于 scheduledTasks）。
    @discardableResult
    public static func ensureScheduleRecords(_ task: inout Schedule) -> Schedule {
        ensureRecords(&task.records, &task.ratios, ratio: task.ratio, musicianId: task.musicianId,
                      actualDuration: task.actualDuration, recStart: task.recStart, recEnd: task.recEnd, breakMinutes: task.breakMinutes)
        return task
    }

    private static func ensureRecords(
        _ records: inout Records?, _ ratios: inout Ratios?,
        ratio: Double?, musicianId: String?,
        actualDuration: String?, recStart: String?, recEnd: String?, breakMinutes: Double?
    ) {
        if records == nil {
            var r = Records(musician: Record(), project: Record(), instrument: Record())
            if !(actualDuration ?? "").isEmpty || !(recStart ?? "").isEmpty || !(recEnd ?? "").isEmpty {
                r.musician = Record(recStart: recStart ?? "", recEnd: recEnd ?? "", actualDuration: actualDuration ?? "", breakMinutes: breakMinutes ?? 0)
            }
            records = r
        }
        if records!.musician == nil { records!.musician = Record() }
        if records!.project == nil { records!.project = Record() }
        if records!.instrument == nil { records!.instrument = Record() }

        if ratios == nil {
            let oldRatio = ratio ?? fallbackRatio
            ratios = Ratios(
                musician: (musicianId?.isEmpty == false) ? oldRatio : nil,
                project: nil,
                instrument: nil
            )
        }
    }

    // MARK: - 倍率取值

    /// 移植 `getDefaultRatio`：读取对应分类的默认倍率，缺省回落到 20。
    public static func getDefaultRatio(_ id: String, type: String, settings: Settings) -> Double {
        let list = list(for: type, settings: settings)
        if let entry = list.first(where: { $0.id == id }), let dr = entry.defaultRatio, dr > 0 {
            return dr
        }
        return fallbackRatio
    }

    /// 移植 `calculateEstTime`：预计时长 = 乐曲秒数 × 倍率（倍率缺省按 1）。
    public static func calculateEstTime(_ duration: Any?, _ ratio: Double?) -> String {
        Format.formatSecs(Double(TimeMath.parseTime(duration)) * (ratio ?? 1))
    }

    /// 移植 `getTaskRatio`：优先任务自身倍率，其次分类默认倍率。
    public static func getTaskRatio(_ item: inout PoolItem, contextType: String? = nil, settings: Settings) -> Double {
        if item.ratios == nil { ensureItemRecords(&item) }
        let type = activeRatioType(contextType)
        if let local = item.ratios![type], local > 0 {
            return local
        }
        let targetId: String?
        switch type {
        case "project": targetId = item.projectId
        case "instrument": targetId = item.instrumentId
        default: targetId = item.musicianId
        }
        return getDefaultRatio(targetId ?? "", type: type, settings: settings)
    }

    /// 移植 `calculateSingleRatio`：实际录音时长 / 乐曲时长（保留 1 位小数），缺数据返回 "-"。
    public static func calculateSingleRatio(_ item: PoolItem, contextType: String? = nil) -> String {
        let type = activeRatioType(contextType)
        guard let record = item.records?[type],
              let actual = record.actualDuration, !actual.isEmpty,
              let music = item.musicDuration, !music.isEmpty else {
            return "-"
        }
        let actualSeconds = TimeMath.parseTime(actual)
        let musicSeconds = TimeMath.parseTime(music)
        if musicSeconds == 0 { return "-" }
        return String(format: "%.1f", Double(actualSeconds) / Double(musicSeconds))
    }

    /// 移植 `isDefaultRatio`：对比乐手默认倍率或 x20 基线。
    public static func isDefaultRatio(_ item: PoolItem, settings: Settings) -> Bool {
        guard let ratio = item.ratio else { return true }
        if let musicianId = item.musicianId, !musicianId.isEmpty {
            if let m = settings.musicians.first(where: { $0.id == musicianId }), let dr = m.defaultRatio {
                return ratio == dr
            }
        }
        return ratio == fallbackRatio
    }

    // MARK: - autoUpdateEfficiency

    /// 移植 `autoUpdateEfficiency`：按实际录音反推平均倍率并写回默认值，同时把跟随 x20 的任务重置为自动跟随。
    public static func autoUpdateEfficiency(
        targetId: String,
        viewType: String,
        itemPool: inout [PoolItem],
        scheduledTasks: inout [Schedule],
        settings: inout Settings,
        currentSessionId: String
    ) {
        let idKey = idKey(for: viewType)

        // 1) 只在当前会话内、命中目标 id 的任务里累计实际/乐曲秒数
        var totalActual = 0
        var totalMusic = 0
        for i in itemPool.indices {
            guard idValue(idKey, itemPool[i]) == targetId,
                  (itemPool[i].sessionId ?? "S_DEFAULT") == currentSessionId else { continue }
            ensureItemRecords(&itemPool[i])
            if let record = itemPool[i].records?[viewType],
               let actual = record.actualDuration, !actual.isEmpty,
               let music = itemPool[i].musicDuration, !music.isEmpty {
                let a = TimeMath.parseTime(actual)
                let m = TimeMath.parseTime(music)
                if a > 0 && m > 0 { totalActual += a; totalMusic += m }
            }
        }

        var newRatio: Double = 0
        if totalMusic > 0 {
            newRatio = ((Double(totalActual) / Double(totalMusic)) * 10).rounded() / 10
        }

        // 2) 更新设置里的默认倍率
        let existing = existingDefaultRatio(settings, viewType: viewType, id: targetId)
        let oldDefaultRatio = existing.ratio
        if existing.exists {
            if newRatio > 0 {
                setDefaultRatio(&settings, viewType: viewType, id: targetId, value: newRatio)
            } else {
                newRatio = oldDefaultRatio
            }
        } else if newRatio == 0 {
            newRatio = fallbackRatio
        }

        // 3) 回写任务池与日程
        for i in itemPool.indices {
            guard idValue(idKey, itemPool[i]) == targetId,
                  let musicDuration = itemPool[i].musicDuration, !musicDuration.isEmpty,
                  (itemPool[i].sessionId ?? "S_DEFAULT") == currentSessionId else { continue }
            ensureItemRecords(&itemPool[i])
            let currentDimRatio = itemPool[i].ratios?[viewType] ?? nil
            if shouldFollow(currentDimRatio, oldDefaultRatio) {
                itemPool[i].ratios?[viewType] = nil
                if itemPool[i].ratio != newRatio {
                    itemPool[i].ratio = newRatio
                    itemPool[i].estDuration = calculateEstTime(musicDuration, newRatio)
                }
            }
        }

        for i in scheduledTasks.indices {
            guard idValue(idKey, scheduledTasks[i]) == targetId,
                  let musicDuration = scheduledTasks[i].musicDuration, !musicDuration.isEmpty,
                  (scheduledTasks[i].sessionId ?? "S_DEFAULT") == currentSessionId else { continue }
            ensureScheduleRecords(&scheduledTasks[i])
            let currentDimRatio = scheduledTasks[i].ratios?[viewType] ?? nil
            if shouldFollow(currentDimRatio, oldDefaultRatio) {
                scheduledTasks[i].ratios?[viewType] = nil
                if scheduledTasks[i].ratio != newRatio {
                    scheduledTasks[i].ratio = newRatio
                    scheduledTasks[i].estDuration = calculateEstTime(musicDuration, newRatio)
                }
            }
        }
    }

    // MARK: - 内部

    private static func activeRatioType(_ contextType: String?) -> String {
        contextType ?? "musician"
    }

    private static func idKey(for viewType: String) -> String {
        switch viewType {
        case "project": return "projectId"
        case "instrument": return "instrumentId"
        default: return "musicianId"
        }
    }

    private static func list(for type: String, settings: Settings) -> [SettingEntry] {
        switch type {
        case "project": return settings.projects
        case "instrument": return settings.instruments
        default: return settings.musicians
        }
    }

    private static func idValue(_ idKey: String, _ item: PoolItem) -> String? {
        switch idKey {
        case "projectId": return item.projectId
        case "instrumentId": return item.instrumentId
        default: return item.musicianId
        }
    }

    private static func idValue(_ idKey: String, _ task: Schedule) -> String? {
        switch idKey {
        case "projectId": return task.projectId
        case "instrumentId": return task.instrumentId
        default: return task.musicianId
        }
    }

    private static func existingDefaultRatio(_ settings: Settings, viewType: String, id: String) -> (exists: Bool, ratio: Double) {
        let entry: SettingEntry?
        switch viewType {
        case "project": entry = settings.projects.first(where: { $0.id == id })
        case "instrument": entry = settings.instruments.first(where: { $0.id == id })
        default: entry = settings.musicians.first(where: { $0.id == id })
        }
        guard let entry else { return (false, fallbackRatio) }
        let r = entry.defaultRatio ?? fallbackRatio
        return (true, (r > 0) ? r : fallbackRatio)
    }

    private static func setDefaultRatio(_ settings: inout Settings, viewType: String, id: String, value: Double) {
        switch viewType {
        case "project":
            if let i = settings.projects.firstIndex(where: { $0.id == id }) { settings.projects[i].defaultRatio = value }
        case "instrument":
            if let i = settings.instruments.firstIndex(where: { $0.id == id }) { settings.instruments[i].defaultRatio = value }
        default:
            if let i = settings.musicians.firstIndex(where: { $0.id == id }) { settings.musicians[i].defaultRatio = value }
        }
    }

    private static func shouldFollow(_ currentDimRatio: Double?, _ oldDefaultRatio: Double) -> Bool {
        currentDimRatio == nil || currentDimRatio == oldDefaultRatio || currentDimRatio == fallbackRatio
    }
}
