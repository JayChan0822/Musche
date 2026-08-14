import XCTest
@testable import MuscheCore

/// 对应 tests/sidebar-stats 的四态统计核心（未覆盖搜索/排序，那是 UI 层）。
final class PoolStatsTests: XCTestCase {

    func item(_ id: String, musicDuration: String, actualDuration: String? = nil) -> PoolItem {
        var it = PoolItem(id: id, name: "")
        it.musicDuration = musicDuration
        if let actualDuration {
            it.records = Records(musician: Record(actualDuration: actualDuration), project: nil, instrument: nil)
        }
        return it
    }

    func schedule(_ id: String, start: String, duration: String) -> Schedule {
        Schedule(scheduleId: id, date: "2026-08-14", startTime: start, estDuration: duration)
    }

    func testEmptyPoolReturnsNil() {
        XCTAssertNil(PoolStats.computeGroupStats(poolItems: [], scheduleItems: [], recordType: "musician", defaultRatio: 20))
    }

    func testCompletedWhenAllRecorded() {
        let stats = PoolStats.computeGroupStats(
            poolItems: [item("1", musicDuration: "02:00", actualDuration: "01:00")],
            scheduleItems: [],
            recordType: "musician",
            defaultRatio: 20
        )!
        XCTAssertEqual(stats.statusKey, "completed")
        XCTAssertEqual(stats.recordedCount, 1)
        XCTAssertEqual(stats.effectiveCount, 1)
        XCTAssertEqual(stats.avgRealRatio, 0.5)
        XCTAssertTrue(stats.isFullyScheduled)
    }

    func testInProgressWhenPartiallyRecorded() {
        let stats = PoolStats.computeGroupStats(
            poolItems: [
                item("1", musicDuration: "02:00", actualDuration: "01:00"),
                item("2", musicDuration: "02:00"),
            ],
            scheduleItems: [],
            recordType: "musician",
            defaultRatio: 20
        )!
        XCTAssertEqual(stats.statusKey, "in-progress")
        XCTAssertEqual(stats.recordedCount, 1)
        XCTAssertEqual(stats.effectiveCount, 2)
    }

    func testInsufficientWhenPartiallyScheduled() {
        // 2 条 01:00 乐曲、默认倍率 20 → 总需 2400s；只排了 600s
        let stats = PoolStats.computeGroupStats(
            poolItems: [item("1", musicDuration: "01:00"), item("2", musicDuration: "01:00")],
            scheduleItems: [schedule("s1", start: "10:00", duration: "00:10:00")],
            recordType: "musician",
            defaultRatio: 20
        )!
        XCTAssertEqual(stats.statusKey, "insufficient")
        XCTAssertEqual(stats.totalSeconds, 2400)
        XCTAssertEqual(stats.scheduledSeconds, 600)
    }

    func testFullWhenFullyScheduled() {
        let stats = PoolStats.computeGroupStats(
            poolItems: [item("1", musicDuration: "01:00"), item("2", musicDuration: "01:00")],
            scheduleItems: [schedule("s1", start: "10:00", duration: "01:00:00")],
            recordType: "musician",
            defaultRatio: 20
        )!
        XCTAssertEqual(stats.statusKey, "full")
        XCTAssertTrue(stats.isFullyScheduled)
    }

    func testScheduledSecondsDeductsBreaks() {
        var it = item("1", musicDuration: "02:00", actualDuration: "00:25:00")
        it.records = Records(
            musician: Record(recStart: "10:00", recEnd: "10:30", actualDuration: "00:25:00", breakMinutes: 5),
            project: nil, instrument: nil
        )
        let stats = PoolStats.computeGroupStats(
            poolItems: [it],
            scheduleItems: [schedule("s1", start: "10:00", duration: "01:00:00")],
            recordType: "musician",
            defaultRatio: 20
        )!
        // 3600s 日程 − 5 分钟休息 = 3300s
        XCTAssertEqual(stats.scheduledSeconds, 3300)
    }
}
