import { registerScheduleDragDropFeature } from './schedule-drag-drop.js';
import { registerScheduleTaskActivationFeature } from './schedule-task-activation.js';

export function registerScheduleInteractionsFeature(context) {
  const { refs, state, utils, actions } = context;

  const scheduleDragDropFeature = registerScheduleDragDropFeature({
    refs: {
      scheduledTasks: refs.scheduledTasks,
      pxPerMin: refs.pxPerMin,
      sidebarTab: refs.sidebarTab,
      currentSessionId: refs.currentSessionId,
      isMobile: refs.isMobile,
    },
    state: {
      settings: state.settings,
    },
    utils: {
      formatSecs: utils.formatSecs,
    },
    actions: {
      checkOverlap: actions.checkOverlap,
      openAlertModal: actions.openAlertModal,
      triggerTouchHaptic: actions.triggerTouchHaptic,
      pushHistory: actions.pushHistory,
      isResourceCompleted: actions.isResourceCompleted,
      clearPoolRecord: actions.clearPoolRecord,
      clearAggregateRecords: actions.clearAggregateRecords,
    },
  });

  const scheduleTaskActivationFeature = registerScheduleTaskActivationFeature({
    refs: {
      scheduledTasks: refs.scheduledTasks,
      itemPool: refs.itemPool,
      pxPerMin: refs.pxPerMin,
      currentSessionId: refs.currentSessionId,
      trackListData: refs.trackListData,
      showTrackList: refs.showTrackList,
      trackListContainerRef: refs.trackListContainerRef,
    },
    utils: {
      parseTime: utils.parseTime,
      formatSecs: utils.formatSecs,
    },
    actions: {
      isContextSwitchingActive: actions.isContextSwitchingActive,
      isTaskGhost: actions.isTaskGhost,
      jumpToGhostContext: actions.jumpToGhostContext,
      triggerTouchHaptic: actions.triggerTouchHaptic,
      pushHistory: actions.pushHistory,
      normalizeSplitViewType: actions.normalizeSplitViewType,
      isItemVisibleForView: actions.isItemVisibleForView,
      syncItemForView: actions.syncItemForView,
      ensureItemRecords: actions.ensureItemRecords,
      getNameById: actions.getNameById,
      autoSortTrackList: actions.autoSortTrackList,
      preloadTrackList: actions.preloadTrackList,
    },
  });

  return {
    dragStart: scheduleDragDropFeature.dragStart,
    handleDragEnd: scheduleDragDropFeature.handleDragEnd,
    dragEnterPool: scheduleDragDropFeature.dragEnterPool,
    dragLeavePool: scheduleDragDropFeature.dragLeavePool,
    dropToPool: scheduleDragDropFeature.dropToPool,
    dragEnterSlot: scheduleDragDropFeature.dragEnterSlot,
    dragLeaveSlot: scheduleDragDropFeature.dragLeaveSlot,
    dropToSchedule: scheduleDragDropFeature.dropToSchedule,
    dropToMonth: scheduleDragDropFeature.dropToMonth,
    handleTaskDblClick: scheduleTaskActivationFeature.handleTaskDblClick,
  };
}
