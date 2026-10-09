import Foundation

/// `features/export-csv.js` 里「取数/格式化」部分的直译移植。
/// Excel 写出那层在 Swift 侧换库，这里的纯格式化照搬。
public enum Export {

    /// 移植 `formatEstDuration`：小时>0 输出 "HH:MM:SS"，否则 "MM:SS"；≤0 输出空串。
    public static func formatEstDuration(_ seconds: Int) -> String {
        guard seconds > 0 else { return "" }
        let h = seconds / 3600
        let m = (seconds % 3600) / 60
        let s = seconds % 60
        if h > 0 { return String(format: "%02d:%02d:%02d", h, m, s) }
        return String(format: "%02d:%02d", m, s)
    }

    /// 移植 `getWeekday`：由 "YYYY-MM-DD" 得到「周日…周六」，非法返回空串。
    public static func weekdayLabel(_ dateStr: String) -> String {
        let parts = dateStr.split(separator: "-").map(String.init)
        guard parts.count == 3, let y = Int(parts[0]), let m = Int(parts[1]), let d = Int(parts[2]) else { return "" }
        var comps = DateComponents()
        comps.year = y
        comps.month = m
        comps.day = d
        guard let date = Calendar.current.date(from: comps) else { return "" }
        let weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
        return weekdays[Calendar.current.component(.weekday, from: date) - 1]
    }

