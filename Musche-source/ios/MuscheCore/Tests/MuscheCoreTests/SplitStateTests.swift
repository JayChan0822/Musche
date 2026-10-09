import XCTest
@testable import MuscheCore

/// 对应 utils/split-state.js 的纯函数行为（tests/split-task-behavior.test.mjs 里直接依赖的拆分工具）。
final class SplitStateTests: XCTestCase {

    func make(_ id: String) -> PoolItem {
        PoolItem(id: id, name: "")
    }

    func testNormalizeSplitViewType() {
        XCTAssertEqual(SplitState.normalizeSplitViewType("musician"), "musician")
        XCTAssertEqual(SplitState.normalizeSplitViewType("project"), "project")
        XCTAssertEqual(SplitState.normalizeSplitViewType("instrument"), "musician")
        XCTAssertEqual(SplitState.normalizeSplitViewType("bogus"), "musician")
    }

    func testEnsureItemSplitViewsSeedsBothViewsFromLegacy() {
        var item = make("A")
        item.splitFromId = "P"
        item.splitTag = "Part 1"
        item.musicDuration = "01:00"
        item.estDuration = "02:00"
        item.sectionIndex = 2

        SplitState.ensureItemSplitViews(&item)

        XCTAssertEqual(item.splitViews?.musician?.musicDuration, "01:00")
        XCTAssertEqual(item.splitViews?.musician?.splitTag, "Part 1")
        XCTAssertEqual(item.splitViews?.musician?.sectionIndex, 2)
        XCTAssertEqual(item.splitViews?.project?.musicDuration, "01:00")
    }

    func testSetAndGetItemSplitState() {
        var item = make("A")
        SplitState.setItemSplitState(&item, "musician") {
            $0.splitFromId = "A"
            $0.splitTag = "Part 2"
            $0.musicDuration = "00:30"
        }

        let state = SplitState.getItemSplitState(&item, "musician")
        XCTAssertEqual(state.splitFromId, "A")
        XCTAssertEqual(state.splitTag, "Part 2")
        XCTAssertEqual(state.musicDuration, "00:30")
    }

    func testGetItemSplitParentIds() {
        var item = make("B")
        item.splitFromId = "A"
        SplitState.setItemSplitState(&item, "project") { $0.splitFromId = "C" }

        let parents = SplitState.getItemSplitParentIds(item)
        XCTAssertEqual(Set(parents), ["A", "C"])
    }

    func testGetConnectedSplitItemIdsTraversal() {
        var a = make("A")
        var b = make("B")
        var c = make("C")
        SplitState.setItemSplitState(&b, "musician") { $0.splitFromId = "A" }
        SplitState.setItemSplitState(&c, "musician") { $0.splitFromId = "B" }

        let connected = SplitState.getConnectedSplitItemIds([a, b, c], "A")
        XCTAssertEqual(connected, ["A", "B", "C"])
    }

    func testHiddenStateAndVisibility() {
        var item = make("A")
        let hidden = SplitState.createHiddenSplitState()
        XCTAssertFalse(hidden.active)

        SplitState.setItemSplitState(&item, "musician") { $0 = SplitState.createHiddenSplitState() }
        XCTAssertFalse(SplitState.isItemVisibleInView(&item, "musician"))
        // project 视图仍默认可见
        XCTAssertTrue(SplitState.isItemVisibleInView(&item, "project"))
        XCTAssertTrue(SplitState.hasVisibleSplitStateInAnyView(&item))

        SplitState.deactivateItemInView(&item, "project")
        XCTAssertFalse(SplitState.hasVisibleSplitStateInAnyView(&item))
    }

    func testSyncLegacySplitFields() {
        var item = make("A")
        SplitState.setItemSplitState(&item, "musician") {
            $0.splitFromId = "P"
            $0.splitTag = "Part 2"
            $0.musicDuration = "00:30"
            $0.estDuration = "01:00"
            $0.sectionIndex = 3
        }

        SplitState.syncLegacySplitFields(&item, "musician")

        XCTAssertEqual(item.splitFromId, "P")
        XCTAssertEqual(item.splitTag, "Part 2")
        XCTAssertEqual(item.musicDuration, "00:30")
        XCTAssertEqual(item.estDuration, "01:00")
        XCTAssertEqual(item.sectionIndex, 3)
    }

    func testSyncLegacyClearsTagWhenEmpty() {
        var item = make("A")
        item.splitTag = "Part 1"
        SplitState.setItemSplitState(&item, "musician") { $0.splitTag = "" }

        SplitState.syncLegacySplitFields(&item, "musician")

        XCTAssertNil(item.splitTag)
    }
}
