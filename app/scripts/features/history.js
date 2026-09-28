import { hasStableScheduleLinks, resolveItemSchedule, projectItemSection } from '../utils/stable-schedule.js';
import { scheduleContext, itemMatchesSchedule, scheduleMatches } from '../utils/schedule-context.js';
import { serializeWorkflowContent, rememberWorkflowContent } from '../utils/workflow-migration.js';
function getTrackListItemsForView({ settings, itemPool, trackListData, currentSessionId, isItemVisibleForView }) {
  const taskRef = trackListData.value.taskRef;
  const context = scheduleContext(taskRef);
  const viewType = context.view;
  const list = itemPool.value.filter((item) => (
    (hasStableScheduleLinks(settings) ? !!resolveItemSchedule(settings, item, viewType, trackListData.value.schedules || []) : itemMatchesSchedule(item, taskRef)) &&
    (item.sessionId || 'S_DEFAULT') === currentSessionId.value &&
    isItemVisibleForView(item, viewType)
  ));

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

    const restoredTask = scheduledTasks.value.find(task => String(task.scheduleId) === String(trackListData.value.taskRef.scheduleId));
    if (hasStableScheduleLinks(settings)) {
      if (!restoredTask) { showTrackList.value = false; trackListData.value = null; return; }
      const schedules = scheduledTasks.value.filter(task => (task.sessionId || 'S_DEFAULT') === currentSessionId.value && scheduleMatches(task, restoredTask))
        .sort((a,b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
      Object.assign(trackListData.value, { taskRef: restoredTask, schedules, totalSections: schedules.length,
        currentSectionIndex: schedules.indexOf(restoredTask) });
    }
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
      settings,
      itemPool,
      trackListData,
      currentSessionId,
      isItemVisibleForView,
    });

    syncItemsForView(list, viewType);
    if (hasStableScheduleLinks(settings)) list.forEach(item => projectItemSection(settings, item, viewType, trackListData.value.schedules));
    sortTrackListItems(list, viewType);
    trackListData.value.items = list;
  };

  const pushHistory = () => {
    const snapshot = JSON.stringify(serializeWorkflowContent(settings, itemPool.value, scheduledTasks.value));

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
      rememberWorkflowContent(settings, snapshot);
      itemPool.value = snapshot.pool;
      scheduledTasks.value = snapshot.tasks;

      if (snapshot.settings) {
        Object.assign(settings, snapshot.settings);
      }
      if (settings.sessions?.length && !settings.sessions.some(session => session.id === currentSessionId.value)) {
        currentSessionId.value = settings.sessions[0].id;
      }

      refreshTrackList();
    }
  };

  const redo = () => {
    cancelPendingTrackSave();
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      const snapshot = JSON.parse(history.value[historyIndex.value]);
      rememberWorkflowContent(settings, snapshot);
      itemPool.value = snapshot.pool;
      scheduledTasks.value = snapshot.tasks;

      if (snapshot.settings) {
        Object.assign(settings, snapshot.settings);
      }
      if (settings.sessions?.length && !settings.sessions.some(session => session.id === currentSessionId.value)) {
        currentSessionId.value = settings.sessions[0].id;
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
