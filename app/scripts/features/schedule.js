import { computed } from 'vue';

import { SIDEBAR_TABS } from '../utils/sidebar-tabs.js';

// 分类 → 任务上对应的 id 字段
const TASK_ID_KEY_BY_TAB = {
  musician: 'musicianId',
  project: 'projectId',
  instrument: 'instrumentId',
};

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
    currentView,
    viewDate,
  } = refs;
  const { settings } = state;
  const {
    parseTime,
    timeToMinutes,
    getNameById,
    addDaysToDate,
    addMinutesToTimeValue,
    addMinutesToTime: rawAddMinutesToTime,
    setItemSplitState,
  } = utils;
  const {
    pushHistory,
    getCurrentWeekDays = () => refs.currentWeekDays?.value || [],
  } = actions;

  const scheduledTemplateIds = computed(() => {
    return new Set(scheduledTasks.value.map((task) => task.templateId).filter((id) => id !== undefined));
  });

  const isScheduled = (templateId) => scheduledTemplateIds.value.has(templateId);

  const addMinutesToTime = (timeStr, minutes) => (typeof addMinutesToTimeValue === 'function'
    ? addMinutesToTimeValue(timeStr, minutes, {
      minMinutes: settings.startHour * 60,
      maxMinutes: settings.endHour * 60 - 30,
      stepMinutes: 30,
    })
    : rawAddMinutesToTime(timeStr, minutes));

  function autoResizeSchedules(taskIds) {
    void taskIds;
  }

  function getMins(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
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
    let movedItem = null;

    if (direction === 'up') {
      for (let index = items.length - 1; index >= 0; index--) {
        if (items[index].sectionIndex === upperSection) {
          items[index].sectionIndex = lowerSection;
          movedItem = items[index];
          break;
        }
      }
    } else if (direction === 'down') {
      for (let index = 0; index < items.length; index++) {
        if (items[index].sectionIndex === lowerSection) {
          items[index].sectionIndex = upperSection;
          movedItem = items[index];
          break;
        }
      }
    }

    if (movedItem && typeof setItemSplitState === 'function') {
      setItemSplitState(movedItem, trackListData.value.viewType || sidebarTab.value, {
        sectionIndex: movedItem.sectionIndex,
      });
    }

    if (movedItem && shouldSaveHistory) {
      pushHistory();
    }

    return !!movedItem;
  }

  function moveTask(task, direction) {
    let updated = false;
    const isMonth = currentView?.value === 'month';

    const checkMonthViewSwitch = (dateStr) => {
      if (!isMonth || !viewDate) return;
      const newDate = new Date(dateStr);
      const currentDate = new Date(viewDate.value);
      if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
        viewDate.value = newDate;
      }
    };

    let type = 'musician';
    if (task.projectId) type = 'project';
    else if (task.instrumentId) type = 'instrument';

    if (direction === 'up') {
      if (isMonth) {
        const newDate = addDaysToDate(task.date, -7);
        if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
          return;
        }
        if (newDate !== task.date) {
          pushHistory();
          task.date = newDate;
          updated = true;
          checkMonthViewSwitch(newDate);
        }
      } else {
        const newTime = addMinutesToTime(task.startTime, -30);
        if (checkOverlap(task.date, newTime, task.estDuration, task.scheduleId, type)) {
          return;
        }
        if (newTime !== task.startTime) {
          pushHistory();
          task.startTime = newTime;
          updated = true;
        }
      }
    } else if (direction === 'down') {
      if (isMonth) {
        const newDate = addDaysToDate(task.date, 7);
        if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
          return;
        }
        if (newDate !== task.date) {
          pushHistory();
          task.date = newDate;
          updated = true;
          checkMonthViewSwitch(newDate);
        }
      } else {
        const newTime = addMinutesToTime(task.startTime, 30);
        if (checkOverlap(task.date, newTime, task.estDuration, task.scheduleId, type)) {
          return;
        }
        if (newTime !== task.startTime) {
          pushHistory();
          task.startTime = newTime;
          updated = true;
        }
      }
    } else if (direction === 'left') {
      const newDate = addDaysToDate(task.date, -1);
      if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
        return;
      }
      if (newDate !== task.date) {
        pushHistory();
        task.date = newDate;
        updated = true;
        if (isMonth) {
          checkMonthViewSwitch(newDate);
        } else if (currentView?.value === 'week') {
          const weekDays = getCurrentWeekDays();
          if (weekDays[0] && newDate < weekDays[0].dateStr && viewDate) viewDate.value = new Date(newDate);
        }
      }
    } else if (direction === 'right') {
      const newDate = addDaysToDate(task.date, 1);
      if (checkOverlap(newDate, task.startTime, task.estDuration, task.scheduleId, type)) {
        return;
      }
      if (newDate !== task.date) {
        pushHistory();
        task.date = newDate;
        updated = true;
        if (isMonth) {
          checkMonthViewSwitch(newDate);
        } else if (currentView?.value === 'week') {
          const weekDays = getCurrentWeekDays();
          if (weekDays[6] && newDate > weekDays[6].dateStr && viewDate) viewDate.value = new Date(newDate);
        }
      }
    }

    void updated;
  }

  function getOverlapCount(targetTask) {
    const dayTasks = scheduledTasks.value.filter((task) => task.date === targetTask.date);
    const targetStart = timeToMinutes(targetTask.startTime);
    const targetEnd = targetStart + parseTime(targetTask.estDuration) / 60;

    let overlapCount = 0;
    for (const task of dayTasks) {
      if (task.scheduleId === targetTask.scheduleId) continue;

      const taskStart = timeToMinutes(task.startTime);
      const taskEnd = taskStart + parseTime(task.estDuration) / 60;

      if (targetStart < taskEnd && targetEnd > taskStart) {
        overlapCount++;
      }
    }

    return overlapCount;
  }

  function isTaskGhost(task) {
    const taskSession = task.sessionId || 'S_DEFAULT';
    if (taskSession !== currentSessionId.value) return true;

    // 任务在任何一个「还在用的分类」里都没有 id（例如乐器分类下线后只剩 instrumentId 的老任务）：
    // 每个分类下都判成幽灵的话，它就永远灰着、点了也跳不到能显示它的地方，所以按正常任务处理。
    const belongsToLiveTab = SIDEBAR_TABS.some((tab) => task[TASK_ID_KEY_BY_TAB[tab]]);
    if (!belongsToLiveTab) return false;

    const idKey = TASK_ID_KEY_BY_TAB[sidebarTab.value];
    return idKey ? !task[idKey] : false;
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

  function hasRecordingInfo(task) {
    const hasPopulatedField = (info) => {
      if (!info) return false;
      return !!(
        (info.studio && info.studio.trim()) ||
        (info.engineer && info.engineer.trim()) ||
        (info.operator && info.operator.trim()) ||
        (info.assistant && info.assistant.trim()) ||
        (info.notes && info.notes.trim())
      );
    };

    return hasPopulatedField(task.recordingInfo) || hasPopulatedField(task.editInfo);
  }

  return {
    autoResizeSchedules,
    scheduledTemplateIds,
    isScheduled,
    checkOverlap,
    addMinutesToTime,
    getMins,
    cleanupEmptySchedules,
    pruneEmptySchedules,
    moveDivider,
    moveTask,
    getOverlapCount,
    isTaskGhost,
    getTaskStyle,
    getBlockTitle,
    hasRecordingInfo,
  };
}
