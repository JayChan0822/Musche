import XCTest
@testable import MuscheCore

/// 对应 tests/history-behavior.test.mjs（撤销栈核心语义）。
final class HistoryTests: XCTestCase {

    func userData(_ id: String) -> UserData {
        UserData(pool: [PoolItem(id: id, name: "")], tasks: [], settings: Settings.defaults(), version: 0)
    }

    func testPushDedupesIdenticalSnapshotWithoutTruncatingRedo() {
        var h = History()
        let a = userData("A")
        let b = userData("B")

        XCTAssertTrue(h.push(a))
        XCTAssertFalse(h.push(a), "相同快照应去重")
        XCTAssertEqual(h.snapshots.count, 1)
        XCTAssertEqual(h.index, 0)

        XCTAssertTrue(h.push(b))
        XCTAssertEqual(h.snapshots.count, 2)
        XCTAssertEqual(h.index, 1)

        // undo 回到 A，redo 分支（B）仍在
        XCTAssertEqual(h.undo()?.pool[0].id, "A")
        XCTAssertEqual(h.index, 0)

        // no-op push（快照与当前索引相同）不得砍 redo 分支
        XCTAssertFalse(h.push(a))
        XCTAssertEqual(h.snapshots.count, 2, "no-op push 不得截断 redo 分支")
        XCTAssertEqual(h.index, 0, "no-op push 不得推进索引")

        XCTAssertEqual(h.redo()?.pool[0].id, "B", "no-op push 后 redo 仍能回到 B")
        XCTAssertEqual(h.index, 1)
    }

    func testPushTruncatesRedoBranchOnRealChangeAfterUndo() {
        var h = History()
        let a = userData("A")
        let b = userData("B")
        let c = userData("C")

        h.push(a)
        h.push(b)
        _ = h.undo()      // index 0
        h.push(c)         // 真实变更 → 截断 redo（丢 B），入栈 C

        XCTAssertEqual(h.snapshots.count, 2)
        XCTAssertEqual(h.index, 1)
        XCTAssertNil(h.redo(), "已在栈顶，redo 应无操作")
        XCTAssertEqual(h.snapshots[h.index].pool[0].id, "C")
    }

    func testUndoRedoAtBoundaries() {
        var h = History()
        XCTAssertNil(h.undo(), "空栈 undo 返回 nil")
        XCTAssertNil(h.redo(), "空栈 redo 返回 nil")

        h.push(userData("A"))
        XCTAssertNil(h.undo(), "只有一条快照时 undo 停在栈底")
        XCTAssertNil(h.redo())
    }

    func testCapAtFiftySnapshots() {
        var h = History()
        for i in 0..<60 {
            h.push(userData("T\(i)"))
        }
        XCTAssertEqual(h.snapshots.count, History.maxSnapshots)
        XCTAssertEqual(h.snapshots.first?.pool[0].id, "T10", "超过 50 条时丢弃最老的快照")
        XCTAssertEqual(h.index, History.maxSnapshots - 1)
    }
}
