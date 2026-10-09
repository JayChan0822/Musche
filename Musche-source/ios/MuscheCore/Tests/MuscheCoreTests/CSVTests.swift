import XCTest
@testable import MuscheCore

/// 对应 tests/utils-csv.test.mjs。
final class CSVTests: XCTestCase {

    func testExtractTime() {
        XCTAssertEqual(CSV.extractTime("Call: 09:30"), "09:30")
        XCTAssertEqual(CSV.extractTime("Start 7：05"), "07:05")
        XCTAssertEqual(CSV.extractTime("no time here"), "")
    }

    func testNormalizeDate() {
        XCTAssertEqual(CSV.normalizeDate("2026.05.11"), "2026-05-11")
        XCTAssertEqual(CSV.normalizeDate("2026-5-1"), "2026-05-01")
        XCTAssertEqual(CSV.normalizeDate("  not a date  "), "not a date")
    }

    func testGetOrchString() {
        XCTAssertEqual(CSV.getOrchString(["violin 1", "violin 2", "flute 1", "tuba 1"]), "2 Vln, 1 Fl, 1 Tuba")
        XCTAssertEqual(CSV.getOrchString(["double bass 1", "cello 2"]), "1 Db, 1 Vc")
        XCTAssertEqual(CSV.getOrchString([]), "")
    }

    func testParseCSVLine() {
        XCTAssertEqual(CSV.parseCSVLine("a,\"b,c\",d"), ["a", "b,c", "d"])
        XCTAssertEqual(CSV.parseCSVLine("PID,Player,Duration"), ["PID", "Player", "Duration"])
        XCTAssertEqual(CSV.parseCSVLine(""), [""])
    }

    func testParseCSVRobust() {
        XCTAssertEqual(CSV.parseCSVRobust("a,b\n\"c,d\",e"), [["a", "b"], ["c,d", "e"]])
        XCTAssertEqual(CSV.parseCSVRobust("x,y\r\nz,w"), [["x", "y"], ["z", "w"]])
        XCTAssertEqual(CSV.parseCSVRobust("\"esc\"\"aped\",v"), [["esc\"aped", "v"]])
        XCTAssertEqual(CSV.parseCSVRobust(""), [])
    }
}
