import XCTest
@testable import MuscheCore

/// 对应 tests/task-ghost-behavior.test.mjs 与 schedule.js 的重叠检测逻辑。
final class ScheduleMathTests: XCTestCase {

    func schedule(_ id: String, date: String, start: String, duration: String,
                  musicianId: String? = nil, projectId: String? = nil, instrumentId: String? = nil,
                  sessionId: String? = nil) -> Schedule {
        Schedule(scheduleId: id, sessionId: sessionId, date: date, startTime: start, estDuration: duration,
                 musicianId: musicianId, projectId: projectId, instrumentId: instrumentId)
    }

    // MARK: - isTaskGhost

    func testGhostWhenMissingIdInCurrentTab() {
        XCTAssertFalse(ScheduleMath.isTaskGhost(schedule("A", date: "", start: "", duration: "", musicianId: "M1", sessionId: "S1"), currentSessionId: "S1", sidebarTab: "musician"))
        XCTAssertTrue(ScheduleMath.isTaskGhost(schedule("A", date: "", start: "", duration: "", projectId: "P1", sessionId: "S1"), currentSessionId: "S1", sidebarTab: "musician"))
    }

    func testGhostForOtherSession() {
        XCTAssertTrue(ScheduleMath.isTaskGhost(schedule("A", date: "", start: "", duration: "", musicianId: "M1", sessionId: "S2"), currentSessionId: "S1", sidebarTab: "musician"))
    }

    func testInstrumentOnlyTaskIsNotPermanentlyGhost() {
        for tab in SidebarTabs.sidebarTabs {
            XCTAssertFalse(
                ScheduleMath.isTaskGhost(schedule("A", date: "", start: "", duration: "", instrumentId: "I1", sessionId: "S1"), currentSessionId: "S1", sidebarTab: tab),
                "\(tab) 分类下，只有乐器 id 的任务不应是幽灵"
            )
        }
    }

    func testCrossSessionTakesPriorityOverTabFallback() {
        XCTAssertTrue(ScheduleMath.isTaskGhost(schedule("A", date: "", start: "", duration: "", instrumentId: "I1", sessionId: "S2"), currentSessionId: "S1", sidebarTab: "musician"))
    }

    // MARK: - checkOverlap

    func testCheckOverlapDetectsOverlap() {
        let tasks = [schedule("A", date: "2026-06-02", start: "10:00", duration: "01:00:00", musicianId: "M1", sessionId: "S_DEFAULT")]
        XCTAssertTrue(ScheduleMath.checkOverlap(date: "2026-06-02", startTime: "10:30", durationStr: "00:30:00",
                                                 excludeId: nil, checkType: "musician", tasks: tasks, currentSessionId: "S_DEFAULT"))
    }

    func testCheckOverlapRejectsDifferentDateSessionTypeAndExcluded() {
        let tasks = [schedule("A", date: "2026-06-02", start: "10:00", duration: "01:00:00", musicianId: "M1", sessionId: "S_DEFAULT")]

        XCTAssertFalse(ScheduleMath.checkOverlap(date: "2026-06-03", startTime: "10:30", durationStr: "00:30:00",
                                                  excludeId: nil, checkType: "musician", tasks: tasks, currentSessionId: "S_DEFAULT"))
        XCTAssertFalse(ScheduleMath.checkOverlap(date: "2026-06-02", startTime: "10:30", durationStr: "00:30:00",
                                                  excludeId: nil, checkType: "musician", tasks: tasks, currentSessionId: "S_OTHER"))
        XCTAssertFalse(ScheduleMath.checkOverlap(date: "2026-06-02", startTime: "10:30", durationStr: "00:30:00",
                                                  excludeId: nil, checkType: "project", tasks: tasks, currentSessionId: "S_DEFAULT"))
        XCTAssertFalse(ScheduleMath.checkOverlap(date: "2026-06-02", startTime: "10:30", durationStr: "00:30:00",
                                                  excludeId: "A", checkType: "musician", tasks: tasks, currentSessionId: "S_DEFAULT"))
    }

    func testCheckOverlapAdjacentIsNotOverlap() {
        let tasks = [schedule("A", date: "2026-06-02", start: "10:00", duration: "01:00:00", musicianId: "M1", sessionId: "S_DEFAULT")]
        // 10:00–11:00 与 11:00–11:30 恰好相邻，不算重叠
        XCTAssertFalse(ScheduleMath.checkOverlap(date: "2026-06-02", startTime: "11:00", durationStr: "00:30:00",
                                                  excludeId: nil, checkType: "musician", tasks: tasks, currentSessionId: "S_DEFAULT"))
    }

    func testBuildScheduleFromPoolItem() {
        var item = PoolItem(id: "T1", name: "曲笛")
        item.musicianId = "M1"
        item.projectId = "P1"
        item.instrumentId = "I1"
        item.musicDuration = "02:00"
        item.ratio = 20
        item.estDuration = "00:40:00"

        let s = ScheduleMath.buildSchedule(
            fromPoolItem: item, date: "2026-06-02", startTime: "09:00", sessionId: "S_DEFAULT", scheduleId: "NEW1"
        )

        XCTAssertEqual(s.scheduleId, "NEW1")
        XCTAssertEqual(s.templateId, "T1")
        XCTAssertEqual(s.sessionId, "S_DEFAULT")
        XCTAssertEqual(s.date, "2026-06-02")
        XCTAssertEqual(s.startTime, "09:00")
        XCTAssertEqual(s.estDuration, "00:40:00")
        XCTAssertEqual(s.musicianId, "M1")
        XCTAssertEqual(s.projectId, "P1")
        XCTAssertEqual(s.instrumentId, "I1")
        XCTAssertEqual(s.ratio, 20)
        XCTAssertEqual(s.musicDuration, "02:00")
        XCTAssertEqual(s.trackCount, 0)
    }
}
