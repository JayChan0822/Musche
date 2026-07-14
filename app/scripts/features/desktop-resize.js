export function registerDesktopResizeFeature(context) {
  const { refs, utils, actions = {} } = context;
  const { resizing, pxPerMin } = refs;
  const { timeToMinutes, formatSecs, parseTime } = utils;
  const {
    getDocumentBody = () => document.body,
    checkOverlap = () => false,
    openAlertModal = () => {},
    pushHistory = () => {},
  } = actions;

  const initResize = (event, task) => {
    event.preventDefault();
    event.stopPropagation();

    const taskEl = event.target.closest('.task-block');
    resizing.value = {
      task,
      startY: event.clientY,
      startH: taskEl.offsetHeight,
      originalDuration: task.estDuration,
    };

    getDocumentBody().style.cursor = 'ns-resize';
  };

  const handleResizeMove = (event) => {
    if (!resizing.value) return;

    const { task, startY, startH } = resizing.value;
    const delta = event.clientY - startY;
    const rawHeight = Math.max(5, startH + delta);
    const rawDurationMins = rawHeight / pxPerMin.value;
    const startMins = timeToMinutes(task.startTime);
    const rawEndMins = startMins + rawDurationMins;
    const snappedEndMins = Math.round(rawEndMins / 30) * 30;

    let newDurationMins = snappedEndMins - startMins;
    if (newDurationMins < 5) newDurationMins = 5;

    const newDurationStr = formatSecs(newDurationMins * 60);
    if (task.estDuration !== newDurationStr) {
      task.estDuration = newDurationStr;
    }
  };

  const handleResizeEnd = () => {
    if (!resizing.value) return;

    const task = resizing.value.task;
    let type = 'musician';
    if (task.projectId) type = 'project';
    else if (task.instrumentId) type = 'instrument';

    if (checkOverlap(task.date, task.startTime, task.estDuration, task.scheduleId, type)) {
      task.estDuration = resizing.value.originalDuration;
      openAlertModal('冲突', '调整后的时间有重叠');
    } else {
      const musicSeconds = parseTime(task.musicDuration);
      const recordSeconds = parseTime(task.estDuration);
      if (musicSeconds > 0) task.ratio = (recordSeconds / musicSeconds).toFixed(1);
      pushHistory();
    }

    resizing.value = null;
    getDocumentBody().style.cursor = '';
  };

  return {
    initResize,
    handleResizeMove,
    handleResizeEnd,
  };
}
