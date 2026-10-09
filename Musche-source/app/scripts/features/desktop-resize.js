import { getScheduleStage, viewFromStage } from '../utils/workflow.js';
export function registerDesktopResizeFeature(context) {
  const { refs, utils, actions = {} } = context;
  const { resizing, pxPerMin, weekContainer } = refs;
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
      container: weekContainer?.value || null,
      startScrollTop: weekContainer?.value?.scrollTop || 0,
      pixelsPerMinute: pxPerMin.value,
    };

    getDocumentBody().style.cursor = 'ns-resize';
  };

  const handleResizeMove = (event) => {
    if (!resizing.value) return;

    const { task, startY, originalDuration, container, startScrollTop, pixelsPerMinute } = resizing.value;
    const delta = event.clientY - startY + (container?.scrollTop || 0) - startScrollTop;
    const rawDurationMins = parseTime(originalDuration) / 60 + delta / pixelsPerMinute;
    const startMins = timeToMinutes(task.startTime);
    const rawEndMins = startMins + rawDurationMins;
    const snapMinutes = event.metaKey ? 1 : 15;
    const snappedEndMins = Math.round(rawEndMins / snapMinutes) * snapMinutes;

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
    const type = viewFromStage(getScheduleStage(task));

    if (checkOverlap(task.date, task.startTime, task.estDuration, task.scheduleId, type, task)) {
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
