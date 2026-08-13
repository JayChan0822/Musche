import { registerHistoryFeature } from '../features/history.js';

export function wireHistoryFeature(assembly) {
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
            // track-list 是懒加载 feature，经 assembly.helpers 延迟取值：
            // undo/redo 时取消未触发的录音写回 debounce，避免 1.5s 后
            // 的 pushHistory 截断 redo 分支（见 93e045f 的竞态评估）。
            cancelPendingTrackSave: () => assembly.helpers.cancelPendingTrackSave?.(),
        },
    });
}
