export function registerSelectionFeature(context) {
  const { refs, actions = {} } = context;
  const {
    selectedSource,
    selectedTaskId,
    selectedPoolIds,
    lastPoolFocusId,
    lastPoolClickId,
    itemPool,
    scheduledTasks,
    currentSessionId,
    sidebarTab,
    isSidebarOpen,
    isMobile,
  } = refs;
  const {
    getVisiblePoolItems = () => [],
    scrollToSidebarItem = () => {},
    smartScrollToTask = () => {},
    triggerTouchHaptic = () => {},
  } = actions;

  const selectScheduleTask = (id) => {
    selectedSource.value = 'schedule';
    selectedTaskId.value = id;
    selectedPoolIds.value.clear();

    const task = scheduledTasks.value.find((candidate) => candidate.scheduleId === id);
    if (!task) return;

    let targetId = null;
    if (sidebarTab.value === 'project') targetId = task.projectId;
    else if (sidebarTab.value === 'instrument') targetId = task.instrumentId;
    else targetId = task.musicianId;

    if (targetId && (isSidebarOpen.value || isMobile.value)) {
      scrollToSidebarItem(targetId);
    }
  };

  const selectPoolTask = (id) => {
    selectedSource.value = 'pool';
    selectedTaskId.value = id;
    lastPoolFocusId.value = id;
  };

  const selectSinglePoolTask = (id) => {
    selectedPoolIds.value.clear();
    selectedPoolIds.value.add(id);
    lastPoolClickId.value = id;
  };

  const togglePoolTaskSelection = (id) => {
    if (selectedPoolIds.value.has(id)) selectedPoolIds.value.delete(id);
    else selectedPoolIds.value.add(id);
    lastPoolClickId.value = id;
  };

  const clearSelection = () => {
    selectedTaskId.value = null;
    selectedSource.value = null;
    selectedPoolIds.value.clear();
  };

  const selectPoolTaskRange = (id, visibleItems = []) => {
    const startIdx = visibleItems.findIndex((item) => item.id === lastPoolClickId.value);
    const endIdx = visibleItems.findIndex((item) => item.id === id);
    if (startIdx === -1 || endIdx === -1) return;

    const min = Math.min(startIdx, endIdx);
    const max = Math.max(startIdx, endIdx);
    for (let index = min; index <= max; index++) {
      selectedPoolIds.value.add(visibleItems[index].id);
    }
  };

  const jumpToPoolSchedule = (id) => {
    const poolItem = itemPool.value.find((item) => item.id === id);
    if (!poolItem) return;

    const activeSessionId = currentSessionId?.value || 'S_DEFAULT';
    const specificTask = scheduledTasks.value.find((task) => (
      (task.sessionId || 'S_DEFAULT') === activeSessionId &&
      task.templateId === id
    ));

    if (specificTask) {
      smartScrollToTask(specificTask);
      if (isMobile.value) triggerTouchHaptic('Light');
      return;
    }

    let filterKey = 'musicianId';
    if (sidebarTab.value === 'project') filterKey = 'projectId';
    else if (sidebarTab.value === 'instrument') filterKey = 'instrumentId';

    const filterId = poolItem[filterKey];
    if (!filterId) return;

    const relatedSchedules = scheduledTasks.value
      .filter((task) => (
        (task.sessionId || 'S_DEFAULT') === activeSessionId &&
        task[filterKey] === filterId
      ))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

    if (relatedSchedules.length === 0) return;

    let targetIndex = 0;
    if (poolItem.sectionIndex !== undefined && poolItem.sectionIndex >= 0) {
      targetIndex = Math.min(poolItem.sectionIndex, relatedSchedules.length - 1);
    }

    smartScrollToTask(relatedSchedules[targetIndex]);
    if (isMobile.value) triggerTouchHaptic('Light');
  };

  const selectTask = (id, src, event) => {
    if (src === 'schedule') {
      selectScheduleTask(id);
      return;
    }

    if (src === 'pool') {
      selectPoolTask(id);

      const isShift = event && event.shiftKey;
      const isCtrl = event && (event.metaKey || event.ctrlKey);

      if (!isShift && !isCtrl) {
        jumpToPoolSchedule(id);
      }

      if (isShift && lastPoolClickId.value) {
        selectPoolTaskRange(id, getVisiblePoolItems());
      } else if (isCtrl) {
        togglePoolTaskSelection(id);
      } else {
        selectSinglePoolTask(id);
      }
    }
  };

  const handlePoolItemClick = (poolItemId) => {
    selectTask(poolItemId, 'pool');
  };

  return {
    handlePoolItemClick,
    selectTask,
    selectScheduleTask,
    selectPoolTask,
    selectSinglePoolTask,
    togglePoolTaskSelection,
    clearSelection,
    selectPoolTaskRange,
    jumpToPoolSchedule,
  };
}
