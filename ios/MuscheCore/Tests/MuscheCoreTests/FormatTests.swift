import XCTest
@testable import MuscheCore

/// 对应 utils/format.js 的行为（formatSecs 是 ratio.js calculateEstTime 的地基）。
final class FormatTests: XCTestCase {

    func testFormatSecs() {
        XCTAssertEqual(Format.formatSecs(0), "00:00:00")
        XCTAssertEqual(Format.formatSecs(90), "00:01:30")
        XCTAssertEqual(Format.formatSecs(3723), "01:02:03")
        XCTAssertEqual(Format.formatSecs(90.6), "00:01:31") // Math.round
        XCTAssertEqual(Format.formatSecs(1200), "00:20:00")
    }

    func testFormatDate() {
        var comps = DateComponents()
        comps.year = 2026
        comps.month = 8
        comps.day = 14
        comps.hour = 12
        let date = Calendar.current.date(from: comps)!
        XCTAssertEqual(Format.formatDate(date), "2026-08-14")
    }
}
