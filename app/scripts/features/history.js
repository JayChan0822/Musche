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
  const {
    isItemVisibleForView,
    syncItemsForView,
    reopenTrackListForTask,
    cancelPendingTrackSave = () => {},
    // 快照真的入栈后通知（空改动早退不会走到这里）——手机端据此浮出撤销条
    onHistoryPushed = () => {},
  } = actions;

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
    const snapshot = JSON.stringify({
      pool: itemPool.value,
      tasks: scheduledTasks.value,
      settings,
    });

    // 空快照保护：与当前索引处快照字节相同则跳过。
    // 必须放在分支截断之前——否则 no-op push 照样会先砍掉 redo 分支，
    // 再因去重早退，redo 分支就白白丢了（debounce 无变化写回场景）。
    if (history.value[historyIndex.value] === snapshot) return;

    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }

    history.value.push(snapshot);

    historyIndex.value++;
    if (history.value.length > 50) {
      history.value.shift();
      historyIndex.value--;
    }

    onHistoryPushed();
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
