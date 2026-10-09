import Foundation

/// M7：ICS 导出改成 EventKit 单向发布（不移植 → 系统日历）。
/// 纯映射部分照搬：一个 session → 一个日历，一个日程 → 一个事件。
public enum CalendarPublish {

    public struct EventDraft: Equatable {
        public var title: String
        public var startDate: Date
        public var endDate: Date
        public var notes: String

        public init(title: String, startDate: Date, endDate: Date, notes: String) {
            self.title = title
            self.startDate = startDate
            self.endDate = endDate
            self.notes = notes
        }
    }

    /// session → 日历标题。
    public static func calendarTitle(sessionId: String, sessionName: String?) -> String {
        let name = sessionName ?? (sessionId == "S_DEFAULT" ? "默认" : sessionId)
        return "Musche · \(name)"
    }

    /// schedule → 事件草稿（date + startTime → Date，end = start + estDuration 秒）。
    public static func eventDraft(_ schedule: Schedule, title: String) -> EventDraft? {
        let dateParts = schedule.date.split(separator: "-").map(String.init)
        guard dateParts.count == 3, let y = Int(dateParts[0]), let m = Int(dateParts[1]), let d = Int(dateParts[2]) else { return nil }
        guard let startMinutes = TimeMath.timeToMinutes(schedule.startTime) else { return nil }

        var comps = DateComponents()
        comps.year = y
        comps.month = m
        comps.day = d
        comps.hour = startMinutes / 60
        comps.minute = startMinutes % 60
        guard let startDate = Calendar.current.date(from: comps) else { return nil }

        let endDate = startDate.addingTimeInterval(Double(TimeMath.parseTime(schedule.estDuration)))
        return EventDraft(title: title, startDate: startDate, endDate: endDate, notes: schedule.recordingInfo?["notes"] ?? "")
    }

    public struct NotificationDraft: Equatable {
        public var title: String
        public var body: String
        public var triggerDate: Date

        public init(title: String, body: String, triggerDate: Date) {
            self.title = title
            self.body = body
            self.triggerDate = triggerDate
        }
    }

    /// 日程 → 本地提醒草稿（默认提前 leadMinutes 分钟）。
    public static func notificationDraft(_ schedule: Schedule, title: String, leadMinutes: Int = 15) -> NotificationDraft? {
        guard let draft = eventDraft(schedule, title: title) else { return nil }
        let triggerDate = draft.startDate.addingTimeInterval(-Double(leadMinutes * 60))
        return NotificationDraft(title: title, body: "\(schedule.startTime) 开始 · \(title)", triggerDate: triggerDate)
    }
}
