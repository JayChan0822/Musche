import { registerRatioFeature } from '../features/ratio.js';

export function createRatioFeatureRegistrar() {
    return function wireRatioFeature(assembly) {
        const {
            trackListData,
            showTrackList,
            sidebarTab,
            itemPool,
            scheduledTasks,
            currentSessionId,
        } = assembly.refs;
        const { settings } = assembly.state;
        const { timeUtils, formatUtils, splitStateUtils } = assembly.utils;
        return registerRatioFeature({
            refs: {
                trackListData,
                showTrackList,
                sidebarTab,
                itemPool,
                scheduledTasks,
                currentSessionId,
                musicianStats: { get value() { return assembly.refs.musicianStats.value; } },
            },
            state: {
                settings,
            },
            utils: {
                parseTime: timeUtils.parseTime,
                formatSecs: formatUtils.formatSecs,
            },
            actions: {
                ensureItemSplitViews: splitStateUtils.ensureItemSplitViews,
                pushHistory: () => assembly.helpers.pushHistory(),
                openConfirmModal: (...args) => assembly.helpers.openConfirmModal(...args),
                openAlertModal: (...args) => assembly.helpers.openAlertModal(...args),
            },
        });
    };
}
