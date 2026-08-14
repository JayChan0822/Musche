import Foundation

/// `app/scripts/utils/split-state.js` 的直译移植（值类型 + 纯函数）。
/// 一条曲目在不同分类视图下可以各自拆分，结果存在 `splitViews[viewType]`，
/// 同时把当前视图的值同步回顶层旧字段（musicDuration / estDuration / splitTag）。
public enum SplitState {

    public static let defaultView = "musician"
    public static let supportedViews = ["musician", "project"]

    // MARK: - 内部

    private static func formatMusicDuration(_ seconds: Int) -> String {
        if seconds >= 3600 { return Format.formatSecs(seconds) }
        let safe = max(0, seconds)
        return String(format: "%02d:%02d", safe / 60, safe % 60)
    }

    private static func normalizeSectionIndex(_ value: Any?) -> Int {
        if let i = value as? Int { return i }
        if let d = value as? Double { return Int(d) }
        if let s = value as? String, let i = Int(s) { return i }
        return 0
    }

    /// 复刻 JS `createSplitState(seed)`：应用 `||` 归一化。
    private static func makeState(
        active: Bool? = nil,
        splitFromId: String? = nil,
        splitTag: String? = nil,
        musicDuration: String? = nil,
        estDuration: String? = nil,
        sectionIndex: Any? = nil
    ) -> SplitViewState {
        SplitViewState(
            active: active ?? true,
            splitFromId: (splitFromId?.isEmpty == false) ? splitFromId : nil,
            splitTag: splitTag ?? "",
            musicDuration: musicDuration ?? "",
            estDuration: estDuration ?? "",
            sectionIndex: normalizeSectionIndex(sectionIndex ?? 0)
        )
    }

    // MARK: - 导出函数

    /// 返回该条目在所有视图里的父 id 集合。
    public static func getItemSplitParentIds(_ item: PoolItem) -> [String] {
        var parents = Set<String>()
        if let pid = item.splitFromId, !pid.isEmpty { parents.insert(pid) }
        if let views = item.splitViews {
            for viewType in supportedViews {
                if let pid = views[viewType]?.splitFromId, !pid.isEmpty { parents.insert(pid) }
            }
        }
        return Array(parents)
    }

    public static func normalizeSplitViewType(_ viewType: String) -> String {
        supportedViews.contains(viewType) ? viewType : defaultView
    }

    public static func createHiddenSplitState() -> SplitViewState {
        SplitViewState(active: false, splitFromId: nil, splitTag: "", musicDuration: "", estDuration: "", sectionIndex: 0)
    }

    /// 保证 splitViews 存在并为两个视图各生成一个拆分状态（缺失的用顶层旧字段做种子）。
    @discardableResult
    public static func ensureItemSplitViews(_ item: inout PoolItem) -> PoolItem {
        if item.splitViews == nil { item.splitViews = SplitViews() }

        let legacySeed = makeState(
            active: true,
            splitFromId: item.splitFromId,
            splitTag: item.splitTag,
            musicDuration: item.musicDuration,
            estDuration: item.estDuration,
            sectionIndex: item.sectionIndex
        )

        for viewType in supportedViews {
            if item.splitViews![viewType] == nil {
                item.splitViews![viewType] = legacySeed
            }
        }
        return item
    }

    /// 取某视图的拆分状态（可能因 ensure 产生副作用）。
    public static func getItemSplitState(_ item: inout PoolItem, _ viewType: String) -> SplitViewState {
        ensureItemSplitViews(&item)
        return item.splitViews![normalizeSplitViewType(viewType)]!
    }

    /// 只读地取某视图拆分状态（不修改条目；缺省时用顶层旧字段构造临时态）。
    public static func peekItemSplitState(_ item: PoolItem, _ viewType: String) -> SplitViewState {
        let normalized = normalizeSplitViewType(viewType)
        if let existing = item.splitViews?[normalized] {
            return existing
        }
        return makeState(
            active: true,
            splitFromId: item.splitFromId,
            splitTag: item.splitTag,
            musicDuration: item.musicDuration,
            estDuration: item.estDuration,
            sectionIndex: item.sectionIndex
        )
    }

