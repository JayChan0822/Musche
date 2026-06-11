import { registerSelectionFeature } from './selection.js';
import { registerVisiblePoolItemsFeature } from './visible-pool-items.js';

export function registerPoolInteractionsFeature(context) {
  const { refs, actions } = context;

  const visiblePoolItemsFeature = registerVisiblePoolItemsFeature({
    refs: {
      sidebarTab: refs.sidebarTab,
    },
    actions: {
      getGroupedItemPool: actions.getGroupedItemPool,
      getCurrentSidebarList: actions.getCurrentSidebarList,
      isGroupExpanded: actions.isGroupExpanded,
      isStatExpanded: actions.isStatExpanded,
    },
  });

  const selectionFeature = registerSelectionFeature({
    refs: {
      selectedSource: refs.selectedSource,
      selectedTaskId: refs.selectedTaskId,
      selectedPoolIds: refs.selectedPoolIds,
      lastPoolFocusId: refs.lastPoolFocusId,
      lastPoolClickId: refs.lastPoolClickId,
      itemPool: refs.itemPool,
      scheduledTasks: refs.scheduledTasks,
      currentSessionId: refs.currentSessionId,
      sidebarTab: refs.sidebarTab,
      isSidebarOpen: refs.isSidebarOpen,
      isMobile: refs.isMobile,
    },
    actions: {
      getVisiblePoolItems: visiblePoolItemsFeature.getVisiblePoolItems,
      scrollToSidebarItem: actions.scrollToSidebarItem,
      smartScrollToTask: actions.smartScrollToTask,
      triggerTouchHaptic: actions.triggerTouchHaptic,
    },
  });

  return {
    getVisiblePoolItems: visiblePoolItemsFeature.getVisiblePoolItems,
    handlePoolItemClick: selectionFeature.handlePoolItemClick,
    selectTask: selectionFeature.selectTask,
    selectScheduleTask: selectionFeature.selectScheduleTask,
    selectPoolTask: selectionFeature.selectPoolTask,
    selectSinglePoolTask: selectionFeature.selectSinglePoolTask,
    togglePoolTaskSelection: selectionFeature.togglePoolTaskSelection,
    clearSelection: selectionFeature.clearSelection,
    selectPoolTaskRange: selectionFeature.selectPoolTaskRange,
    jumpToPoolSchedule: selectionFeature.jumpToPoolSchedule,
  };
}
