import { registerScheduleInteractionsFeature } from '../features/schedule-interactions.js';

export function createScheduleInteractionsFeatureRegistrar() {
    return function wireScheduleInteractionsFeature(assembly) {
        const {
            scheduledTasks,
            itemPool,
            pxPerMin,
            sidebarTab,
            currentSessionId,
            isMobile,
            trackListData,
            showTrackList,
            trackListContainerRef,
            isContextSwitching,
        } = assembly.refs;
        const { settings } = assembly.state;
        const { timeUtils, formatUtils, splitStateUtils } = assembly.utils;

        const { helpers } = assembly;
        return registerScheduleInteractionsFeature({
            refs: {
                scheduledTasks,
                itemPool,
                pxPerMin,
                sidebarTab,
                currentSessionId,
                isMobile,
                trackListData,
                showTrackList,
                trackListContainerRef,
            },
            state: {
                settings,
            },
            utils: {
                parseTime: timeUtils.parseTime,
                formatSecs: formatUtils.formatSecs,
            },
            actions: {
                checkOverlap: (...args) => helpers.checkOverlap(...args),
                openAlertModal: (...args) => helpers.openAlertModal(...args),

                pushHistory: (...args) => helpers.pushHistory(...args),
                isResourceCompleted: (...args) => helpers.isResourceCompleted(...args),
                clearPoolRecord: (...args) => helpers.clearPoolRecord(...args),
                clearAggregateRecords: (...args) => helpers.clearAggregateRecords(...args),
                isContextSwitchingActive: () => isContextSwitching.value,
                isTaskGhost: (...args) => assembly.features.schedule.isTaskGhost(...args),
                jumpToGhostContext: (...args) => assembly.features.viewNavigation.jumpToGhostContext(...args),
                normalizeSplitViewType: splitStateUtils.normalizeSplitViewType,
                isItemVisibleForView: (...args) => assembly.features.splitView.isItemVisibleForView(...args),
                syncItemForView: (...args) => assembly.features.splitView.syncItemForView(...args),
                ensureItemRecords: (...args) => assembly.features.ratio.ensureItemRecords(...args),
                getNameById: (...args) => assembly.features.nameLookup.getNameById(...args),
                autoSortTrackList: (...args) => helpers.autoSortTrackList(...args),
                preloadTrackList: () => { helpers.getTrackListFeature(); },
            },
        });
    };
}
