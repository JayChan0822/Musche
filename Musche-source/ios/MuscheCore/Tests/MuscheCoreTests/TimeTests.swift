import XCTest
@testable import MuscheCore

/// 对应 tests/utils-time.test.mjs + tests/start-time-format.test.mjs（时间部分）。
final class TimeTests: XCTestCase {

    func testParseTimeStandard() {
        XCTAssertEqual(TimeMath.parseTime("00:00"), 0)
        XCTAssertEqual(TimeMath.parseTime("09:30"), 570)
        XCTAssertEqual(TimeMath.parseTime("01:02:03"), 3723)
    }

    func testParseTimeShorthandAndInvalid() {
        XCTAssertEqual(TimeMath.parseTime("7"), 7)
        XCTAssertEqual(TimeMath.parseTime(" 12:05 "), 725)
        XCTAssertEqual(TimeMath.parseTime("not-a-time"), 0)
    }

    func testTimeToMinutes() {
        XCTAssertEqual(TimeMath.timeToMinutes("00:00"), 0)
        XCTAssertEqual(TimeMath.timeToMinutes("23:59"), 1439)
        XCTAssertNil(TimeMath.timeToMinutes("abc"))
    }

    func testAddMinutesToTime() {
        XCTAssertEqual(TimeMath.addMinutesToTime("09:15", 45), "10:00")
        XCTAssertEqual(TimeMath.addMinutesToTime("23:50", 20, minMinutes: 0, maxMinutes: 1439), "23:59")
        XCTAssertEqual(TimeMath.addMinutesToTime("10:07", 0, stepMinutes: 15), "10:00")
    }

    func testAddDaysToDate() {
        var comps = DateComponents()
        comps.year = 2024
        comps.month = 2
        comps.day = 28
        comps.hour = 12
        let base = Calendar.current.date(from: comps)!
        XCTAssertEqual(TimeMath.addDaysToDate(base, 0), "2024-02-28")
        XCTAssertEqual(TimeMath.addDaysToDate(base, 1), "2024-02-29")
    }

    func testFormatClockAndNormalize() {
        XCTAssertEqual(TimeMath.formatClock(9), "09:00")
        XCTAssertEqual(TimeMath.formatClock(9, 30), "09:30")
        XCTAssertEqual(TimeMath.formatClock(0, 0), "00:00")
        XCTAssertEqual(TimeMath.formatClock(23, 5), "23:05")

        XCTAssertEqual(TimeMath.normalizeClock("9:00"), "09:00")
        XCTAssertEqual(TimeMath.normalizeClock("09:30"), "09:30")
        XCTAssertEqual(TimeMath.normalizeClock(""), "")
    }

    func testPaddedStringSortMatchesMinuteSort() {
        let times = ["10:00", TimeMath.formatClock(9)]
        let byString = times.sorted()
        let byMinutes = times.sorted {
            (TimeMath.timeToMinutes($0) ?? 0) < (TimeMath.timeToMinutes($1) ?? 0)
        }
        XCTAssertEqual(byString, ["09:00", "10:00"])
        XCTAssertEqual(byMinutes, byString)
    }
}
