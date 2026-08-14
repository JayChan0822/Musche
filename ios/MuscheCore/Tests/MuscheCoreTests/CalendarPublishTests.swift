import XCTest
@testable import MuscheCore

/// 对应 M7 的 EventKit 单向发布映射。
final class CalendarPublishTests: XCTestCase {

    func testCalendarTitle() {
        XCTAssertEqual(CalendarPublish.calendarTitle(sessionId: "S_DEFAULT", sessionName: "默认录音日程"), "Musche · 默认录音日程")
        XCTAssertEqual(CalendarPublish.calendarTitle(sessionId: "S_DEFAULT", sessionName: nil), "Musche · 默认")
        XCTAssertEqual(CalendarPublish.calendarTitle(sessionId: "S1", sessionName: "档期一"), "Musche · 档期一")
    }

    func testEventDraft() {
        let s = Schedule(scheduleId: "S1", date: "2026-08-14", startTime: "10:00", estDuration: "00:30:00")
        guard let draft = CalendarPublish.eventDraft(s, title: "王老师") else {
            return XCTFail("eventDraft 应返回非空")
        }
        XCTAssertEqual(draft.title, "王老师")

        let cal = Calendar.current
        XCTAssertEqual(cal.component(.year, from: draft.startDate), 2026)
        XCTAssertEqual(cal.component(.month, from: draft.startDate), 8)
        XCTAssertEqual(cal.component(.day, from: draft.startDate), 14)
        XCTAssertEqual(cal.component(.hour, from: draft.startDate), 10)
        XCTAssertEqual(cal.component(.minute, from: draft.startDate), 0)

        XCTAssertEqual(draft.endDate.timeIntervalSince(draft.startDate), 1800)
    }

    func testEventDraftInvalidDate() {
        let s = Schedule(scheduleId: "S1", date: "not-a-date", startTime: "10:00", estDuration: "00:30:00")
        XCTAssertNil(CalendarPublish.eventDraft(s, title: "x"))
    }

    func testNotificationDraft() {
        let s = Schedule(scheduleId: "S1", date: "2026-08-14", startTime: "10:00", estDuration: "00:30:00")
        guard let draft = CalendarPublish.notificationDraft(s, title: "王老师", leadMinutes: 15) else {
            return XCTFail("应返回非空")
        }
        XCTAssertEqual(draft.title, "王老师")
        XCTAssertEqual(draft.body, "10:00 开始 · 王老师")

        let cal = Calendar.current
        XCTAssertEqual(cal.component(.hour, from: draft.triggerDate), 9)
        XCTAssertEqual(cal.component(.minute, from: draft.triggerDate), 45)
    }
}
