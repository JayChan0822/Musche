import { registerCalendarViewFeature } from './calendar-view.js';
import { registerMainViewNavigationFeature } from './main-view-navigation.js';

export function registerViewNavigationFeature(context) {
  const { refs, state, utils, services, actions } = context;

  // 延迟绑定：viewTransitionName 由 mainViewNavigationFeature 创建，
  // calendarViewFeature 先建，故用闭包在组合完成后接上。
  let applyViewTransitionName = null;

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
      // 跳转定位（任务/今天）时把视图切换动画设为无位移淡入，
      // 避免与定位滚动叠加打架；延迟绑定到 main-view-navigation 的 ref。
      setViewTransitionName: (name) => { applyViewTransitionName?.(name); },
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
      // ghost 任务跨 session 跳转直接改 currentSessionId：pending 写回需取消
      cancelPendingTrackSave: () => actions.cancelPendingTrackSave?.(),
    },
  });
  applyViewTransitionName = (name) => {
    mainViewNavigationFeature.viewTransitionName.value = name;
  };

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
