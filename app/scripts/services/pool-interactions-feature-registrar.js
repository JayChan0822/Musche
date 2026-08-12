import { registerPoolInteractionsFeature } from '../features/pool-interactions.js';

export function wirePoolInteractionsFeature(assembly) {
    const {
        selectedSource,
        selectedTaskId,
        selectedPoolIds,
        lastPoolFocusId,
        lastPoolClickId,
        itemPool,
        scheduledTasks,
        currentSessionId,
        sidebarTab,
        isSidebarOpen,
        isMobile,
        expandedGroups,
    } = assembly.refs;

    return registerPoolInteractionsFeature({
        refs: {
            selectedSource,
            selectedTaskId,
            selectedPoolIds,
            lastPoolFocusId,
            lastPoolClickId,
            itemPool,
            scheduledTasks,
            currentSessionId,
            sidebarTab,
            isSidebarOpen,
            isMobile,
        },
        actions: {
            getGroupedItemPool: () => assembly.refs.groupedItemPool.value,
            getCurrentSidebarList: () => assembly.refs.currentSidebarList.value,
            isGroupExpanded: (key) => expandedGroups.has(key),
            isStatExpanded: (id) => assembly.refs.expandedStatsIds.has(id),
            scrollToSidebarItem: (...args) => assembly.features.sidebar.scrollToSidebarItem(...args),
            smartScrollToTask: (...args) => assembly.features.viewNavigation.smartScrollToTask(...args),

        },
    });
}
