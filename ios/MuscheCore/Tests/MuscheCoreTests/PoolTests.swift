import XCTest
@testable import MuscheCore

/// 对应 quick-add.js 的 addItemToPool（同名去重 + 倍率 + 时长）。
final class PoolTests: XCTestCase {

    func settings(musicians: [SettingEntry] = []) -> Settings {
        Settings(startHour: 10, endHour: 22, sessions: [], instruments: [], musicians: musicians,
                 projects: [], studios: [], engineers: [], operators: [], assistants: [])
    }

    func testBuildItemComputesRatioAndEstDuration() {
        let s = settings(musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 30)])

        let item = Pool.buildItem(
            id: "T1", sessionId: "S_DEFAULT", projectId: "P1", instrumentId: "I1", musicianId: "M1",
            musicDuration: "01:00", baseName: "曲笛", existingPool: [], settings: s
        )

        XCTAssertEqual(item.name, "曲笛")
        XCTAssertEqual(item.ratio, 30)
        XCTAssertEqual(item.estDuration, "00:30:00") // 60s × 30 = 1800s
        XCTAssertNotNil(item.records)
        XCTAssertNotNil(item.splitViews)
    }

    func testBuildItemDeduplicatesNames() {
        let s = settings(musicians: [SettingEntry(id: "M1", name: "", defaultRatio: 20)])

        func make(_ name: String, pool: [PoolItem]) -> PoolItem {
            Pool.buildItem(id: "T", sessionId: "S_DEFAULT", projectId: "P1", instrumentId: "I1", musicianId: "M1",
                           musicDuration: "01:00", baseName: name, existingPool: pool, settings: s)
        }

        let first = make("曲笛", pool: [])
        let second = make("曲笛", pool: [first])

        XCTAssertEqual(first.name, "曲笛")
        XCTAssertEqual(second.name, "曲笛 2")

        // 忠实于源码：siblings 只统计「与基础名完全同名」的条目（"曲笛 2" 不算），
        // 所以连续第三次添加同名仍得到 "曲笛 2"（源码即如此，不改语义）。
        let third = make("曲笛", pool: [first, second])
        XCTAssertEqual(third.name, "曲笛 2")
    }
}
