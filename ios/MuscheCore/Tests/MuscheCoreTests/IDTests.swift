import XCTest
@testable import MuscheCore

/// 对应 utils/id.js 的行为。
final class IDTests: XCTestCase {

    func testGenerateUniqueId() {
        let a = ID.generateUniqueId()
        let b = ID.generateUniqueId()
        XCTAssertTrue(a.hasPrefix("t"))
        XCTAssertFalse(a.isEmpty)
        XCTAssertNotEqual(a, b)
    }

    func testGenerateUniqueIdCustomPrefix() {
        XCTAssertTrue(ID.generateUniqueId("x").hasPrefix("x"))
    }
}
