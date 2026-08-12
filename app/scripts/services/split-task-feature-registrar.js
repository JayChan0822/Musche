import { registerSplitTaskFeature } from '../features/split-task.js';

export function wireSplitTaskFeature(assembly) {
    const {
        showSplitModal,
        itemPool,
        scheduledTasks,
        trackListData,
        currentSessionId,
        showTrackList,
    } = assembly.refs;
    const { timeUtils, formatUtils, idUtils, splitStateUtils } = assembly.utils;

    const { helpers } = assembly;
    return registerSplitTaskFeature({
        refs: {
            showSplitModal,
            itemPool,
            scheduledTasks,
            trackListData,
            currentSessionId,
            showTrackList,
        },
        split: {
            ...splitStateUtils,
            getSplitViewState: (...args) => assembly.features.splitView.getSplitViewState(...args),
            isItemVisibleInView: (...args) => assembly.features.splitView.isItemVisibleForView(...args),
            peekSplitViewState: (...args) => assembly.features.splitView.peekSplitViewState(...args),
        },
        utils: {
            parseTime: timeUtils.parseTime,
            timeToMinutes: timeUtils.timeToMinutes,
            formatSecs: formatUtils.formatSecs,
            generateUniqueId: idUtils.generateUniqueId,
            calculateEstTime: (...args) => assembly.features.ratio.calculateEstTime(...args),
        },
        actions: {
            getCurrentSplitView: (...args) => assembly.features.splitView.getCurrentSplitView(...args),
            syncItemForView: (...args) => assembly.features.splitView.syncItemForView(...args),
            ensureItemRecords: (...args) => assembly.features.ratio.ensureItemRecords(...args),
            openAlertModal: (...args) => helpers.openAlertModal(...args),
            openInputModal: (...args) => helpers.openInputModal(...args),
            pushHistory: (...args) => helpers.pushHistory(...args),
            autoUpdateEfficiency: (...args) => assembly.features.ratio.autoUpdateEfficiency(...args),
            autoSortTrackList: (...args) => helpers.autoSortTrackList(...args),

        },
    });
}
