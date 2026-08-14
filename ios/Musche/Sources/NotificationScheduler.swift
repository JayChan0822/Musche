import Foundation
import UserNotifications
import MuscheCore

/// M7：为日程安排本地提醒（默认提前 15 分钟）。
final class NotificationScheduler {
    enum ScheduleError: LocalizedError {
        case denied
        var errorDescription: String? { "没有通知权限" }
    }

    @discardableResult
    func schedule(
        tasks: [Schedule],
        sessionId: String,
        titleFor: (Schedule) -> String
    ) async throws -> Int {
        let center = UNUserNotificationCenter.current()
        let granted = try await center.requestAuthorization(options: [.alert, .sound])
        guard granted else { throw ScheduleError.denied }

        var count = 0
        for task in tasks where (task.sessionId ?? "S_DEFAULT") == sessionId {
            guard let draft = CalendarPublish.notificationDraft(task, title: titleFor(task)) else { continue }
            let content = UNMutableNotificationContent()
            content.title = draft.title
            content.body = draft.body
            content.sound = .default

            let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: draft.triggerDate)
            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
            let request = UNNotificationRequest(identifier: task.scheduleId, content: content, trigger: trigger)
            try await center.add(request)
            count += 1
        }
        return count
    }
}
