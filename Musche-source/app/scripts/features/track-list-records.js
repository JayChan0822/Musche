import { getScheduleStage, stageFromView, getAssigneeId } from '../utils/workflow.js';
import { ensureWorkflowLedger, getWorkLogs, getActiveWorkLog, appendWorkLog, updateWorkLog, invalidateWorkLog, setActiveWorkLog, hydrateWorkRecord, getPartAllocation } from '../utils/workflow-ledger.js';
import { assignItemSchedule, resolveItemSchedule } from '../utils/stable-schedule.js';
// 记录读写：录音起止时间、中断时长、日程块实际时间的计算与回写。
// 实际记录独立保存；录入起止时间后按稳定关联更新对应日程块。
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
    autoResizeScheduleByRecords = () => {},
    checkCanDeleteSplit,
    restoreSplitTime,
    pruneEmptySchedules,
    getViewType,
    getTargetId,
    getNameById,
    settings,
  } = deps;

  let trackSaveTimer = null;
  const ensureLedger = () => settings && ensureWorkflowLedger(settings, itemPool.value, scheduledTasks.value, { bootstrap: !settings.workflow });
  const workAttempts = (item) => settings ? getWorkLogs(settings, item, stageFromView(getViewType())) : [];

  const syncRecordStatus = (item, viewType = getViewType()) => {
    const stage = stageFromView(viewType);
    if (item.isSkipped || item.workflowStatus?.[stage] === 'not-required') return;
    const logs = settings ? getWorkLogs(settings, item, stage) : [];
    const record = settings ? logs.at(-1) : item.records?.[viewType];
    const validTime = value => /^([01]?\d|2[0-3]):[0-5]\d$/.test(value || '');
    const hasDuration = /^\d{1,3}:[0-5]\d(?::[0-5]\d)?$/.test(record?.actualDuration || '') &&
      record.actualDuration.split(':').some(value => Number(value) > 0);
    const complete = (validTime(record?.recStart) && validTime(record?.recEnd)) || hasDuration;
    const status = complete ? 'completed' : validTime(record?.recStart) || validTime(record?.recEnd) || logs.length > 0 ? 'in-progress' : 'not-started';
    item.workflowStatus = { ...(item.workflowStatus || {}), [stage]: status };
    const part = settings?.workflow?.workParts.find(part => part.poolItemId === item.id && part.sessionId === (item.sessionId || 'S_DEFAULT') && part.stage === stage);
    if (part) part.status = status;
  };

  const writeCurrentAttempt = (item, viewType = getViewType()) => {
    if (!settings) { syncRecordStatus(item, viewType); return; }
    ensureLedger();
    const stage = stageFromView(viewType);
    const record = item.records?.[viewType];
    if (!record) return;
    const active = getActiveWorkLog(settings, item, stage);
    if (active) {
      updateWorkLog(settings, active.id, record);
    } else if (record.recStart || record.recEnd || record.actualDuration || record.date) {
      appendWorkLog(settings, item, stage, record);
    }
    syncRecordStatus(item, viewType);
  };

  const startNewWorkAttempt = (item) => {
    if (!settings) return;
    cancelPendingTrackSave();
    captureRecordIdentity(item);
    writeCurrentAttempt(item);
    const stage = stageFromView(getViewType());
    const allocation = getPartAllocation(settings, item, stage);
    const schedule = scheduledTasks.value.find((block) => block.scheduleId === allocation?.scheduleId);
    appendWorkLog(settings, item, stage, {
      recStart: '', recEnd: '', actualDuration: '', breakMinutes: 0,
      assigneeId: getAssigneeId(item, stage),
      assigneeName: getNameById?.(getAssigneeId(item, stage), 'musician') || '',
      date: schedule?.date || '', recordingInfo: item.recordingInfo || schedule?.recordingInfo || {}, editInfo: item.editInfo || schedule?.editInfo || {},
    });
    hydrateWorkRecord(settings, item, stage);
    syncRecordStatus(item);
    pushHistory();
  };

  const selectWorkAttempt = (item, id) => {
    if (!settings) return;
    cancelPendingTrackSave();
    captureRecordIdentity(item);
    writeCurrentAttempt(item);
    setActiveWorkLog(settings, item, stageFromView(getViewType()), id);
    pushHistory();
  };

  const saveWorkAttempt = (item) => {
    const record = item.records?.[getViewType()];
    if (record?.actualDuration && !/^\d{1,3}:[0-5]\d(?::[0-5]\d)?$/.test(record.actualDuration.trim())) {
      openAlertModal('耗时格式错误', '请输入 MM:SS 或 HH:MM:SS。');
      if (settings) hydrateWorkRecord(settings, item, stageFromView(getViewType()));
      return;
    }
    captureRecordIdentity(item);
    writeCurrentAttempt(item);
    cancelPendingTrackSave();
    pushHistory();
  };

  const cancelPendingTrackSave = () => {
    if (trackSaveTimer) {
      clearTimeout(trackSaveTimer);
      trackSaveTimer = null;
    }
  };

  const captureRecordIdentity = (item, viewType = getViewType()) => {
    const record = item.records?.[viewType];
    if (!record) return;
    const hasStarted = /^\d{1,2}:\d{2}$/.test(record.recStart || '');
    const hasActual = (record.actualDuration || '').split(':').some((part) => Number(part) > 0);
    if (!hasStarted && !hasActual) return;
    const stage = stageFromView(viewType);
    const assigneeId = getAssigneeId(item, stage);
    if (!Object.prototype.hasOwnProperty.call(record, 'assigneeId')) {
      record.assigneeId = assigneeId;
      if (getNameById && assigneeId) record.assigneeName = getNameById(assigneeId, 'musician');
    }
    if (!record.musicDuration && item.musicDuration) record.musicDuration = item.musicDuration;
    const data = trackListData.value;
    const schedule = settings?.workflow?.version === 11
      ? resolveItemSchedule(settings, item, viewType, data.schedules || [])
      : data.schedules?.[Number(item.sectionIndex) || 0] || data.taskRef;
    if (!record.date && schedule?.date && getScheduleStage(schedule) === stage) record.date = schedule.date;
    if (!record.recordingInfo) record.recordingInfo = { ...(item.recordingInfo || schedule?.recordingInfo || {}) };
    if (!record.editInfo) record.editInfo = { ...(item.editInfo || schedule?.editInfo || {}) };
  };

  const calcTrackDiff = (item) => {
    const viewType = getViewType();
    const record = item.records[viewType];
    if (!record) return;
    captureRecordIdentity(item, viewType);

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
    } else {
      record.actualDuration = '';
      saveTrackRecord(item);
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

    if (settings?.workflow?.version === 11) {
      assignItemSchedule(settings, item, getViewType(), targetSchedule, sectionIndex);
      return true;
    }

    let didUpdate = false;
    const exactSchedule = scheduledTasks.value.find((task) => task.templateId === item.id && getScheduleStage(task) === stageFromView(getViewType()) && (task.sessionId || 'S_DEFAULT') === (targetSchedule.sessionId || 'S_DEFAULT'));

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
    captureRecordIdentity(item);
    writeCurrentAttempt(item);
    autoResizeScheduleByRecords(true);
    if (trackSaveTimer) clearTimeout(trackSaveTimer);
    const viewType = getViewType();
    const targetId = getTargetId(item, viewType);
    trackSaveTimer = setTimeout(() => {

      autoUpdateEfficiency(targetId, viewType);
      // debounce 写回发生在 pushHistory 快照之外（calcTrackDiff 不推历史），
      // 不推一条会让 1.5s 后的 ratio/estDuration 落进撤销盲区，Ctrl+Z 救不回。
      pushHistory();
    }, 1500);
  };

  const clearTrackTime = (item) => {
    const viewType = getViewType();
    if (settings?.workflow?.version === 11) {
      cancelPendingTrackSave();
      const active = getActiveWorkLog(settings, item, stageFromView(viewType));
      if (active) invalidateWorkLog(settings, active.id);
      setActiveWorkLog(settings, item, stageFromView(viewType), null);
      syncRecordStatus(item, viewType);
      pushHistory();
      return;
    }
    const record = item.records[viewType];

    record.recStart = '';
    record.recEnd = '';
    record.actualDuration = '';
    delete record.assigneeId;
    delete record.assigneeName;
    delete record.musicDuration;
    delete record.date;
    syncRecordStatus(item, viewType);


    const targetId = getTargetId(item, viewType);
    autoUpdateEfficiency(targetId, viewType);

    pushHistory();
  };

  return {
    workAttempts,
    startNewWorkAttempt,
    selectWorkAttempt,
    saveWorkAttempt,
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
    cancelPendingTrackSave,
  };
}
