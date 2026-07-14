import { registerSidebarStatsFeature } from '../features/sidebar-stats.js';

export function createSidebarStatsFeatureRegistrar() {
    return function wireSidebarStatsFeature(assembly) {
        const {
            itemPool,
            scheduledTasks,
            currentSessionId,
            globalSearchQuery,
            sidebarTab,
            sortField,
            sortAsc,
            statClickIndexMap,
            isMobile,
            expandedGroups,
        } = assembly.refs;
        const { settings } = assembly.state;
        const { timeUtils, formatUtils } = assembly.utils;

        return registerSidebarStatsFeature({
            refs: {
                itemPool,
                scheduledTasks,
                currentSessionId,
                globalSearchQuery,
                sidebarTab,
                sortField,
                sortAsc,
                statClickIndexMap,
                isMobile,
                expandedGroups,
            },
            state: {
                settings,
            },
            utils: {
                parseTime: timeUtils.parseTime,
                formatSecs: formatUtils.formatSecs,
                calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
                getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                getFullSearchText: (...args) => assembly.features.search.getFullSearchText(...args),
                smartMatch: (...args) => assembly.features.search.smartMatch(...args),
                isItemVisibleForView: (...args) => assembly.features.splitView.isItemVisibleForView(...args),
                peekSplitViewState: (...args) => assembly.features.splitView.peekSplitViewState(...args),
            },
            actions: {
                pushHistory: (...args) => assembly.helpers.pushHistory(...args),
                openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
                smartScrollToTask: (...args) => assembly.features.viewNavigation.smartScrollToTask(...args),

            },
        });
    };
}
