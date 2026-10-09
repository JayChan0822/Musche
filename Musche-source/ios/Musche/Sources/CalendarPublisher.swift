import Foundation
import EventKit
import MuscheCore

/// M7：把日程单向发布到系统日历（对应「ICS 导出 → EventKit 单向发布」）。
/// 一个 session → 一个 EKCalendar，一个日程 → 一个 EKEvent，eventIdentifier 存回内存映射。
final class CalendarPublisher {
    private let store = EKEventStore()
    private(set) var eventIdentifiers: [String: String] = [:]

    enum PublishError: LocalizedError {
        case denied
        var errorDescription: String? { "没有日历访问权限" }
    }

    @discardableResult
    func publish(
        tasks: [Schedule],
        sessionId: String,
        sessionName: String?,
        titleFor: (Schedule) -> String
    ) async throws -> Int {
        let granted = try await store.requestFullAccessToEvents()
        guard granted else { throw PublishError.denied }

        let calendar = try findOrCreateCalendar(title: CalendarPublish.calendarTitle(sessionId: sessionId, sessionName: sessionName))
        var count = 0
        for task in tasks where (task.sessionId ?? "S_DEFAULT") == sessionId {
            guard let draft = CalendarPublish.eventDraft(task, title: titleFor(task)) else { continue }
            let event = EKEvent(eventStore: store)
            event.title = draft.title
            event.startDate = draft.startDate
            event.endDate = draft.endDate
            event.notes = draft.notes
            event.calendar = calendar
            try store.save(event, span: .thisEvent)
            eventIdentifiers[task.scheduleId] = event.eventIdentifier
            count += 1
        }
        return count
    }

    private func findOrCreateCalendar(title: String) throws -> EKCalendar {
        if let existing = store.calendars(for: .event).first(where: { $0.title == title }) {
            return existing
        }
        let calendar = EKCalendar(for: .event, eventStore: store)
        calendar.title = title
        calendar.source = store.defaultCalendarForNewEvents?.source
        try store.saveCalendar(calendar, commit: true)
        return calendar
    }
}
