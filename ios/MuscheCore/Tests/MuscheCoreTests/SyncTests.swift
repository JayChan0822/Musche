import XCTest
@testable import MuscheCore

/// 对应 auth.js saveToCloud 的乐观锁（坑 #11）。
final class SyncTests: XCTestCase {

    func testShouldConflict() {
        XCTAssertFalse(Sync.shouldConflict(localVersion: 5, cloudVersion: 5))
        XCTAssertFalse(Sync.shouldConflict(localVersion: 5, cloudVersion: 3))
        XCTAssertTrue(Sync.shouldConflict(localVersion: 5, cloudVersion: 6), "云端版本更新时冲突")
    }

    func testNextVersion() {
        XCTAssertEqual(Sync.nextVersion(5), 6)
        XCTAssertEqual(Sync.nextVersion(0), 1)
    }

    func testAttemptSave() {
        XCTAssertEqual(Sync.attemptSave(localVersion: 5, cloudVersion: 5), .saved(newVersion: 6))
        XCTAssertEqual(Sync.attemptSave(localVersion: 5, cloudVersion: 6), .conflict(cloudVersion: 6))
    }
}
