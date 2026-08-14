import XCTest
@testable import MuscheCore

/// 对应 credits.js 的名单取数/分类纯函数。
final class CreditsTests: XCTestCase {

    func testSplitCreditNames() {
        XCTAssertEqual(Credits.splitCreditNames("Violin / Viola, Cello"), ["Violin", "Viola", "Cello"])
        XCTAssertEqual(Credits.splitCreditNames("A^|B"), ["A", "B"])
        XCTAssertEqual(Credits.splitCreditNames("A, B\r\nC"), ["A", "B", "C"])
        XCTAssertEqual(Credits.splitCreditNames(""), [])
        XCTAssertEqual(Credits.splitCreditNames(nil), [])
    }

    func testGetOrchCategoryByInstrument() {
        XCTAssertEqual(Credits.getOrchCategory(instrumentName: "Violin I", musicianName: ""), "strings")
        XCTAssertEqual(Credits.getOrchCategory(instrumentName: "Flute 2", musicianName: ""), "woodwinds")
        XCTAssertEqual(Credits.getOrchCategory(instrumentName: "Horn", musicianName: ""), "brass")
        XCTAssertEqual(Credits.getOrchCategory(instrumentName: "Timpani", musicianName: ""), "percussion")
        XCTAssertEqual(Credits.getOrchCategory(instrumentName: "Piano", musicianName: ""), "others")
    }

    func testGetOrchCategoryFallsBackToMusician() {
        XCTAssertEqual(Credits.getOrchCategory(instrumentName: "曲笛", musicianName: "String Section"), "strings")
        XCTAssertEqual(Credits.getOrchCategory(instrumentName: "曲笛", musicianName: "Percussion"), "percussion")
        XCTAssertNil(Credits.getOrchCategory(instrumentName: "曲笛", musicianName: ""))
    }
}