    /// 移植 `buildInstLabel`：家族 + 名称 + 拆分标签。
    public static func instrumentLabel(name: String, family: String, splitTag: String?) -> String {
        let clean = (name == "未知乐器" || name == "未选择") ? "" : name
        var label = family.isEmpty ? clean : "\(family) \(clean)"
        if let tag = splitTag, !tag.isEmpty {
            label += " (\(tag))"
        }
        return label.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    /// 导出行（对应 collectFilteredRows 的 makeRow）。
    public struct ExportRow: Equatable {
        public var type: String
        public var date: String
        public var weekday: String
        public var startTime: String
        public var estDuration: String
        public var musician: String
        public var instLabel: String
        public var project: String
        public var projectType: String
        public var notes: String

        public init(type: String, date: String, weekday: String, startTime: String, estDuration: String, musician: String, instLabel: String, project: String, projectType: String, notes: String) {
            self.type = type
            self.date = date
            self.weekday = weekday
            self.startTime = startTime
            self.estDuration = estDuration
            self.musician = musician
            self.instLabel = instLabel
            self.project = project
            self.projectType = projectType
            self.notes = notes
        }

        public func toArray() -> [String] {
            [date, weekday, startTime, estDuration, musician, instLabel, project, projectType, notes]
        }
    }

    /// 移植 `getInstrumentFamily`。
    public static func instrumentFamily(_ instrumentId: String?, settings: Settings) -> String {
        guard let instrumentId else { return "" }
        return settings.instruments.first(where: { $0.id == instrumentId })?.group ?? ""
    }

    /// 移植 `safeGet`：未知名称返回空串。
    public static func safeGet(_ id: String?, type: String, settings: Settings) -> String {
        let name = NameLookup.name(forId: id, type: type, settings: settings)
        return ["未知项目", "未知乐器", "未知演奏员", "未选择"].contains(name) ? "" : name
    }

    /// 移植 `buildScheduleIndexMap`：同一乐手/项目/乐器的日程按时间排序后的序号（= sectionIndex）。
    public static func scheduleIndexMap(_ tasks: [Schedule], sessionIds: Set<String>) -> [String: Int] {
        var groups: [String: [Schedule]] = [:]
        for t in tasks {
            let sess = t.sessionId ?? "S_DEFAULT"
            guard sessionIds.contains(sess) else { continue }
            let key: String
            if let musicianId = t.musicianId { key = "\(sess)|M|\(musicianId)" }
            else if let projectId = t.projectId { key = "\(sess)|P|\(projectId)" }
            else if let instrumentId = t.instrumentId { key = "\(sess)|I|\(instrumentId)" }
            else { continue }
            groups[key, default: []].append(t)
        }

        var map: [String: Int] = [:]
        for (_, group) in groups {
            let sorted = group.sorted { lhs, rhs in
                lhs.date != rhs.date ? lhs.date < rhs.date : (TimeMath.timeToMinutes(lhs.startTime) ?? 0) < (TimeMath.timeToMinutes(rhs.startTime) ?? 0)
            }
            for (idx, t) in sorted.enumerated() {
                map[t.scheduleId] = idx
            }
        }
        return map
    }

    /// 移植 `getItemsForSchedule`。
    public static func itemsForSchedule(_ schedule: Schedule, scheduleIndex: Int, pool: [PoolItem]) -> [PoolItem] {
        let sess = schedule.sessionId ?? "S_DEFAULT"
        return pool.filter { item in
            if (item.sessionId ?? "S_DEFAULT") != sess { return false }
            if let musicianId = schedule.musicianId, item.musicianId != musicianId { return false }
            if let projectId = schedule.projectId, schedule.musicianId == nil, item.projectId != projectId { return false }
            if let instrumentId = schedule.instrumentId, schedule.musicianId == nil, schedule.projectId == nil, item.instrumentId != instrumentId { return false }
            return (item.sectionIndex ?? 0) == scheduleIndex
        }
    }

    /// 移植 `collectFilteredRows` 的核心（不做筛选，输出全量按日程顺序的行）。
    public static func buildRows(tasks: [Schedule], pool: [PoolItem], settings: Settings, sessionId: String) -> [ExportRow] {
        let indexMap = scheduleIndexMap(tasks, sessionIds: [sessionId])
        var rows: [ExportRow] = []

        for schedule in tasks {
            let sess = schedule.sessionId ?? "S_DEFAULT"
            if sess != sessionId { continue }
            guard let idx = indexMap[schedule.scheduleId] else { continue }

            let type = schedule.musicianId != nil ? "REC" : (schedule.projectId != nil ? "EDT" : "OTHER")
            let items = itemsForSchedule(schedule, scheduleIndex: idx, pool: pool)
            let recInfo = schedule.recordingInfo ?? [:]
            let estDurSec = TimeMath.parseTime(schedule.estDuration)

            func makeRow(_ item: PoolItem?) -> ExportRow {
                ExportRow(
                    type: type,
                    date: schedule.date,
                    weekday: weekdayLabel(schedule.date),
                    startTime: schedule.startTime,
                    estDuration: formatEstDuration(estDurSec),
                    musician: safeGet(item?.musicianId ?? schedule.musicianId, type: "musician", settings: settings),
                    instLabel: item.map { instLabel($0, settings: settings) } ?? "",
                    project: safeGet(item?.projectId ?? schedule.projectId, type: "project", settings: settings),
                    projectType: type == "REC" ? "REC" : "EDT",
                    notes: type == "REC" ? (recInfo["notes"] ?? "") : ""
                )
            }

            if items.isEmpty {
                rows.append(makeRow(nil))
            } else {
                rows.append(contentsOf: items.map { makeRow($0) })
            }
        }
        return rows
    }

    private static func instLabel(_ item: PoolItem, settings: Settings) -> String {
        let name = item.name.isEmpty ? NameLookup.name(forId: item.instrumentId, type: "instrument", settings: settings) : item.name
        return instrumentLabel(name: name, family: instrumentFamily(item.instrumentId, settings: settings), splitTag: item.splitTag)
    }

    /// CSV 转义 + 一行。
    public static func csvEscape(_ field: String) -> String {
        if field.contains(",") || field.contains("\"") || field.contains("\n") || field.contains("\r") {
            return "\"" + field.replacingOccurrences(of: "\"", with: "\"\"") + "\""
        }
        return field
    }

    public static func csvLine(_ fields: [String]) -> String {
        fields.map { csvEscape($0) }.joined(separator: ",")
    }

    /// 导出为 CSV 文本（表头 + 行）。
    public static func csvString(rows: [ExportRow]) -> String {
        let headers = ["日期", "星期", "开始时间", "预计时长", "演奏者", "声部 / 乐组", "项目", "项目类型", "备注"]
        return ([csvLine(headers)] + rows.map { csvLine($0.toArray()) }).joined(separator: "\n")
    }
}
