import XCTest
@testable import MuscheCore

/// 农历文案：对齐 Apple 日历中文版（初一显示月名，其余显示日名）。
final class LunarDateTests: XCTestCase {

    private func date(_ year: Int, _ month: Int, _ day: Int) -> Date {
        var comps = DateComponents()
        comps.year = year
        comps.month = month
        comps.day = day
        comps.hour = 12
        return Calendar.current.date(from: comps)!
    }

    func testLunarMonthStartShowsMonthName() {
        // 2026-08-13 是丙午年七月初一（Apple 日历显示「七月」）
        let value = LunarDate.value(for: date(2026, 8, 13))
        XCTAssertEqual(value.label, "七月")
        XCTAssertTrue(value.isMonthStart)
    }

    func testOrdinaryDayShowsDayName() {
        // 次日为初二
        let value = LunarDate.value(for: date(2026, 8, 14))
        XCTAssertEqual(value.label, "初二")
        XCTAssertFalse(value.isMonthStart)
    }

    func testDayNamesCoverWholeMonth() {
        XCTAssertEqual(LunarDate.dayNames.count, 30)
        XCTAssertEqual(LunarDate.dayNames.first, "初一")
        XCTAssertEqual(LunarDate.dayNames[19], "二十")
        XCTAssertEqual(LunarDate.dayNames[20], "廿一")
        XCTAssertEqual(LunarDate.dayNames.last, "三十")
    }

    func testMonthNamesUseWinterAndLastMonthAliases() {
        XCTAssertEqual(LunarDate.monthNames.count, 12)
        XCTAssertEqual(LunarDate.monthNames[0], "正月")
        XCTAssertEqual(LunarDate.monthNames[10], "冬月")
        XCTAssertEqual(LunarDate.monthNames[11], "腊月")
    }

    func testLabelIsNeverEmptyAcrossAYear() {
        var day = date(2026, 1, 1)
        for _ in 0..<365 {
            XCTAssertFalse(LunarDate.label(for: day).isEmpty, "\(day) 应有农历文案")
            day = Calendar.current.date(byAdding: .day, value: 1, to: day)!
        }
    }
}
