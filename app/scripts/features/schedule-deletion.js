import { stageStatus } from '../utils/workflow.js';
import { scheduleContext, scheduleMatches, itemMatchesSchedule } from '../utils/schedule-context.js';
import { peekItemSplitState, setItemSplitState } from '../utils/split-state.js';
export function registerScheduleDeletionFeature(context) {
  const { refs, state, actions } = context;
  const {
    itemPool,
    scheduledTasks,
    currentSessionId,
    trackListData,
    showTrackList,
    sidebarTab,
  } = refs;
  const { musicianStats, projectStats, instrumentStats } = state;
  const {
    openAlertModal,
    pushHistory,
    autoUpdateEfficiency,
  } = actions;

  const isResourceCompleted = (task) => {
    if (!task) return false;

    const ctx = scheduleContext(task);
    const related = itemPool.value.filter((item) =>
      (item.sessionId || 'S_DEFAULT') === (task.sessionId || 'S_DEFAULT') &&
      (task.templateId ? item.id === task.templateId : itemMatchesSchedule(item, task)) &&
      peekItemSplitState(item, ctx.view).active !== false && !item.isSkipped);
    if (related.some((item) => item.workflowStatus?.[ctx.stage] !== undefined)) {
      return related.length > 0 && related.every((item) => {
        if (item.workflowStatus?.[ctx.stage] !== undefined) return stageStatus(item, ctx.stage) === 'completed';
        const actual = item.records?.[ctx.view]?.actualDuration;
        return actual && actual.split(':').some((part) => Number(part) > 0);
      });
    }
    const currentTab = ctx.view;
    let stat = null;
    let list = [];

    if (currentTab === 'project') {
      list = projectStats?.value || [];
      if (task.editorId) stat = list.find((item) => item.id === task.editorId);
    } else if (currentTab === 'instrument') {
      list = instrumentStats?.value || [];
      if (task.instrumentId) stat = list.find((item) => item.id === task.instrumentId);
    } else {
      list = musicianStats?.value || [];
      if (task.musicianId) stat = list.find((item) => item.id === task.musicianId);
    }

    return stat && stat.statusKey === 'completed';
  };

  const clearPoolRecord = (templateId, schedule, preserveRecords = false) => {
    if (preserveRecords) return;
    if (!templateId) return;

    const poolItem = itemPool.value.find((item) => item.id === templateId);
    if (poolItem && poolItem.records) {
      [scheduleContext(schedule || { stage: sidebarTab.value === 'project' ? 'edit' : 'rec' }).view].forEach((type) => {
        if (poolItem.records[type]) {
          poolItem.records[type].actualDuration = '';
          poolItem.records[type].recStart = '';
          poolItem.records[type].recEnd = '';
          poolItem.records[type].breakMinutes = 0;
        }
      });

      const ctx = scheduleContext(schedule || { stage: sidebarTab.value === 'project' ? 'edit' : 'rec' });
      const ownerId = ctx.stage === 'edit' ? poolItem.editorId : poolItem.musicianId;
      if (ownerId) autoUpdateEfficiency(ownerId, ctx.view);
    }
  };

  const clearAggregateRecords = (task, preserveRecords = false) => {
    const ctx = scheduleContext(task);
    const viewType = ctx.view;
    const activeSessionId = currentSessionId?.value || 'S_DEFAULT';
    const relatedSchedules = scheduledTasks.value
      .filter((schedule) => (
        (schedule.sessionId || 'S_DEFAULT') === activeSessionId &&
        scheduleMatches(schedule, task)
      ))
      .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.startTime || '').localeCompare(b.startTime || ''));

    const sectionIndex = relatedSchedules.findIndex((schedule) => schedule.scheduleId === task.scheduleId);
    if (sectionIndex === -1) return;

    const changedOwners = new Set();
    itemPool.value.forEach((item) => {
      if ((item.sessionId || 'S_DEFAULT') !== activeSessionId || !itemMatchesSchedule(item, task)) return;
      const splitState = peekItemSplitState(item, viewType);

      if (!preserveRecords && splitState.sectionIndex === sectionIndex && item.records && item.records[viewType]) {
        const record = item.records[viewType];
        if (record.actualDuration || record.recStart) {
          record.actualDuration = '';
          record.recStart = '';
          record.recEnd = '';
          record.breakMinutes = 0;
          const owner = ctx.stage === 'edit' ? item.editorId : item.musicianId;
          if (owner) changedOwners.add(owner);
        }
      }

      if (splitState.sectionIndex > sectionIndex) {
        setItemSplitState(item, viewType, { sectionIndex: splitState.sectionIndex - 1 });
      }
    });

    changedOwners.forEach((owner) => autoUpdateEfficiency(owner, viewType));
  };

  const deleteCurrentSchedule = () => {
    const taskToDelete = trackListData.value.taskRef;
    if (!taskToDelete) return;

    if (isResourceCompleted(taskToDelete)) {
      return openAlertModal('无法删除', '当前归属对象（人员/项目/乐器）已标记为【完成】。\n\n为防止误操作，请先将对应阶段的完成状态改为“进行中”后再尝试删除；旧数据需先清除该阶段的实际记录。');
    }

    if (!taskToDelete.templateId) clearAggregateRecords(taskToDelete, true);

    scheduledTasks.value = scheduledTasks.value.filter((task) => task.scheduleId !== taskToDelete.scheduleId);
    showTrackList.value = false;
    pushHistory();
  };

  return {
    isResourceCompleted,
    deleteCurrentSchedule,
    clearPoolRecord,
    clearAggregateRecords,
  };
}
