import { registerMobileDragGhostFeature } from './mobile-drag-ghost.js';
import { registerMobileAutoScrollFeature } from './mobile-auto-scroll.js';
import { registerMobileResizeFeature } from './mobile-resize.js';
import { registerMobileTouchEndFeature } from './mobile-touch-end.js';
import { registerMobileTouchMoveFeature } from './mobile-touch-move.js';
import { registerMobileTouchStartFeature } from './mobile-touch-start.js';

export function registerMobileTouchFeature(context) {
  const { refs, state, data, utils, actions } = context;

  const dragGhostFeature = registerMobileDragGhostFeature({
    state,
    actions: {
    },
  });
  const autoScrollFeature = registerMobileAutoScrollFeature();

  const touchStartFeature = registerMobileTouchStartFeature({
    refs: {
      isMobile: refs.isMobile,
      mobileTab: refs.mobileTab,
    },
    state,
    actions: {
      isTaskGhost: actions.isTaskGhost,
      startMobileDrag: dragGhostFeature.startMobileDrag,
    },
  });

  const touchMoveFeature = registerMobileTouchMoveFeature({
    refs: {
      isMobile: refs.isMobile,
      currentView: refs.currentView,
      weekContainer: refs.weekContainer,
    },
    state,
    actions: {
      startAutoScroll: autoScrollFeature.startAutoScroll,
      updateAutoScrollDirection: autoScrollFeature.updateAutoScrollDirection,
      stopAutoScroll: autoScrollFeature.stopAutoScroll,
      isAutoScrollActive: autoScrollFeature.isAutoScrollActive,
      changeDate: actions.changeDate,
    },
  });

  const touchEndFeature = registerMobileTouchEndFeature({
    refs: {
      scheduledTasks: refs.scheduledTasks,
      pxPerMin: refs.pxPerMin,
      sidebarTab: refs.sidebarTab,
      currentSessionId: refs.currentSessionId,
      lastTapState: refs.lastTapState,
    },
    state,
    data: {
      getSettings: data.getSettings,
    },
    utils: {
      formatSecs: utils.formatSecs,
    },
    actions: {
      stopAutoScroll: autoScrollFeature.stopAutoScroll,
      isTaskGhost: actions.isTaskGhost,
      jumpToGhostContext: actions.jumpToGhostContext,
      handleTaskDblClick: actions.handleTaskDblClick,
      selectTask: actions.selectTask,
      checkOverlap: actions.checkOverlap,
      openAlertModal: actions.openAlertModal,
      pushHistory: actions.pushHistory,
    },
  });

  const resizeFeature = registerMobileResizeFeature({
    refs: {
      isMobile: refs.isMobile,
      isResizingMobile: refs.isResizingMobile,
      mobileResizeState: refs.mobileResizeState,
      pxPerMin: refs.pxPerMin,
    },
    utils: {
      timeToMinutes: utils.timeToMinutes,
      formatSecs: utils.formatSecs,
      parseTime: utils.parseTime,
    },
    actions: {
      checkOverlap: actions.checkOverlap,
      openAlertModal: actions.openAlertModal,
      pushHistory: actions.pushHistory,
    },
  });

  return {
    handleTouchStart: touchStartFeature.handleTouchStart,
    handlePoolTouchStart: touchStartFeature.handlePoolTouchStart,
    handleTouchMove: touchMoveFeature.handleTouchMove,
    handleTouchEnd: touchEndFeature.handleTouchEnd,
    initMobileResize: resizeFeature.initMobileResize,
    handleMobileResizeMove: resizeFeature.handleMobileResizeMove,
    handleMobileResizeEnd: resizeFeature.handleMobileResizeEnd,
    startMobileDrag: dragGhostFeature.startMobileDrag,
  };
}
