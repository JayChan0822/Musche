import XCTest
@testable import MuscheCore

/// 对应 tests/track-list-records-behavior.test.mjs 的防抖语义（坑 #6）。
final class DebouncerTests: XCTestCase {

    /// 手动调度器（引用类型）：记录待执行的写回，测试手动触发。
    private final class ManualScheduler {
        var scheduled: [(TimeInterval, () -> Void)] = []
    }

    private func makeScheduler() -> (debouncer: Debouncer, scheduler: ManualScheduler) {
        let scheduler = ManualScheduler()
        let d = Debouncer(delay: 1.5) { delay, fire in
            scheduler.scheduled.append((delay, fire))
        }
        return (d, scheduler)
    }

    func testSaveResetsDebounceAndFiresOnce() {
        let (d, scheduler) = makeScheduler()
        var fires = 0

        d.save { fires += 1 }
        d.save { fires += 1 } // 重置：第一次的写回作废

        XCTAssertEqual(fires, 0, "防抖窗口内不执行")
        XCTAssertEqual(scheduler.scheduled.count, 2)
        XCTAssertEqual(scheduler.scheduled[0].0, 1.5)

        // 手动触发（模拟 1.5s 后）：只有最新一条生效
        scheduler.scheduled[1].1()
        scheduler.scheduled[0].1()
        XCTAssertEqual(fires, 1, "重置后只应触发一次")
    }

    func testCancelDropsPendingWriteBack() {
        let (d, scheduler) = makeScheduler()
        var fires = 0

        d.save { fires += 1 }
        d.cancel()

        scheduler.scheduled[0].1()
        XCTAssertEqual(fires, 0, "取消后写回不得触发")
    }
}
