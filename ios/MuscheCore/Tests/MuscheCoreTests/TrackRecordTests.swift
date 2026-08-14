import XCTest
@testable import MuscheCore

/// 对应 tests/track-list-records-behavior.test.mjs 与 track-list-divider-history.test.mjs 的纯逻辑。
final class TrackRecordTests: XCTestCase {

    func testCalculateActualDurationSubtractsBreak() {
        // 09:00 → 09:05 = 5 分钟，扣 1 分钟休息 = 4 分钟 = 240s
        XCTAssertEqual(TrackRecord.calculateActualDuration(recStart: "09:00", recEnd: "09:05", breakMinutes: 1), "00:04:00")
    }

    func testCalculateActualDurationCrossesMidnight() {
        // 23:50 → 00:10 跨午夜 = 20 分钟
        XCTAssertEqual(TrackRecord.calculateActualDuration(recStart: "23:50", recEnd: "00:10", breakMinutes: nil), "00:20:00")
    }

    func testCalculateActualDurationRequiresBothEnds() {
        XCTAssertNil(TrackRecord.calculateActualDuration(recStart: "09:00", recEnd: "", breakMinutes: nil))
        XCTAssertNil(TrackRecord.calculateActualDuration(recStart: nil, recEnd: "09:05", breakMinutes: nil))
    }

    func testMoveDividerPersistsOnlyActiveView() {
        var item = PoolItem(id: "B", name: "")
        item.sectionIndex = 1
        item.splitViews = SplitViews(
            musician: SplitViewState(sectionIndex: 1),
            project: SplitViewState(sectionIndex: 1)
        )
        var items = [item]

        let moved = TrackRecord.moveDivider(items: &items, dividerIndex: 1, direction: "down", viewType: "musician")

        XCTAssertTrue(moved)
        XCTAssertEqual(items[0].sectionIndex, 0)
        XCTAssertEqual(items[0].splitViews?.musician?.sectionIndex, 0, "当前视图同步")
        XCTAssertEqual(items[0].splitViews?.project?.sectionIndex, 1, "其它视图不动")
    }

    func testMoveDividerNoOpWhenEmpty() {
        var items: [PoolItem] = []
        XCTAssertFalse(TrackRecord.moveDivider(items: &items, dividerIndex: 1, direction: "up", viewType: "musician"))
    }
}
