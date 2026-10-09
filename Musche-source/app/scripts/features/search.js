import { getPartAllocation } from '../utils/workflow-ledger.js';
import { getScheduleStage, getAssigneeId, UNASSIGNED_ID, viewFromStage } from '../utils/workflow.js';
import { scheduleContext, itemMatchesSchedule } from '../utils/schedule-context.js';
import { peekItemSplitState } from '../utils/split-state.js';
import { computed, watch } from 'vue';

export function registerSearchFeature(context) {
  const { refs, actions, utils, state = {} } = context;
  const {
    itemPool,
    scheduledTasks,
    globalSearchQuery,
    currentSearchIndex,
    searchHighlightTimer,
    lastHighlightedTrackId,
    lastTrackSearchQuery,
    trackSearchIndex,
    trackListSearchQuery,
    trackListData,
    showTrackList,
    isSearchFocused,
    isMobile,
  } = refs;
  const { sidebarTab, musicianStats, projectStats, instrumentStats, settings = {} } = state;
  const {
    getNameById,
  } = utils;
  const {
    openAlertModal,
    smartScrollToTask,
    getSidebarList = () => [],
  } = actions;

  const filteredSidebarList = computed(() => getSidebarList());

  const getNameWithGroup = (id, type) => {
    if (!id) return '';

    let list = [];
    if (type === 'project') list = settings.projects || [];
    else if (type === 'instrument') list = settings.instruments || [];
    else list = settings.musicians || [];

    const item = list.find((candidate) => candidate.id == id);
    return item ? `${item.name} ${item.group || ''}` : '';
  };

  const smartMatch = (text, keyword) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    if (lowerText.includes(keyword)) return true;
    if (lowerText.replace(/\s/g, '').includes(keyword)) return true;
    return false;
  };

  const getFullSearchText = (task, groupName) => {
    const mText = getNameWithGroup(task.musicianId, 'musician') + ' ' + getNameWithGroup(task.editorId, 'musician');
    const pText = getNameWithGroup(task.projectId, 'project');
    const iText = getNameWithGroup(task.instrumentId, 'instrument');
    const info = task.recordingInfo || {};
    const infoText = [
      info.studio,
      info.engineer,
      info.operator,
      info.assistant,
      info.notes,
    ].join(' ');

    return `${groupName} ${mText} ${pText} ${iText} ${task.splitTag || ''} ${infoText}`;
  };

  const getStatsForCurrentSidebar = () => {
    if (sidebarTab.value === 'project') return { targetList: projectStats.value, getTargetId: (task) => getAssigneeId(task, 'edit') || UNASSIGNED_ID };
    if (sidebarTab.value === 'instrument') return { targetList: instrumentStats.value, getTargetId: (task) => task.instrumentId };
    return { targetList: musicianStats.value, getTargetId: (task) => getAssigneeId(task, 'rec') || UNASSIGNED_ID };
  };

  const filteredScheduledTasks = computed(() => {
    const rawQuery = globalSearchQuery.value.trim().toLowerCase();
    if (!rawQuery) return scheduledTasks.value;

    const statusDefinitions = {
      '完成': ['completed'],
      finished: ['completed'],
      '进行中': ['in-progress'],
      ing: ['in-progress'],
      '缺时': ['insufficient'],
      missing: ['insufficient'],
      '已排': ['scheduled', 'full', 'completed'],
      full: ['scheduled', 'full', 'completed'],
    };

    const textKeywords = [];
    const statusFilters = new Set();

    rawQuery.split(/\s+/).filter(Boolean).forEach((inputWord) => {
      let isStatus = false;
      for (const [key, statuses] of Object.entries(statusDefinitions)) {
        if (key.includes(inputWord) || inputWord.includes(key)) {
          statuses.forEach((status) => statusFilters.add(status));
          isStatus = true;
          break;
        }
      }
      if (!isStatus) textKeywords.push(inputWord);
    });

    const checkTaskStatus = (task) => {
      if (statusFilters.size === 0) return true;

      const { targetList, getTargetId } = getStatsForCurrentSidebar();
      const targetId = getTargetId(task);
      if (!targetId) return false;

      const statItem = targetList.find((stat) => stat.id === targetId);
      return !!statItem && statusFilters.has(statItem.statusKey);
    };

    const scheduleSectionMap = new Map();
    const groups = {};
    scheduledTasks.value.forEach((task) => {
      const sessionId = task.sessionId || 'S_DEFAULT';
      const context = scheduleContext(task);
      const key = `${context.stage}|${context.field}|${context.id}`;

      const fullKey = `${sessionId}|${key}`;
      if (!groups[fullKey]) groups[fullKey] = [];
      groups[fullKey].push(task);
    });

    Object.values(groups).forEach((group) => {
      group.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      group.forEach((task, index) => {
        scheduleSectionMap.set(task.scheduleId, index);
      });
    });

    return scheduledTasks.value.filter((task) => {
      const sessionId = task.sessionId || 'S_DEFAULT';
      if (!checkTaskStatus(task)) return false;
      if (textKeywords.length === 0) return true;

      const selfText = [
        getNameWithGroup(task.musicianId, 'musician'),
        getNameWithGroup(task.editorId, 'musician'),
        getNameWithGroup(task.projectId, 'project'),
        getNameWithGroup(task.instrumentId, 'instrument'),
        task.recordingInfo?.studio,
        task.recordingInfo?.engineer,
        task.recordingInfo?.notes,
      ].join(' ');

      if (textKeywords.every((keyword) => smartMatch(selfText, keyword))) return true;

      let subItems = [];
      if (settings.workflow?.version === 11) {
        subItems = itemPool.value.filter((item) => getPartAllocation(settings, item, getScheduleStage(task))?.scheduleId === task.scheduleId);
      } else if (task.templateId) {
        const exactItem = itemPool.value.find((item) => item.id === task.templateId);
        if (exactItem) subItems.push(exactItem);
      } else {
        const mySectionIndex = scheduleSectionMap.get(task.scheduleId);
        subItems = itemPool.value.filter((item) => {
          if ((item.sessionId || 'S_DEFAULT') !== sessionId) return false;
          if (!itemMatchesSchedule(item, task)) return false;
          const itemIndex = peekItemSplitState(item, viewFromStage(getScheduleStage(task))).sectionIndex;
          return itemIndex === mySectionIndex;
        });
      }

      return subItems.some((item) => {
        const itemText = [
          getNameWithGroup(item.projectId, 'project'),
          getNameWithGroup(item.instrumentId, 'instrument'),
          getNameWithGroup(item.musicianId, 'musician'),
          item.splitTag,
          item.recordingInfo?.notes,
        ].join(' ');
        const combinedText = `${itemText} ${selfText}`;
        return textKeywords.every((keyword) => smartMatch(combinedText, keyword));
      });
    });
  });

  watch(showTrackList, (val) => {
    if (!val) trackListSearchQuery.value = '';
  });

  watch(globalSearchQuery, () => {
    currentSearchIndex.value = 0;
  });

  const handleTrackListSearchAction = (isEnter = false) => {
    const query = trackListSearchQuery.value.trim().toLowerCase();

    if (searchHighlightTimer.value) {
      clearTimeout(searchHighlightTimer.value);
      searchHighlightTimer.value = null;
    }

    if (lastHighlightedTrackId.value) {
      const prevEl = document.getElementById('track-item-' + lastHighlightedTrackId.value);
      if (prevEl) {
        prevEl.classList.remove('ring-2', 'ring-[#007aff]', 'bg-blue-50', 'dark:bg-white/20', 'z-50');
      }
      lastHighlightedTrackId.value = null;
    }

    if (!query) {
      trackSearchIndex.value = -1;
      lastTrackSearchQuery.value = '';
      return;
    }

    const items = trackListData.value.items;
    const matchedIndices = [];

    items.forEach((item, index) => {
      const text = [
        item.name,
        getNameById(item.musicianId, 'musician'),
        getNameById(item.editorId, 'musician'),
        getNameById(item.instrumentId, 'instrument'),
        getNameById(item.projectId, 'project'),
        item.splitTag || '',
        item.orchestration || '',
      ].join(' ').toLowerCase();

      if (text.includes(query)) matchedIndices.push(index);
    });

    if (matchedIndices.length === 0) return;

    if (isEnter && query === lastTrackSearchQuery.value) {
      trackSearchIndex.value = (trackSearchIndex.value + 1) % matchedIndices.length;
    } else {
      trackSearchIndex.value = 0;
    }
    lastTrackSearchQuery.value = query;

    const targetItemIndex = matchedIndices[trackSearchIndex.value];
    const targetItem = items[targetItemIndex];

    if (targetItem) {
      const el = document.getElementById('track-item-' + targetItem.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#007aff]', 'bg-blue-50', 'dark:bg-white/20', 'z-50');
        lastHighlightedTrackId.value = targetItem.id;

        searchHighlightTimer.value = setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#007aff]', 'bg-blue-50', 'dark:bg-white/20', 'z-50');
          if (lastHighlightedTrackId.value === targetItem.id) {
            lastHighlightedTrackId.value = null;
          }
        }, 2000);

      }
    }
  };

  const handleSearchEnter = () => {
    const tasks = filteredScheduledTasks.value;

    if (tasks.length > 0) {
      const sorted = [...tasks].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });

      if (currentSearchIndex.value >= sorted.length) {
        currentSearchIndex.value = 0;
      }

      const target = sorted[currentSearchIndex.value];
      smartScrollToTask(target);

      const nextIndex = (currentSearchIndex.value + 1) % sorted.length;
      currentSearchIndex.value = nextIndex;
    } else {
      const sidebarItems = filteredSidebarList.value;
      if (sidebarItems.length > 0) {
        openAlertModal('查找结果', '日程表中未找到匹配项，但在任务池(Sidebar)中找到了相关任务。');
      }
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      isSearchFocused.value = false;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 100);
  };

  const onSearchFocus = () => {
    isSearchFocused.value = true;

    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    }, 100);

    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
  };

  return {
    filteredScheduledTasks,
    filteredSidebarList,
    getFullSearchText,
    getNameWithGroup,
    smartMatch,
    handleSearchEnter,
    handleSearchBlur,
    onSearchFocus,
    handleTrackListSearchAction,
  };
}
