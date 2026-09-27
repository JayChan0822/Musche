import { setItemSplitState } from '../utils/split-state.js';
import { scheduleContext, scheduleMatches, itemMatchesSchedule } from '../utils/schedule-context.js';
export function registerScheduleTaskActivationFeature(context) {
  const { refs, utils, actions = {} } = context;
  const {
    scheduledTasks,
    itemPool,
    pxPerMin,
    currentSessionId,
    trackListData,
    showTrackList,
    trackListContainerRef,
  } = refs;
  const { parseTime, formatSecs } = utils;
  const {
    isContextSwitchingActive = () => false,
    isTaskGhost = () => false,
    jumpToGhostContext = () => {},

    pushHistory = () => {},
    getNow = () => Date.now(),
    normalizeSplitViewType = (value) => value,
    isItemVisibleForView = () => true,
    syncItemForView = () => {},
    ensureItemRecords = () => {},
    getNameById = () => '',
    autoSortTrackList = () => {},
    preloadTrackList = () => {},
    setTimeout: setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    getDocument = () => document,
  } = actions;

  const scrollTrackListToCurrentSection = () => {
    setTimeoutFn(() => {
      const container = trackListContainerRef.value;
      if (!container) return;

      const targetIdx = trackListData.value.currentSectionIndex;

      if (targetIdx === 0) {
        container.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        const dividerId = `sec-divider-${targetIdx}`;
        const dividerEl = getDocument().getElementById(dividerId);

        if (dividerEl) {
          dividerEl.scrollIntoView({ behavior: 'auto', block: 'start' });

          setTimeoutFn(() => {
            const retryEl = getDocument().getElementById(dividerId);
            if (retryEl) retryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 350);
        }
      }
    }, 50);
  };

  const splitTaskAtEvent = (event, task) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const splitM = Math.round((clickY / pxPerMin.value) / 30) * 30;
    const totalSeconds = parseTime(task.estDuration);
    if (splitM * 60 >= totalSeconds || splitM <= 0) return;

    const firstTask = JSON.parse(JSON.stringify(task));
    firstTask.scheduleId = getNow();
    firstTask.estDuration = formatSecs(splitM * 60);

    const secondTask = JSON.parse(JSON.stringify(task));
    secondTask.scheduleId = getNow() + 1;
    const [hours, minutes] = task.startTime.split(':').map(Number);
    const secondStartMins = hours * 60 + minutes + splitM;
    secondTask.startTime = `${Math.floor(secondStartMins / 60)}:${String(secondStartMins % 60).padStart(2, '0')}`;
    secondTask.estDuration = formatSecs(totalSeconds - splitM * 60);

    scheduledTasks.value = scheduledTasks.value.filter((scheduledTask) => scheduledTask.scheduleId !== task.scheduleId);
    scheduledTasks.value.push(firstTask, secondTask);
    pushHistory();
  };

  const openTrackListForTask = (task) => {
    const currentSchedule = scheduledTasks.value.find((scheduledTask) => scheduledTask.scheduleId === task.scheduleId);
    if (!currentSchedule) return;

    const ctx = scheduleContext(task);
    const blockType = ctx.view;
    const filterId = ctx.id;
    const relatedSchedules = scheduledTasks.value
      .filter((entry) => (entry.sessionId || 'S_DEFAULT') === currentSessionId.value && scheduleMatches(entry, task))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    const currentSectionIndex = relatedSchedules.findIndex((entry) => entry.scheduleId === task.scheduleId);
    const totalSections = relatedSchedules.length;
    const viewType = normalizeSplitViewType(blockType);
    const poolItems = itemPool.value.filter((item) => (
      (item.sessionId || 'S_DEFAULT') === currentSessionId.value && isItemVisibleForView(item, viewType) && itemMatchesSchedule(item, task)
    ));

    poolItems.forEach((item) => {
      ensureItemRecords(item);
      syncItemForView(item, viewType);
      if (item.sectionIndex === undefined) item.sectionIndex = 0;
      if (item.sectionIndex >= totalSections) item.sectionIndex = totalSections - 1;
      setItemSplitState(item, viewType, { sectionIndex: item.sectionIndex });
    });

    trackListData.value = {
      name: ctx.legacyProject ? getNameById(filterId, 'project') : filterId === '__UNASSIGNED__' ? '未分配' : getNameById(filterId, 'musician'),
      stage: ctx.stage,
      items: poolItems,
      taskRef: currentSchedule,
      totalSections,
      currentSectionIndex,
      schedules: relatedSchedules,
      viewType: blockType,
    };

    autoSortTrackList();
    showTrackList.value = true;
    preloadTrackList();
    scrollTrackListToCurrentSection();
  };

  const handleTaskDblClick = (event, task) => {
    if (isContextSwitchingActive()) return;
    if (isTaskGhost(task)) {
      jumpToGhostContext(task);
      return;
    }



    if (event.metaKey || event.ctrlKey) {
      splitTaskAtEvent(event, task);
    } else {
      openTrackListForTask(task);
    }
  };

  return {
    handleTaskDblClick,
    openTrackListForTask,
  };
}
