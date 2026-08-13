function getTrackListItemsForView({ itemPool, trackListData, currentSessionId, isItemVisibleForView }) {
  const viewType = trackListData.value.viewType || 'musician';
  const taskRef = trackListData.value.taskRef;

  let list = [];
  if (viewType === 'project') {
    list = itemPool.value.filter((item) => (
      item.projectId === taskRef.projectId &&
      (item.sessionId || 'S_DEFAULT') === currentSessionId.value &&
      isItemVisibleForView(item, viewType)
    ));
  } else if (viewType === 'instrument') {
    list = itemPool.value.filter((item) => (
      item.instrumentId === taskRef.instrumentId &&
      (item.sessionId || 'S_DEFAULT') === currentSessionId.value &&
      isItemVisibleForView(item, viewType)
    ));
  } else {
    list = itemPool.value.filter((item) => (
      item.musicianId === taskRef.musicianId &&
      (item.sessionId || 'S_DEFAULT') === currentSessionId.value &&
      isItemVisibleForView(item, viewType)
    ));
  }

  return { list, viewType };
}

function sortTrackListItems(items, viewType) {
  items.sort((a, b) => {
    const secA = a.sectionIndex || 0;
    const secB = b.sectionIndex || 0;
    if (secA !== secB) return secA - secB;

    const recA = a.records?.[viewType];
    const recB = b.records?.[viewType];
    const tA = recA?.recStart || '99:99';
    const tB = recB?.recStart || '99:99';
    return tA.localeCompare(tB);
  });
}

export function registerHistoryFeature(context) {
  const { refs, state, actions } = context;
  const {
    itemPool,
    scheduledTasks,
    history,
    historyIndex,
    showTrackList,
    trackListData,
    currentSessionId,
  } = refs;
  const { settings } = state;
  const { isItemVisibleForView, syncItemsForView, reopenTrackListForTask, cancelPendingTrackSave = () => {} } = actions;

  const refreshTrackList = () => {
    if (!showTrackList.value || !trackListData.value.taskRef) return;

    if (typeof reopenTrackListForTask === 'function') {
      const activeScheduleId = trackListData.value.taskRef.scheduleId;
      const restoredTask = scheduledTasks.value.find((task) => (
        String(task.scheduleId) === String(activeScheduleId)
      ));

      if (restoredTask) {
        reopenTrackListForTask(restoredTask);
      } else {
        showTrackList.value = false;
        trackListData.value = null;
      }
      return;
    }

    const { list, viewType } = getTrackListItemsForView({
      itemPool,
      trackListData,
      currentSessionId,
      isItemVisibleForView,
    });

    syncItemsForView(list, viewType);
    sortTrackListItems(list, viewType);
    trackListData.value.items = list;
  };

  const pushHistory = () => {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }

    const snapshot = JSON.stringify({
      pool: itemPool.value,
      tasks: scheduledTasks.value,
      settings,
    });

    // 空快照保护：与当前索引处快照字节相同则跳过。
    // 避免 debounce 写回无变化时推出重复快照——那会让第一次 Ctrl+Z
    // 界面无反应（撤到同一状态），50 条上限下撤销深度直接减半。
    if (history.value[historyIndex.value] === snapshot) return;

    history.value.push(snapshot);

    historyIndex.value++;
    if (history.value.length > 50) {
      history.value.shift();
      historyIndex.value--;
    }
  };

  const undo = () => {
    cancelPendingTrackSave();
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const snapshot = JSON.parse(history.value[historyIndex.value]);
      itemPool.value = snapshot.pool;
      scheduledTasks.value = snapshot.tasks;

      if (snapshot.settings) {
        Object.assign(settings, snapshot.settings);
      }

      refreshTrackList();
    }
  };

  const redo = () => {
    cancelPendingTrackSave();
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      const snapshot = JSON.parse(history.value[historyIndex.value]);
      itemPool.value = snapshot.pool;
      scheduledTasks.value = snapshot.tasks;

      if (snapshot.settings) {
        Object.assign(settings, snapshot.settings);
      }

      refreshTrackList();
    }
  };

  return {
    pushHistory,
    undo,
    redo,
  };
}
