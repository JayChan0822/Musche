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
    triggerTouchHaptic = () => {},
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

  const getBlockInfo = (task) => {
    if (task.musicianId) {
      return { blockType: 'musician', filterId: task.musicianId };
    }
    if (task.projectId) {
      return { blockType: 'project', filterId: task.projectId };
    }
    if (task.instrumentId) {
      return { blockType: 'instrument', filterId: task.instrumentId };
    }
    return { blockType: 'musician', filterId: task.musicianId };
  };

  const isRelatedSchedule = (task, blockType, filterId) => {
    if ((task.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
    if (blockType === 'musician') return task.musicianId === filterId;
    if (blockType === 'project') return task.projectId === filterId && !task.musicianId;
    if (blockType === 'instrument') return task.instrumentId === filterId && !task.musicianId && !task.projectId;
    return false;
  };

  const isRelatedPoolItem = (item, blockType, filterId) => {
    if ((item.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;
    if (blockType === 'musician') return item.musicianId === filterId;
    if (blockType === 'project') return item.projectId === filterId;
    if (blockType === 'instrument') return item.instrumentId === filterId;
    return false;
  };

  const getModalTitle = (blockType, filterId) => {
    if (blockType === 'musician') return getNameById(filterId, 'musician');
    if (blockType === 'project') return getNameById(filterId, 'project');
    if (blockType === 'instrument') return getNameById(filterId, 'instrument');
    return '';
  };

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

    const { blockType, filterId } = getBlockInfo(task);
    const relatedSchedules = scheduledTasks.value
      .filter((scheduledTask) => isRelatedSchedule(scheduledTask, blockType, filterId))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    const currentSectionIndex = relatedSchedules.findIndex((scheduledTask) => scheduledTask.scheduleId === task.scheduleId);
    const totalSections = relatedSchedules.length;
    const viewType = normalizeSplitViewType(blockType);

    const poolItems = itemPool.value.filter((item) => (
      isItemVisibleForView(item, viewType) && isRelatedPoolItem(item, blockType, filterId)
    ));

    poolItems.forEach((item) => {
      ensureItemRecords(item);
      syncItemForView(item, viewType);
      if (item.sectionIndex === undefined) item.sectionIndex = 0;
      if (item.sectionIndex >= totalSections) item.sectionIndex = totalSections - 1;
    });

    trackListData.value = {
      name: getModalTitle(blockType, filterId),
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

    triggerTouchHaptic('Heavy');

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
