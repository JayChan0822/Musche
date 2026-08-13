import { formatClock } from '../utils/time.js';

export function registerScheduleDragDropFeature(context) {
  const { refs, state, utils, actions = {} } = context;
  const { scheduledTasks, pxPerMin, sidebarTab, currentSessionId, isMobile } = refs;
  const { settings } = state;
  const { formatSecs } = utils;
  const {
    getDocument = () => document,
    getDocumentBody = () => document.body,
    setTimeout: setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    getNow = () => Date.now(),
    checkOverlap = () => false,
    openAlertModal = () => {},
    pushHistory = () => {},
    isResourceCompleted = () => false,
    clearPoolRecord = () => {},
    clearAggregateRecords = null,
    consoleError = (...args) => console.error(...args),
  } = actions;

  let draggedData = null;

  const clearDragOver = (selector) => {
    getDocument().querySelectorAll(selector).forEach((element) => element.classList.remove('drag-over'));
  };

  const getTaskType = (task) => {
    if (task.projectId) return 'project';
    if (task.instrumentId) return 'instrument';
    return 'musician';
  };

  const buildAggregateDuration = (item) => {
    const remainingSecs = item.totalSeconds - item.scheduledSeconds;
    if (remainingSecs <= 0) return null;
    let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
    if (remainingMins === 0) remainingMins = 30;
    return formatSecs(remainingMins * 60);
  };

  const dragStart = (event, item, source) => {
    let offsetMinutes = 0;

    if (source === 'schedule' && event.target) {
      const rect = event.target.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      const rawMinutes = offsetY / pxPerMin.value;
      offsetMinutes = Math.floor(rawMinutes / 30) * 30;
    }

    draggedData = { item, source, isCopy: event.altKey, offsetMinutes };
    event.dataTransfer.effectAllowed = 'move';

    if (source === 'schedule' && event.target) {
      const clone = event.target.cloneNode(true);
      clone.classList.remove('is-selected');
      clone.style.setProperty('opacity', '0.4', 'important');
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.zIndex = '9999';
      clone.style.width = `${event.target.offsetWidth}px`;
      getDocumentBody().appendChild(clone);

      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      event.dataTransfer.setDragImage(clone, offsetX, offsetY);

      setTimeoutFn(() => {
        getDocumentBody().removeChild(clone);
        event.target.classList.add('pointer-events-none');
        event.target.style.transition = 'none';
        event.target.style.opacity = '0';
      }, 0);
    }
  };

  const handleDragEnd = (event) => {
    if (event.target) {
      event.target.classList.remove('pointer-events-none');
      event.target.style.opacity = '';
      event.target.style.transition = '';
    }
    draggedData = null;
  };

  const dragEnterPool = (event) => event.currentTarget.classList.add('drag-over');
  const dragLeavePool = (event) => event.currentTarget.classList.remove('drag-over');

  const dropToPool = async (event) => {
    event.currentTarget.classList.remove('drag-over');
    if (!draggedData) return;

    if (draggedData.source === 'schedule') {
      const taskToDelete = draggedData.item;

      if (await isResourceCompleted(taskToDelete)) {
        draggedData = null;
        return openAlertModal('操作被拒绝', '该任务所属对象已处于【完成】状态，禁止移回任务池。');
      }

      if (taskToDelete.templateId) {
        await clearPoolRecord(taskToDelete.templateId);
      } else if (typeof clearAggregateRecords === 'function') {
        await clearAggregateRecords(taskToDelete);
      } else {
        consoleError('找不到 clearAggregateRecords 函数，无法清理聚合数据');
      }

      scheduledTasks.value = scheduledTasks.value.filter((task) => task.scheduleId !== taskToDelete.scheduleId);

      pushHistory();
    }

    draggedData = null;
  };

  const dragEnterSlot = (event) => {
    const slot = event.target.closest('.droppable-slot');
    if (slot) slot.classList.add('drag-over');
  };

  const dragLeaveSlot = (event) => {
    const slot = event.target.closest('.droppable-slot');
    if (slot) slot.classList.remove('drag-over');
  };

  const dropToSchedule = (event, dateStr) => {
    clearDragOver('.grid-slot.drag-over');

    if (!draggedData) return;

    const colEl = event.target.closest('[data-date-str]');
    if (!colEl) return;

    const container = colEl.querySelector('.relative[style*="min-height"]');
    if (!container) return;

    const { item, source, offsetMinutes } = draggedData;
    const rect = container.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;

    let adjustY = relativeY;
    if (source === 'schedule' && offsetMinutes) {
      adjustY -= offsetMinutes * pxPerMin.value;
    }

    const rawMins = adjustY / pxPerMin.value;
    const totalMins = settings.startHour * 60 + rawMins;
    let snappedMins = Math.round(totalMins / 30) * 30;

    const minStart = settings.startHour * 60;
    const maxStart = settings.endHour * 60 - 30;
    snappedMins = Math.max(minStart, Math.min(maxStart, snappedMins));

    const newStartTime = formatClock(Math.floor(snappedMins / 60), snappedMins % 60);

    let checkType = 'musician';
    let newDuration = '';
    let excludeId = null;

    if (source === 'aggregate') {
      checkType = sidebarTab.value;
      newDuration = buildAggregateDuration(item);
      if (!newDuration) {
        pushHistory();
        draggedData = null;
        return;
      }
    } else if (source === 'schedule') {
      checkType = getTaskType(item);
      newDuration = item.estDuration;
      excludeId = item.scheduleId;
    } else if (source === 'pool') {
      checkType = getTaskType(item);
      newDuration = item.estDuration;
    }

    if (checkOverlap(dateStr, newStartTime, newDuration, excludeId, checkType)) {
      openAlertModal('时间冲突', '该时间段已有同类型的其他安排。');
      draggedData = null;
      return;
    }

    if (source === 'aggregate') {
      const newTask = {
        scheduleId: getNow(),
        sessionId: currentSessionId.value,
        musicianId: sidebarTab.value === 'musician' ? item.id : '',
        projectId: sidebarTab.value === 'project' ? item.id : '',
        instrumentId: sidebarTab.value === 'instrument' ? item.id : '',
        date: dateStr,
        startTime: newStartTime,
        estDuration: newDuration,
        trackCount: item.trackCount,
        ratio: item.defaultRatio || 20,
      };
      scheduledTasks.value.push(newTask);
    } else if (source === 'schedule') {
      const index = scheduledTasks.value.findIndex((task) => task.scheduleId === item.scheduleId);
      if (index !== -1) {
        const newTask = JSON.parse(JSON.stringify(item));
        newTask.date = dateStr;
        newTask.startTime = newStartTime;
        scheduledTasks.value[index] = newTask;
      }
    } else if (source === 'pool') {
      const newTask = {
        scheduleId: getNow(),
        templateId: item.id,
        sessionId: currentSessionId.value,
        projectId: item.projectId,
        instrumentId: item.instrumentId,
        musicianId: item.musicianId,
        musicDuration: item.musicDuration,
        ratio: item.ratio,
        estDuration: item.estDuration,
        date: dateStr,
        startTime: newStartTime,
      };
      scheduledTasks.value.push(newTask);
    }

    pushHistory();
    draggedData = null;
  };

  const dropToMonth = (event, dateStr) => {
    clearDragOver('.droppable-slot.drag-over');
    if (!draggedData) return;

    const { item, source } = draggedData;

    let targetStartTime = formatClock(settings.startHour);
    let targetDuration = '';
    let excludeId = null;
    let checkType = 'musician';

    if (source === 'aggregate') {
      checkType = sidebarTab.value;
    } else {
      checkType = getTaskType(item);
    }

    if (source === 'schedule') {
      targetStartTime = item.startTime;
      targetDuration = item.estDuration;
      excludeId = item.scheduleId;
    } else {
      targetDuration = item.estDuration || '00:30';
    }

    if (checkOverlap(dateStr, targetStartTime, targetDuration, excludeId, checkType)) {
      openAlertModal('时间冲突', '该日期已有同类型的其他安排。');
      draggedData = null;
      return;
    }

    if (source === 'schedule') {
      const index = scheduledTasks.value.findIndex((scheduledTask) => scheduledTask.scheduleId === item.scheduleId);
      if (index !== -1) {
        const newTask = JSON.parse(JSON.stringify(item));
        newTask.date = dateStr;
        scheduledTasks.value[index] = newTask;
        pushHistory();
      }
    } else if (source === 'aggregate' || source === 'pool') {
      let musicianId = '';
      let projectId = '';
      let instrumentId = '';
      let ratio = 20;
      let estDuration = '00:30';
      let trackCount = 0;
      let musicDuration = '';

      if (source === 'pool') {
        musicianId = item.musicianId;
        projectId = item.projectId;
        instrumentId = item.instrumentId;
        ratio = item.ratio;
        estDuration = item.estDuration;
        musicDuration = item.musicDuration;
      } else {
        if (sidebarTab.value === 'musician') musicianId = item.id;
        else if (sidebarTab.value === 'project') projectId = item.id;
        else if (sidebarTab.value === 'instrument') instrumentId = item.id;
        ratio = item.defaultRatio || 20;
        estDuration = item.estDuration || '00:30';
        trackCount = item.trackCount || 0;
      }

      const templateId = source === 'pool' ? item.id : undefined;
      const newTask = {
        scheduleId: getNow(),
        templateId,
        sessionId: currentSessionId.value,
        musicianId,
        projectId,
        instrumentId,
        date: dateStr,
        startTime: targetStartTime,
        estDuration,
        trackCount,
        ratio,
        musicDuration,
      };
      scheduledTasks.value.push(newTask);
      pushHistory();
    }

    draggedData = null;
  };

  return {
    dragStart,
    handleDragEnd,
    dragEnterPool,
    dragLeavePool,
    dropToPool,
    dragEnterSlot,
    dragLeaveSlot,
    dropToSchedule,
    dropToMonth,
  };
}
