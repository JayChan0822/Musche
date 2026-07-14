export function registerMobileResizeFeature(context) {
  const { refs, utils, actions = {} } = context;
  const {
    isMobile,
    isResizingMobile,
    mobileResizeState,
    pxPerMin,
  } = refs;
  const { timeToMinutes, formatSecs, parseTime } = utils;
  const {
    addWindowListener = (...args) => window.addEventListener(...args),
    removeWindowListener = (...args) => window.removeEventListener(...args),
    requestAnimationFrameFn = requestAnimationFrame,
    cancelAnimationFrameFn = cancelAnimationFrame,
    setTimeoutFn = setTimeout,
    getDocumentBody = () => document.body,
    checkOverlap = () => false,
    openAlertModal = () => {},
    pushHistory = () => {},
  } = actions;

  let resizeRaf = null;

  const initMobileResize = (event, task) => {
    if (!isMobile.value) return;

    event.stopPropagation();

    const touch = event.touches[0];
    const taskEl = event.target.closest('.task-block');
    const rect = taskEl.getBoundingClientRect();

    isResizingMobile.value = true;
    mobileResizeState.task = task;
    mobileResizeState.taskEl = taskEl;
    mobileResizeState.startY = touch.clientY;
    mobileResizeState.startHeight = rect.height;
    mobileResizeState.originalDuration = task.estDuration;

    addWindowListener('touchmove', handleMobileResizeMove, { passive: false });
    addWindowListener('touchend', handleMobileResizeEnd, true);
    addWindowListener('touchcancel', handleMobileResizeEnd, true);
  };

  const handleMobileResizeMove = (event) => {
    if (!isResizingMobile.value) return;

    if (event.cancelable) event.preventDefault();

    const touch = event.touches[0];
    const deltaY = touch.clientY - mobileResizeState.startY;
    const targetHeight = Math.max(5, mobileResizeState.startHeight + deltaY);
    const rawDurationMins = targetHeight / pxPerMin.value;
    const startMins = timeToMinutes(mobileResizeState.task.startTime);
    const rawEndMins = startMins + rawDurationMins;
    const snappedEndMins = Math.round(rawEndMins / 30) * 30;

    let newDurationMins = snappedEndMins - startMins;
    if (newDurationMins < 5) newDurationMins = 5;

    const newDurationStr = formatSecs(newDurationMins * 60);

    if (mobileResizeState.task.estDuration !== newDurationStr) {
      mobileResizeState.task.estDuration = newDurationStr;
    }
  };

  const handleMobileResizeEnd = (event) => {
    void event;
    const wasResizing = isResizingMobile.value;
    isResizingMobile.value = false;

    removeWindowListener('touchmove', handleMobileResizeMove);
    removeWindowListener('touchend', handleMobileResizeEnd, true);
    removeWindowListener('touchcancel', handleMobileResizeEnd, true);

    if (resizeRaf) cancelAnimationFrameFn(resizeRaf);

    resizeRaf = requestAnimationFrameFn(() => {
      const body = getDocumentBody();
      body.style.display = 'none';
      body.offsetHeight;
      body.style.display = '';

      const taskEl = mobileResizeState.taskEl;
      if (taskEl) {
        taskEl.style.opacity = '';
        taskEl.style.transition = '';
      }
    });

    if (wasResizing) {
      setTimeoutFn(() => {
        const task = mobileResizeState.task;
        if (!task) return;

        const newDurationStr = task.estDuration;
        let type = 'musician';
        if (task.projectId) type = 'project';
        else if (task.instrumentId) type = 'instrument';

        if (checkOverlap(task.date, task.startTime, newDurationStr, task.scheduleId, type)) {
          task.estDuration = mobileResizeState.originalDuration;
          openAlertModal('冲突', '调整后的时间与现有任务冲突');
        } else {
          const musicSeconds = parseTime(task.musicDuration);
          const recordSeconds = parseTime(task.estDuration);
          if (musicSeconds > 0) task.ratio = (recordSeconds / musicSeconds).toFixed(1);
          pushHistory();
        }

        mobileResizeState.task = null;
      }, 0);
    }
  };

  return {
    initMobileResize,
    handleMobileResizeMove,
    handleMobileResizeEnd,
  };
}
