import { scheduleIdentity } from '../utils/schedule-context.js';
import { getScheduleStage, viewFromStage } from '../utils/workflow.js';
import { formatClock } from '../utils/time.js';

export function registerMobileTouchEndFeature(context) {
  const { refs, state, data, utils = {}, actions = {} } = context;
  const { scheduledTasks, pxPerMin, sidebarTab, currentSessionId, lastTapState } = refs;
  const getSettings = data.getSettings || (() => data.settings);
  const { formatSecs = (seconds) => `${seconds}s` } = utils;
  const {
    clearTimeout: clearTimeoutFn = (timer) => clearTimeout(timer),
    dateNow = () => Date.now(),
    stopAutoScroll = () => {},
    getDocumentBody = () => document.body,
    elementFromPoint = (x, y) => document.elementFromPoint(x, y),
    isTaskGhost = () => false,
    jumpToGhostContext = () => {},
    handleTaskDblClick = () => {},
    selectTask = () => {},
    checkOverlap = () => false,
    openAlertModal = () => {},
    pushHistory = () => {},
  } = actions;

  const getCheckTypeForTask = (task) => {
    return viewFromStage(getScheduleStage(task));
  };

  const clearTimer = (timerKey) => {
    if (state[timerKey]) {
      clearTimeoutFn(state[timerKey]);
      state[timerKey] = null;
      return true;
    }
    return false;
  };

  const handleTapEnd = (event) => {
    if (!state.dragElClone && state.dragSourceType === 'schedule' && state.dragSourceTask) {
      const now = dateNow();

      if (
        lastTapState.id === state.dragSourceTask.scheduleId &&
        (now - lastTapState.time) < 300
      ) {
        if (event.cancelable) event.preventDefault();

        if (isTaskGhost(state.dragSourceTask)) {
          jumpToGhostContext(state.dragSourceTask);
        } else {
          handleTaskDblClick(event, state.dragSourceTask);
        }

        lastTapState.id = null;
        lastTapState.time = 0;
      } else {
        lastTapState.id = state.dragSourceTask.scheduleId;
        lastTapState.time = now;
        selectTask(state.dragSourceTask.scheduleId, 'schedule');
      }
    }
  };

  const getWeekDropTime = (touch, timeGridContainer, metaKey) => {
    const settings = getSettings();
    const gridRect = timeGridContainer.getBoundingClientRect();
    const touchYInContainer = touch.clientY - gridRect.top;
    const taskTopPixel = touchYInContainer - state.dragClickOffsetY;
    const minsFromStart = taskTopPixel / pxPerMin.value;
    const totalMins = (settings.startHour * 60) + minsFromStart;
    const snapMinutes = metaKey ? 1 : 15;
    const snappedMins = Math.round(totalMins / snapMinutes) * snapMinutes;
    const minMins = settings.startHour * 60;
    const maxMins = settings.endHour * 60 - snapMinutes;
    const finalMins = Math.max(minMins, Math.min(maxMins, snappedMins));
    return formatClock(Math.floor(finalMins / 60), finalMins % 60);
  };

  const getWeekDropCheck = () => {
    let checkType = 'musician';
    let checkDuration = '';
    let excludeId = null;

    if (state.dragSourceType === 'aggregate') {
      checkType = sidebarTab.value;
      const item = state.dragSourceTask;
      const remainingSecs = item.totalSeconds - item.scheduledSeconds;
      if (remainingSecs <= 0) return null;
      let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
      if (remainingMins === 0) remainingMins = 30;
      checkDuration = formatSecs(remainingMins * 60);
    } else if (state.dragSourceType === 'pool') {
      checkType = getCheckTypeForTask(scheduleIdentity(state.dragSourceTask, state.dragSourceType, sidebarTab.value));
      checkDuration = state.dragSourceTask.estDuration;
    } else {
      checkType = getCheckTypeForTask(scheduleIdentity(state.dragSourceTask, state.dragSourceType, sidebarTab.value));
      checkDuration = state.dragSourceTask.estDuration;
      excludeId = state.dragSourceTask.scheduleId;
    }

    return { checkType, checkDuration, excludeId };
  };

  const createAggregateWeekTask = (dateStr, newTime) => {
    const item = state.dragSourceTask;
    const remainingSecs = item.totalSeconds - item.scheduledSeconds;
    let remainingMins = Math.ceil(remainingSecs / 1800) * 30;
    if (remainingMins === 0) remainingMins = 30;

    return {
      scheduleId: dateNow(),
      sessionId: currentSessionId.value,
      musicianId: sidebarTab.value === 'musician' ? item.id : '',
      projectId: sidebarTab.value === 'project' ? item.id : '',
      instrumentId: sidebarTab.value === 'instrument' ? item.id : '',
      date: dateStr,
      startTime: newTime,
      estDuration: formatSecs(remainingMins * 60),
      trackCount: item.trackCount,
      ratio: item.defaultRatio || 20,
    };
  };

  const createPoolWeekTask = (dateStr, newTime) => ({
    scheduleId: dateNow(),
    sessionId: currentSessionId.value,
    projectId: state.dragSourceTask.projectId,
    instrumentId: state.dragSourceTask.instrumentId,
    musicianId: state.dragSourceTask.musicianId,
    musicDuration: state.dragSourceTask.musicDuration,
    ratio: state.dragSourceTask.ratio,
    estDuration: state.dragSourceTask.estDuration,
    date: dateStr,
    startTime: newTime,
  });

  const dropInWeek = (dropColumn, touch, metaKey) => {
    const dateStr = dropColumn.dataset.dateStr;
    const timeGridContainer = dropColumn.querySelector('.relative[style*="min-height"]');

    if (!timeGridContainer || !state.dragSourceTask) return;

    const newTime = getWeekDropTime(touch, timeGridContainer, metaKey);
    const check = getWeekDropCheck();
    if (!check) return;

    if (checkOverlap(dateStr, newTime, check.checkDuration, check.excludeId, check.checkType, scheduleIdentity(state.dragSourceTask, state.dragSourceType, sidebarTab.value))) {
      openAlertModal('时间冲突', '该时间段已有重叠的安排。');
      if (state.dragSourceEl) state.dragSourceEl.style.opacity = '';
      state.dragSourceEl = null;
      state.activeDropSlot = null;
      return;
    }

    if (state.dragSourceType === 'aggregate') {
      scheduledTasks.value.push({ ...createAggregateWeekTask(dateStr, newTime), ...scheduleIdentity(state.dragSourceTask, 'aggregate', sidebarTab.value) });
      pushHistory();
    } else if (state.dragSourceType === 'pool') {
      scheduledTasks.value.push({ ...createPoolWeekTask(dateStr, newTime), templateId: state.dragSourceTask.id, ...scheduleIdentity(state.dragSourceTask, 'pool', sidebarTab.value) });
      pushHistory();
    } else if (
      state.dragSourceTask.startTime !== newTime ||
      state.dragSourceTask.date !== dateStr
    ) {
      state.dragSourceTask.startTime = newTime;
      state.dragSourceTask.date = dateStr;
      pushHistory();
    }
  };

  const createMonthTask = (dateStr, defaultStart, item, checkType) => {
    let mId = '';
    let pId = '';
    let iId = '';
    let ratio = 20;
    let estDur = '00:30';
    let tCount = 0;
    let musDur = '';

    if (state.dragSourceType === 'pool') {
      mId = item.musicianId;
      pId = item.projectId;
      iId = item.instrumentId;
      ratio = item.ratio;
      estDur = item.estDuration;
      musDur = item.musicDuration;
    } else {
      if (sidebarTab.value === 'musician') mId = item.id;
      else if (sidebarTab.value === 'project') pId = item.id;
      else if (sidebarTab.value === 'instrument') iId = item.id;
      ratio = item.defaultRatio || 20;
      estDur = item.estDuration || '00:30';
      tCount = item.trackCount || 0;
    }

    return {
      scheduleId: dateNow(),
      sessionId: currentSessionId.value,
      musicianId: mId,
      projectId: pId,
      instrumentId: iId,
      date: dateStr,
      startTime: defaultStart,
      estDuration: estDur,
      trackCount: tCount,
      ratio,
      musicDuration: musDur,
    };
  };

  const dropInMonth = (dropMonthCell) => {
    const settings = getSettings();
    const dateStr = dropMonthCell.dataset.date;

    if (state.dragSourceType === 'schedule') {
      if (state.dragSourceTask.date !== dateStr) {
        if (checkOverlap(dateStr, state.dragSourceTask.startTime, state.dragSourceTask.estDuration, state.dragSourceTask.scheduleId, getCheckTypeForTask(state.dragSourceTask), state.dragSourceTask)) return openAlertModal('时间冲突', '人员或场地已有安排。');
        state.dragSourceTask.date = dateStr;
        pushHistory();
      }
      return;
    }

    if (state.dragSourceType !== 'aggregate' && state.dragSourceType !== 'pool') return;

    const item = state.dragSourceTask;
    const checkType = viewFromStage(getScheduleStage(scheduleIdentity(item, state.dragSourceType, sidebarTab.value)));

    const defaultStart = formatClock(settings.startHour);
    const estDur = state.dragSourceType === 'pool'
      ? item.estDuration
      : (item.estDuration || '00:30');

    if (checkOverlap(dateStr, defaultStart, estDur, null, checkType, scheduleIdentity(item, state.dragSourceType, sidebarTab.value))) {
      openAlertModal('冲突', '该日期已有安排，请切换到周视图查看详情。');
    } else {
      scheduledTasks.value.push({ ...createMonthTask(dateStr, defaultStart, item, checkType), templateId: state.dragSourceType === 'pool' ? item.id : undefined, ...scheduleIdentity(item, state.dragSourceType, sidebarTab.value) });
      pushHistory();
    }
  };

  const cleanupSource = () => {
    if (state.dragSourceEl) {
      state.dragSourceEl.style.opacity = '';
      state.dragSourceEl = null;
    }
    state.activeDropSlot = null;
  };

  const handleTouchEnd = (event) => {
    if (state.longPressTimeout) {
      clearTimer('longPressTimeout');
      handleTapEnd(event);
    }

    stopAutoScroll();
    clearTimer('monthSwitchTimer');

    if (state.dragElClone) {
      getDocumentBody().removeChild(state.dragElClone);
      state.dragElClone = null;
      if (state.activeDropSlot) state.activeDropSlot.classList.remove('drag-over');

      const touch = event.changedTouches[0];
      const targetEl = elementFromPoint(touch.clientX, touch.clientY);
      const dropColumn = targetEl ? targetEl.closest('[data-date-str]') : null;
      const dropMonthCell = targetEl ? targetEl.closest('[data-date]') : null;

      if (dropColumn) {
        dropInWeek(dropColumn, touch, event.metaKey);
      } else if (dropMonthCell && state.dragSourceTask) {
        dropInMonth(dropMonthCell);
      }
    }

    cleanupSource();
  };

  return {
    handleTouchEnd,
  };
}
