import XCTest
@testable import MuscheCore

/// 对应 schedule-drag-drop.js 的落点计算与 mobile-resize.js 的拉伸计算。
final class DayViewMathTests: XCTestCase {

    func testSnapDropToTime() {
        // pxPerMin=2，startHour 9
        XCTAssertEqual(DayViewMath.snapDropToTime(relativeY: 0, offsetMinutes: 0, pxPerMin: 2, startHour: 9, endHour: 18), "09:00")
        XCTAssertEqual(DayViewMath.snapDropToTime(relativeY: 60, offsetMinutes: 0, pxPerMin: 2, startHour: 9, endHour: 18), "09:30")
        // 100px = 50 分钟 → 吸附到整半点
        XCTAssertEqual(DayViewMath.snapDropToTime(relativeY: 100, offsetMinutes: 0, pxPerMin: 2, startHour: 9, endHour: 18), "10:00")
        // 抓住任务块内部的 30 分钟偏移会被抵消
        XCTAssertEqual(DayViewMath.snapDropToTime(relativeY: 60, offsetMinutes: 30, pxPerMin: 2, startHour: 9, endHour: 18), "09:00")
    }

    func testSnapDropToTimeClamps() {
        XCTAssertEqual(DayViewMath.snapDropToTime(relativeY: -9999, offsetMinutes: 0, pxPerMin: 2, startHour: 9, endHour: 18), "09:00", "早于起始时刻要钳回 09:00")
        XCTAssertEqual(DayViewMath.snapDropToTime(relativeY: 99999, offsetMinutes: 0, pxPerMin: 2, startHour: 9, endHour: 18), "17:30", "晚于结束时刻要钳回 endHour-30min")
    }

    func testSnapResizeDuration() {
        // startHeight 60px = 30 分钟（pxPerMin 2）
        XCTAssertEqual(DayViewMath.snapResizeDuration(deltaY: 0, startHeight: 60, startTime: "09:00", pxPerMin: 2), "00:30:00")
        XCTAssertEqual(DayViewMath.snapResizeDuration(deltaY: 60, startHeight: 60, startTime: "09:00", pxPerMin: 2), "01:00:00")
        // 拉伸到负高度 → 最短 5 分钟
        XCTAssertEqual(DayViewMath.snapResizeDuration(deltaY: -9999, startHeight: 60, startTime: "09:00", pxPerMin: 2), "00:05:00")
    }

    func testRecomputeRatioAfterResize() {
        XCTAssertEqual(DayViewMath.recomputeRatioAfterResize(musicDuration: "02:00", estDuration: "00:01:00"), 0.5)
        XCTAssertEqual(DayViewMath.recomputeRatioAfterResize(musicDuration: "02:00", estDuration: "00:02:00"), 1.0)
        XCTAssertNil(DayViewMath.recomputeRatioAfterResize(musicDuration: "", estDuration: "00:01:00"))
        XCTAssertNil(DayViewMath.recomputeRatioAfterResize(musicDuration: "00:00", estDuration: "00:01:00"))
    }

    func testNowIndicatorTop() {
        XCTAssertEqual(DayViewMath.nowIndicatorTop(nowMinutes: 600, startHour: 9, endHour: 18, pxPerMin: 2), 120)
        XCTAssertNil(DayViewMath.nowIndicatorTop(nowMinutes: 500, startHour: 9, endHour: 18, pxPerMin: 2), "早于可视时段不显示红线")
        XCTAssertNil(DayViewMath.nowIndicatorTop(nowMinutes: 1200, startHour: 9, endHour: 18, pxPerMin: 2), "晚于可视时段不显示红线")
    }

    func testTaskPositionAndHeight() {
        XCTAssertEqual(DayViewMath.taskTopPx(startTime: "09:30", startHour: 9, pxPerMin: 2), 60)
        XCTAssertEqual(DayViewMath.taskHeightPx(estDuration: "00:30:00", pxPerMin: 2), 60)
    }
}
