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
    triggerTouchHaptic,
    autoUpdateEfficiency,
  } = actions;

  const isResourceCompleted = (task) => {
    if (!task) return false;

    const currentTab = sidebarTab.value;
    let stat = null;
    let list = [];

    if (currentTab === 'project') {
      list = projectStats.value;
      if (task.projectId) stat = list.find((item) => item.id === task.projectId);
    } else if (currentTab === 'instrument') {
      list = instrumentStats.value;
      if (task.instrumentId) stat = list.find((item) => item.id === task.instrumentId);
    } else {
      list = musicianStats.value;
      if (task.musicianId) stat = list.find((item) => item.id === task.musicianId);
    }

    return stat && stat.statusKey === 'completed';
  };

  const clearPoolRecord = (templateId) => {
    if (!templateId) return;

    const poolItem = itemPool.value.find((item) => item.id === templateId);
    if (poolItem && poolItem.records) {
      ['musician', 'project', 'instrument'].forEach((type) => {
        if (poolItem.records[type]) {
          poolItem.records[type].actualDuration = '';
          poolItem.records[type].recStart = '';
          poolItem.records[type].recEnd = '';
          poolItem.records[type].breakMinutes = 0;
        }
      });

      if (poolItem.musicianId) autoUpdateEfficiency(poolItem.musicianId, 'musician', false);
      if (poolItem.projectId) autoUpdateEfficiency(poolItem.projectId, 'project', false);
    }
  };

  const clearAggregateRecords = (task) => {
    let filterKey = 'musicianId';
    let filterId = task.musicianId;
    let viewType = 'musician';

    if (task.projectId) {
      filterKey = 'projectId';
      filterId = task.projectId;
      viewType = 'project';
    } else if (task.instrumentId) {
      filterKey = 'instrumentId';
      filterId = task.instrumentId;
      viewType = 'instrument';
    }

    const activeSessionId = currentSessionId?.value || 'S_DEFAULT';
    const relatedSchedules = scheduledTasks.value
      .filter((schedule) => (
        (schedule.sessionId || 'S_DEFAULT') === activeSessionId &&
        schedule[filterKey] === filterId
      ))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    const sectionIndex = relatedSchedules.findIndex((schedule) => schedule.scheduleId === task.scheduleId);
    if (sectionIndex === -1) return;

    let hasCleared = false;
    itemPool.value.forEach((item) => {
      if (item[filterKey] !== filterId) return;

      if (item.sectionIndex === sectionIndex && item.records && item.records[viewType]) {
        const record = item.records[viewType];
        if (record.actualDuration || record.recStart) {
          record.actualDuration = '';
          record.recStart = '';
          record.recEnd = '';
          record.breakMinutes = 0;
          hasCleared = true;
        }
      }

      if (item.sectionIndex > sectionIndex) {
        item.sectionIndex--;
      }
    });

    if (hasCleared) {
      autoUpdateEfficiency(filterId, viewType, false);
    }
  };

  const deleteCurrentSchedule = () => {
    const taskToDelete = trackListData.value.taskRef;
    if (!taskToDelete) return;

    if (isResourceCompleted(taskToDelete)) {
      triggerTouchHaptic('Error');
      return openAlertModal('无法删除', '当前归属对象（人员/项目/乐器）已标记为【完成】。\n\n为防止误操作，请先清除该对象下部分曲目的录音数据，使其回到“进行中”状态后再尝试删除。');
    }

    if (taskToDelete.templateId) {
      clearPoolRecord(taskToDelete.templateId);
    } else {
      const currentIdx = trackListData.value.currentSectionIndex;
      const viewType = trackListData.value.viewType || 'musician';

      if (trackListData.value.items) {
        let hasCleared = false;
        let targetId = null;

        trackListData.value.items.forEach((item) => {
          if (item.sectionIndex === currentIdx) {
            if (item.records && item.records[viewType]) {
              if (item.records[viewType].actualDuration || item.records[viewType].recStart) {
                item.records[viewType].actualDuration = '';
                item.records[viewType].recStart = '';
                item.records[viewType].recEnd = '';
                item.records[viewType].breakMinutes = 0;
                hasCleared = true;
              }

              if (!targetId) {
                if (viewType === 'project') targetId = item.projectId;
                else if (viewType === 'instrument') targetId = item.instrumentId;
                else targetId = item.musicianId;
              }
            }
          }
        });

        if (hasCleared && targetId) {
          autoUpdateEfficiency(targetId, viewType, false);
        }
      }
    }

    scheduledTasks.value = scheduledTasks.value.filter((task) => task.scheduleId !== taskToDelete.scheduleId);
    showTrackList.value = false;
    pushHistory();
    triggerTouchHaptic('Medium');
  };

  return {
    isResourceCompleted,
    deleteCurrentSchedule,
    clearPoolRecord,
    clearAggregateRecords,
  };
}
