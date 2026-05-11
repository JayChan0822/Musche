import { computed, watch } from 'vue';

export function registerSearchFeature(context) {
  const { refs, actions, utils } = context;
  const {
    globalSearchQuery,
    currentSearchIndex,
    searchHighlightTimer,
    lastHighlightedTrackId,
    lastTrackSearchQuery,
    trackSearchIndex,
    trackListSearchQuery,
    trackListData,
    filteredScheduledTasks,
    sidebarList,
    showTrackList,
    isSearchFocused,
    isMobile,
  } = refs;
  const { getNameById } = utils;
  const {
    openAlertModal,
    smartScrollToTask,
    triggerTouchHaptic,
  } = actions;

  const filteredSidebarList = computed(() => sidebarList.value);

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

        if (isMobile.value) triggerTouchHaptic('Light');
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
      triggerTouchHaptic('Success');

      const nextIndex = (currentSearchIndex.value + 1) % sorted.length;
      currentSearchIndex.value = nextIndex;
    } else {
      const sidebarItems = filteredSidebarList.value;
      if (sidebarItems.length > 0) {
        openAlertModal('查找结果', '日程表中未找到匹配项，但在任务池(Sidebar)中找到了相关任务。');
      } else {
        triggerTouchHaptic('Error');
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
    filteredSidebarList,
    handleSearchEnter,
    handleSearchBlur,
    onSearchFocus,
    handleTrackListSearchAction,
  };
}