    /// 合并 patch 到某视图的拆分状态。
    @discardableResult
    public static func setItemSplitState(_ item: inout PoolItem, _ viewType: String, _ patch: (inout SplitViewState) -> Void) -> SplitViewState {
        var current = getItemSplitState(&item, viewType)
        patch(&current)
        current = makeState(
            active: current.active,
            splitFromId: current.splitFromId,
            splitTag: current.splitTag,
            musicDuration: current.musicDuration,
            estDuration: current.estDuration,
            sectionIndex: current.sectionIndex
        )
        item.splitViews![normalizeSplitViewType(viewType)] = current
        return current
    }

    /// 把时长同步到所有「未隐藏」视图的拆分状态。
    @discardableResult
    public static func syncVisibleSplitDuration(_ item: inout PoolItem, _ musicDuration: String, _ estDuration: String) -> PoolItem {
        ensureItemSplitViews(&item)
        for viewType in supportedViews {
            if item.splitViews![viewType]!.active != false {
                item.splitViews![viewType] = makeState(
                    active: item.splitViews![viewType]!.active,
                    splitFromId: item.splitViews![viewType]!.splitFromId,
                    splitTag: item.splitViews![viewType]!.splitTag,
                    musicDuration: musicDuration,
                    estDuration: estDuration,
                    sectionIndex: item.splitViews![viewType]!.sectionIndex
                )
            }
        }
        return item
    }

    /// 取某视图下「连通且可见」的拆分条目。
    public static func getVisibleConnectedSplitItems(_ items: [PoolItem], _ seedId: String, _ viewType: String) -> [PoolItem] {
        let connected = getConnectedSplitItemIds(items, seedId)
        return items.filter { connected.contains($0.id) && peekItemVisibilityInView($0, viewType) }
    }

    /// 把当前视图的拆分状态同步回顶层旧字段。
    @discardableResult
    public static func syncLegacySplitFields(_ item: inout PoolItem, _ viewType: String) -> PoolItem {
        let state = getItemSplitState(&item, viewType)
        item.splitFromId = state.splitFromId
        item.musicDuration = state.musicDuration
        item.estDuration = state.estDuration
        item.sectionIndex = state.sectionIndex
        if !state.splitTag.isEmpty {
            item.splitTag = state.splitTag
        } else {
            item.splitTag = nil
        }
        return item
    }

    /// 某条目在某视图是否可见（active !== false）。
    public static func isItemVisibleInView(_ item: inout PoolItem, _ viewType: String) -> Bool {
        getItemSplitState(&item, viewType).active != false
    }

    /// 只读地判可见性。
    public static func peekItemVisibilityInView(_ item: PoolItem, _ viewType: String) -> Bool {
        peekItemSplitState(item, viewType).active != false
    }

    /// 把某视图的拆分状态置为隐藏态。
    @discardableResult
    public static func deactivateItemInView(_ item: inout PoolItem, _ viewType: String) -> SplitViewState {
        setItemSplitState(&item, viewType) { $0 = createHiddenSplitState() }
    }

    /// 任一视图仍有可见拆分状态。
    public static func hasVisibleSplitStateInAnyView(_ item: inout PoolItem) -> Bool {
        ensureItemSplitViews(&item)
        return supportedViews.contains { item.splitViews![$0]!.active != false }
    }

    /// 广度遍历，返回与 seedId 连通的所有条目 id（含 seed 自己与父链）。
    public static func getConnectedSplitItemIds(_ items: [PoolItem], _ seedId: String) -> Set<String> {
        var connected = Set<String>()
        var queue = [seedId]

        while !queue.isEmpty {
            let currentId = queue.removeFirst()
            if currentId.isEmpty || connected.contains(currentId) { continue }
            connected.insert(currentId)

            for item in items {
                let parentIds = getItemSplitParentIds(item)
                if item.id == currentId || parentIds.contains(currentId) {
                    if !connected.contains(item.id) { queue.append(item.id) }
                    for pid in parentIds where !connected.contains(pid) { queue.append(pid) }
                }
            }
        }
        return connected
    }
}
