/// `app/scripts/utils/sidebar-tabs.js` 的直译移植。
/// 侧栏任务分类的唯一真源：录音（musician）与编辑（project）两类；乐器（instrument）已下线。
public enum SidebarTabs {

    public static let sidebarTabs = ["musician", "project"]
    public static let defaultSidebarTab = sidebarTabs[0]

    public static func isSidebarTab(_ tab: String) -> Bool {
        sidebarTabs.contains(tab)
    }

    /// 按候选优先级挑一个仍然存在的分类（候选全下线时回落到默认分类）。
    public static func pickSidebarTab(_ candidates: [String]) -> String {
        candidates.first(where: { isSidebarTab($0) }) ?? defaultSidebarTab
    }

    /// 在分类之间循环切换（当前分类已下线时回到第一个）。
    public static func nextSidebarTab(_ currentTab: String) -> String {
        guard let index = sidebarTabs.firstIndex(of: currentTab) else { return defaultSidebarTab }
        return sidebarTabs[(index + 1) % sidebarTabs.count]
    }
}
