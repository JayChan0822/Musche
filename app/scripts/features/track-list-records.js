// 记录读写：录音起止时间、中断时长、日程块实际时间的计算与回写。
// 从 track-list.js 抽取（2026-08 模块化重构 P2b）。依赖 layout 的 autoResizeScheduleByRecords。
export function createTrackListRecords(deps) {
  const {
    trackListData,
    itemPool,
    scheduledTasks,
    showTrackList,
    formatSecs,
    openInputModal,
    openAlertModal,
    pushHistory,
    autoUpdateEfficiency,
    checkCanDeleteSplit,
    restoreSplitTime,
    pruneEmptySchedules,
    getViewType,
    getTargetId,
    autoResizeScheduleByRecords,
  } = deps;

  let trackSaveTimer = null;

  const calcTrackDiff = (item) => {
    const viewType = getViewType();
    const record = item.records[viewType];
    if (!record) return;

    if (record.recStart && record.recEnd) {
      const [sh, sm] = record.recStart.split(':').map(Number);
      const [eh, em] = record.recEnd.split(':').map(Number);

      let startMins = sh * 60 + sm;
      let endMins = eh * 60 + em;

      if (endMins < startMins) endMins += 24 * 60;

      let diffMins = endMins - startMins;

      if (record.breakMinutes && record.breakMinutes > 0) {
        diffMins -= parseInt(record.breakMinutes);
      }

      if (diffMins < 0) diffMins = 0;
      const diffSecs = diffMins * 60;

      record.actualDuration = formatSecs(diffSecs);

      saveTrackRecord(item);
      autoResizeScheduleByRecords(true);
    }
  };

  const setTrackBreak = (item) => {
    const viewType = getViewType();
    const record = item.records[viewType];

    openInputModal(
      '设置中断/休息时长',
      record.breakMinutes ? String(record.breakMinutes) : '',
      '请输入分钟数',
      (val) => {
        const mins = parseInt(val);
        record.breakMinutes = (Number.isNaN(mins) || mins < 0) ? 0 : mins;
        calcTrackDiff(item);
        pushHistory();
      },
      '这段时间将从总录制时长中扣除',
    );
  };

  const deleteTrackFromList = (itemToDelete) => {
    if (!checkCanDeleteSplit(itemToDelete)) return;

    const shouldRemoveTask = restoreSplitTime(itemToDelete);

    if (shouldRemoveTask) {
      itemPool.value = itemPool.value.filter((item) => item.id !== itemToDelete.id);
    }

    trackListData.value.items = trackListData.value.items.filter(
      (item) => item.id !== itemToDelete.id,
    );

    if (showTrackList.value) {
      pushHistory();
    }
  };

  const autoCalcDuration = () => {
    const start = trackListData.value.actualStart;
    const end = trackListData.value.actualEnd;

    if (start && end) {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);

      let startMins = sh * 60 + sm;
      let endMins = eh * 60 + em;

      if (endMins < startMins) endMins += 24 * 60;

      const diffSecs = (endMins - startMins) * 60;
      trackListData.value.actualDuration = formatSecs(diffSecs);
    }
  };

  const saveScheduleActualTime = () => {
    const currentScheduleId = trackListData.value.taskRef.scheduleId;
    if (!currentScheduleId) return;

    scheduledTasks.value = scheduledTasks.value.map((task) => {
      if (task.scheduleId === currentScheduleId) {
        return {
          ...task,
          actualStartTime: trackListData.value.actualStart,
          actualEndTime: trackListData.value.actualEnd,
          actualDuration: trackListData.value.actualDuration,
        };
      }
      return task;
    });

    pushHistory();
    openAlertModal('✅ 录音时间已保存！\n该演奏员的「真实平均比值」已在侧边栏自动更新。');
  };

  const saveTrackActual = (item) => {
    const task = scheduledTasks.value.find((entry) => entry.scheduleId === item.scheduleId);
    if (task) {
      task.actualDuration = item.actualDuration;
      scheduledTasks.value = [...scheduledTasks.value];
    }
  };

  const syncTrackItemScheduleSection = (item, previousSectionIndex = null) => {
    if (!item || !trackListData.value?.schedules) return false;

    let sectionIndex = parseInt(item.sectionIndex, 10);
    if (Number.isNaN(sectionIndex)) sectionIndex = 0;

    const targetSchedule = trackListData.value.schedules[sectionIndex];
    if (!targetSchedule) return false;

    let didUpdate = false;
    const exactSchedule = scheduledTasks.value.find((task) => task.templateId === item.id);

    if (exactSchedule) {
      if (exactSchedule.date !== targetSchedule.date) {
        exactSchedule.date = targetSchedule.date;
        didUpdate = true;
      }
      if (exactSchedule.startTime !== targetSchedule.startTime) {
        exactSchedule.startTime = targetSchedule.startTime;
        didUpdate = true;
      }

    }

    if (
      !exactSchedule &&
      previousSectionIndex !== null &&
      previousSectionIndex !== sectionIndex &&
      typeof pruneEmptySchedules === 'function'
    ) {
      pruneEmptySchedules();
      didUpdate = true;
    }

    return didUpdate;
  };

  const setTrackNow = (item, type) => {
    const viewType = getViewType();
    const record = item.records[viewType];

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (type === 'start') record.recStart = timeStr;
    if (type === 'end') record.recEnd = timeStr;

    calcTrackDiff(item);
    pushHistory();
  };

  const saveTrackRecord = (item) => {
    if (trackSaveTimer) clearTimeout(trackSaveTimer);
    trackSaveTimer = setTimeout(() => {
      const viewType = getViewType();
      const targetId = getTargetId(item, viewType);

      autoUpdateEfficiency(targetId, viewType);
    }, 1500);
  };

  const clearTrackTime = (item) => {
    const viewType = getViewType();
    const record = item.records[viewType];

    record.recStart = '';
    record.recEnd = '';
    record.actualDuration = '';

    autoResizeScheduleByRecords(true);

    const targetId = getTargetId(item, viewType);
    autoUpdateEfficiency(targetId, viewType);

    pushHistory();
  };

  return {
    calcTrackDiff,
    setTrackBreak,
    deleteTrackFromList,
    autoCalcDuration,
    saveScheduleActualTime,
    saveTrackActual,
    syncTrackItemScheduleSection,
    setTrackNow,
    saveTrackRecord,
    clearTrackTime,
  };
}
