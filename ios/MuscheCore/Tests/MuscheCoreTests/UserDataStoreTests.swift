import XCTest
@testable import MuscheCore

/// M1 数据层的乐观锁流程。
final class UserDataStoreTests: XCTestCase {

    func make(_ version: Int) -> UserData {
        UserData(pool: [], tasks: [], settings: Settings.defaults(), version: version)
    }

    func testLoadReturnsStored() async throws {
        let store = InMemoryUserDataStore(stored: make(5))
        let loaded = try await store.load()
        XCTAssertEqual(loaded?.version, 5)
    }

    func testSaveAdvancesVersion() async throws {
        let store = InMemoryUserDataStore(stored: make(5))
        let result = try await store.save(make(5))
        XCTAssertEqual(result, .saved(newVersion: 6))
        let loaded = try await store.load()
        XCTAssertEqual(loaded?.version, 6)
    }

    func testSaveConflictsWhenCloudNewer() async throws {
        // 本地看到版本 5，但云端已被别的设备写到 6
        let store = InMemoryUserDataStore(stored: make(6))
        let result = try await store.save(make(5))
        XCTAssertEqual(result, .conflict(cloudVersion: 6))
        // 冲突不覆盖云端
        let loaded = try await store.load()
        XCTAssertEqual(loaded?.version, 6)
    }
}
