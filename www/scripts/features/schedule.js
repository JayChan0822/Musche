export function registerScheduleFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    itemPool,
    scheduledTasks,
    currentSessionId,
    trackListData,
    showTrackList,
    pxPerMin,
    sidebarTab,
  } = refs;
  const { settings } = state;
  const { parseTime, timeToMinutes, getNameById } = utils;
  const { pushHistory, triggerTouchHaptic } = actions;

  function autoResizeSchedules(taskIds) {
    void taskIds;
    console.log('执行全局自动调整...');
  }

  function checkOverlap(date, startTime, durationStr, excludeId, checkType) {
    const newStart = timeToMinutes(startTime);
    const newEnd = newStart + parseTime(durationStr) / 60;

    return scheduledTasks.value.some((task) => {
      if (task.scheduleId === excludeId) return false;
      if (task.date !== date) return false;
      if ((task.sessionId || 'S_DEFAULT') !== currentSessionId.value) return false;

      let taskType = 'musician';
      if (task.projectId) taskType = 'project';
      else if (task.instrumentId) taskType = 'instrument';

      if (taskType !== checkType) return false;

      const taskStart = timeToMinutes(task.startTime);
      const taskEnd = taskStart + parseTime(task.estDuration) / 60;
      return newStart < taskEnd && newEnd > taskStart;
    });
  }

  function cleanupEmptySchedules() {
    const activePoolIds = new Set(itemPool.value.map((item) => item.id));
    const originalLength = scheduledTasks.value.length;
    const groups = {};

    const getGroupKey = (task) => {
      const sessionId = task.sessionId || 'S_DEFAULT';
      if (task.musicianId) return `${sessionId}|M|${task.musicianId}`;
      if (task.projectId) return `${sessionId}|P|${task.projectId}`;
      if (task.instrumentId) return `${sessionId}|I|${task.instrumentId}`;
      return null;
    };

    scheduledTasks.value.forEach((task) => {
      if (task.templateId) return;
      const key = getGroupKey(task);
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    const schedulesKeepSet = new Set();

    Object.entries(groups).forEach(([key, scheduleBlocks]) => {
      scheduleBlocks.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

      const [sessionId, type, id] = key.split('|');
      const poolItems = itemPool.value.filter((item) => {
        if ((item.sessionId || 'S_DEFAULT') !== sessionId) return false;
        if (type === 'M') return item.musicianId === id;
        if (type === 'P') return item.projectId === id;
        if (type === 'I') return item.instrumentId === id;
        return false;
      });

      const taskMap = new Map();
      poolItems.forEach((item) => {
        let index = parseInt(item.sectionIndex, 10);
        if (Number.isNaN(index)) index = 0;
        if (!taskMap.has(index)) taskMap.set(index, []);
        taskMap.get(index).push(item);
      });

      let newBlockIndex = 0;
      scheduleBlocks.forEach((block, oldIndex) => {
        const relatedTasks = taskMap.get(oldIndex);
        if (!relatedTasks || relatedTasks.length === 0) return;

        schedulesKeepSet.add(block.scheduleId);
        if (oldIndex !== newBlockIndex) {
          relatedTasks.forEach((item) => {
            item.sectionIndex = newBlockIndex;
          });
        }
        newBlockIndex++;
      });
    });

    scheduledTasks.value = scheduledTasks.value.filter((task) => {
      if ((task.sessionId || 'S_DEFAULT') !== currentSessionId.value) return true;
      if (task.templateId) return activePoolIds.has(task.templateId);
      return schedulesKeepSet.has(task.scheduleId);
    });

    if (scheduledTasks.value.length < originalLength) {
      triggerTouchHaptic('Medium');
    }
  }

  function pruneEmptySchedules() {
    const listData = trackListData.value;
    if (!listData.schedules || listData.schedules.length === 0) return;

    for (let index = listData.schedules.length - 1; index >= 0; index--) {
      const itemsInSection = listData.items.filter((item) => item.sectionIndex === index);
      if (itemsInSection.length > 0) continue;

      const scheduleToRemove = listData.schedules[index];
      scheduledTasks.value = scheduledTasks.value.filter((task) => task.scheduleId !== scheduleToRemove.scheduleId);
      listData.schedules.splice(index, 1);

      listData.items.forEach((item) => {
        if (item.sectionIndex > index) {
          item.sectionIndex--;
        }
      });
    }

    listData.totalSections = listData.schedules.length;
    if (listData.totalSections === 0) {
      showTrackList.value = false;
    } else if (listData.currentSectionIndex >= listData.totalSections) {
      listData.currentSectionIndex = listData.totalSections - 1;
    }
  }

  function moveDivider(dividerIndex, direction, shouldSaveHistory = true) {
    const upperSection = dividerIndex - 1;
    const lowerSection = dividerIndex;
    const items = trackListData.value.items;

    if (direction === 'up') {
      for (let index = items.length - 1; index >= 0; index--) {
        if (items[index].sectionIndex === upperSection) {
          items[index].sectionIndex = lowerSection;
          break;
        }
      }
    } else if (direction === 'down') {
      for (let index = 0; index < items.length; index++) {
        if (items[index].sectionIndex === lowerSection) {
          items[index].sectionIndex = upperSection;
          break;
        }
      }
    }

    if (shouldSaveHistory) {
      pushHistory();
    }
  }

  function isTaskGhost(task) {
    const taskSession = task.sessionId || 'S_DEFAULT';
    if (taskSession !== currentSessionId.value) return true;

    if (sidebarTab.value === 'musician') return !task.musicianId;
    if (sidebarTab.value === 'project') return !task.projectId;
    if (sidebarTab.value === 'instrument') return !task.instrumentId;
    return false;
  }

  function getTaskStyle(task) {
    const [hours, minutes] = task.startTime.split(':').map(Number);
    const top = ((hours - settings.startHour) * 60 + minutes) * pxPerMin.value;
    const height = (parseTime(task.estDuration) / 60) * pxPerMin.value;

    let baseColor = '#a855f7';
    if (task.projectId) baseColor = '#eab308';
    else if (task.instrumentId) baseColor = '#3b82f6';

    return {
      top: `${top}px`,
      height: `${height}px`,
      '--task-border': baseColor,
      zIndex: isTaskGhost(task) ? 1 : 20,
    };
  }

  function getBlockTitle(task) {
    if (task.musicianId) return getNameById(task.musicianId, 'musician');
    if (task.projectId) return getNameById(task.projectId, 'project');
    if (task.instrumentId) return getNameById(task.instrumentId, 'instrument');
    return '未命名日程';
  }

  return {
    autoResizeSchedules,
    checkOverlap,
    cleanupEmptySchedules,
    pruneEmptySchedules,
    moveDivider,
    isTaskGhost,
    getTaskStyle,
    getBlockTitle,
  };
}
