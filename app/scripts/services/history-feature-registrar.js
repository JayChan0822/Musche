import { registerHistoryFeature } from '../features/history.js';

export function createHistoryFeatureRegistrar() {
    return function wireHistoryFeature(assembly) {
        const {
            itemPool,
            scheduledTasks,
            history,
            historyIndex,
            showTrackList,
            trackListData,
            currentSessionId,
        } = assembly.refs;
        const { settings } = assembly.state;
        return registerHistoryFeature({
            refs: {
                itemPool,
                scheduledTasks,
                history,
                historyIndex,
                showTrackList,
                trackListData,
                currentSessionId,
            },
            state: {
                settings,
            },
            actions: {
                isItemVisibleForView: (...args) => assembly.features.splitView.isItemVisibleForView(...args),
                syncItemsForView: (...args) => assembly.features.splitView.syncItemsForView(...args),
                reopenTrackListForTask: (task) => assembly.features.scheduleInteractions.openTrackListForTask(task),
            },
        });
    };
}
