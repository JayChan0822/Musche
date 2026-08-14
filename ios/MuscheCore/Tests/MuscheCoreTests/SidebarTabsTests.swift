import XCTest
@testable import MuscheCore

/// 对应 tests/sidebar-tabs.test.mjs 里的纯函数部分。
final class SidebarTabsTests: XCTestCase {

    func testTabsOnlyMusicianAndProject() {
        XCTAssertEqual(SidebarTabs.sidebarTabs, ["musician", "project"])
        XCTAssertEqual(SidebarTabs.defaultSidebarTab, "musician")
        XCTAssertFalse(SidebarTabs.isSidebarTab("instrument"))
        XCTAssertTrue(SidebarTabs.isSidebarTab("project"))
    }

    func testNextSidebarTabCycles() {
        XCTAssertEqual(SidebarTabs.nextSidebarTab("musician"), "project")
        XCTAssertEqual(SidebarTabs.nextSidebarTab("project"), "musician")
        XCTAssertEqual(SidebarTabs.nextSidebarTab("instrument"), "musician")
    }

    func testPickSidebarTabFallsBack() {
        XCTAssertEqual(SidebarTabs.pickSidebarTab(["instrument"]), "musician")
        XCTAssertEqual(SidebarTabs.pickSidebarTab(["project", "instrument"]), "project")
        XCTAssertEqual(SidebarTabs.pickSidebarTab([]), "musician")
    }
}
