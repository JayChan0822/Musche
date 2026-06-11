import { registerCalendarViewFeature } from './calendar-view.js';
import { registerMainViewNavigationFeature } from './main-view-navigation.js';

export function registerViewNavigationFeature(context) {
  const { refs, state, utils, services, actions } = context;

  const calendarViewFeature = registerCalendarViewFeature({
    refs: {
      currentView: refs.currentView,
      monthViewMode: refs.monthViewMode,
      viewDate: refs.viewDate,
      visibleTopDate: refs.visibleTopDate,
      monthObserver: refs.monthObserver,
      monthRefs: refs.monthRefs,
      filteredScheduledTasks: refs.filteredScheduledTasks,
      weekContainer: refs.weekContainer,
      pxPerMin: refs.pxPerMin,
      isMobile: refs.isMobile,
      flashingTaskId: refs.flashingTaskId,
      mobileTab: refs.mobileTab,
    },
    state: {
      settings: state.settings,
    },
    utils: {
      formatDate: utils.formatDate,
      timeToMinutes: utils.timeToMinutes,
    },
    actions: {
      triggerTouchHaptic: actions.triggerTouchHaptic,
    },
  });

  const mainViewNavigationFeature = registerMainViewNavigationFeature({
    refs: {
      currentView: refs.currentView,
      monthViewMode: refs.monthViewMode,
      viewDate: refs.viewDate,
      dayColWidth: refs.dayColWidth,
      isMobile: refs.isMobile,
      isResizingMobile: refs.isResizingMobile,
      currentSessionId: refs.currentSessionId,
      sidebarTab: refs.sidebarTab,
      flashingTaskId: refs.flashingTaskId,
      isContextSwitching: refs.isContextSwitching,
    },
    services: {
      storageService: services.storageService,
    },
    actions: {
      changeDate: calendarViewFeature.changeDate,
      scrollToMonthDate: calendarViewFeature.scrollToMonthDate,
      isDragActive: actions.isDragActive,
      triggerTouchHaptic: actions.triggerTouchHaptic,
    },
  });

  return {
    renderedRange: calendarViewFeature.renderedRange,
    isLoadingMore: calendarViewFeature.isLoadingMore,
    setMonthRef: calendarViewFeature.setMonthRef,
    initMonthObserver: calendarViewFeature.initMonthObserver,
    timeSlots: calendarViewFeature.timeSlots,
    dateTransitionName: calendarViewFeature.dateTransitionName,
    changeDate: calendarViewFeature.changeDate,
    currentWeekDays: calendarViewFeature.currentWeekDays,
    generateMonthGrid: calendarViewFeature.generateMonthGrid,
    currentMonthDays: calendarViewFeature.currentMonthDays,
    flatScrolledDays: calendarViewFeature.flatScrolledDays,
    handleInfiniteScroll: calendarViewFeature.handleInfiniteScroll,
    scrollToMonthDate: calendarViewFeature.scrollToMonthDate,
    currentDateLabel: calendarViewFeature.currentDateLabel,
    tasksByDateMap: calendarViewFeature.tasksByDateMap,
    getTasksForDate: calendarViewFeature.getTasksForDate,
    switchToWeek: calendarViewFeature.switchToWeek,
    handleHeaderDoubleTap: calendarViewFeature.handleHeaderDoubleTap,
    handleMonthCellDoubleTap: calendarViewFeature.handleMonthCellDoubleTap,
    jumpToToday: calendarViewFeature.jumpToToday,
    isToday: calendarViewFeature.isToday,
    smartScrollToTask: calendarViewFeature.smartScrollToTask,
    viewTransitionName: mainViewNavigationFeature.viewTransitionName,
    switchView: mainViewNavigationFeature.switchView,
    onMainMouseDown: mainViewNavigationFeature.onMainMouseDown,
    onMainMouseUp: mainViewNavigationFeature.onMainMouseUp,
    onMainWheel: mainViewNavigationFeature.onMainWheel,
    onMainTouchStart: mainViewNavigationFeature.onMainTouchStart,
    onMainTouchEnd: mainViewNavigationFeature.onMainTouchEnd,
    isMouseViewDrag: mainViewNavigationFeature.isMouseViewDrag,
    widthIcon: mainViewNavigationFeature.widthIcon,
    cycleDayWidth: mainViewNavigationFeature.cycleDayWidth,
    jumpToGhostContext: mainViewNavigationFeature.jumpToGhostContext,
  };
}
