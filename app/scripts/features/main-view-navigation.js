import { computed, ref } from 'vue';

export function registerMainViewNavigationFeature(context) {
  const { refs, services = {}, actions = {} } = context;
  const {
    currentView,
    monthViewMode,
    viewDate,
    dayColWidth,
    isMobile,
    isResizingMobile,
    currentSessionId,
    sidebarTab,
    flashingTaskId,
    isContextSwitching,
  } = refs;
  const { storageService } = services;
  const {
    changeDate = () => {},
    scrollToMonthDate = () => {},
    isDragActive = () => false,
    getWindow = () => window,
    getElementById = (id) => document.getElementById(id),
    setTimeoutFn = setTimeout,
  } = actions;

  const viewTransitionName = ref('view-slide-left');
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const isMouseViewDrag = ref(false);
  const mouseStartX = ref(0);
  const mouseStartY = ref(0);
  let isWheelLocked = false;

  const switchView = (targetView) => {
    if (targetView === currentView.value) return;

    if (targetView === 'month') {
      viewTransitionName.value = 'zoom-out';
      currentView.value = targetView;

      if (monthViewMode.value === 'scrolled') {
        scrollToMonthDate(viewDate.value);
      }
    } else {
      viewTransitionName.value = 'zoom-in';
      currentView.value = targetView;
    }

  };

  const onMainMouseDown = (event) => {
    if (isMobile.value || isDragActive()) return;
    if (event.button !== 0) return;
    if (event.target.closest('.task-block') || event.target.closest('.resize-handle')) return;

    isMouseViewDrag.value = true;
    mouseStartX.value = event.clientX;
    mouseStartY.value = event.clientY;
  };

  const onMainMouseUp = (event) => {
    if (!isMouseViewDrag.value) return;
    isMouseViewDrag.value = false;

    const diffX = event.clientX - mouseStartX.value;
    const diffY = event.clientY - mouseStartY.value;

    if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {
      const dir = diffX < 0 ? 1 : -1;
      changeDate(dir);
    }
  };

  const onMainWheel = (event) => {
    if (isWheelLocked || event.ctrlKey || event.metaKey) return;

    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 30) {
      event.preventDefault();

      const dir = event.deltaX > 0 ? 1 : -1;
      changeDate(dir);

      isWheelLocked = true;
      setTimeoutFn(() => {
        isWheelLocked = false;
      }, 800);
    }
  };

  const onMainTouchStart = (event) => {
    if (isDragActive() || isResizingMobile.value) return;

    touchStartX.value = event.touches[0].clientX;
    touchStartY.value = event.touches[0].clientY;
  };

  const onMainTouchEnd = (event) => {
    if (isDragActive() || isResizingMobile.value) return;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const diffX = endX - touchStartX.value;
    const diffY = endY - touchStartY.value;

    if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 50) {
      let dir = 0;
      if (diffX < 0) dir = 1;
      if (diffX > 0) dir = -1;

      if (dir !== 0) {
        if (currentView.value === 'week') {
          if (dayColWidth.value < 60) {
            changeDate(dir);
          }
        } else if (currentView.value === 'month') {
          changeDate(dir);
        }
      }
    }

    touchStartX.value = 0;
    touchStartY.value = 0;
  };

  const widthIcon = computed(() => {
    if (currentView.value === 'month') {
      return monthViewMode.value === 'paged' ? 'fa-scroll' : 'fa-table-cells';
    }

    if (dayColWidth.value >= 100) return 'fa-compress';
    return 'fa-expand';
  });

  const cycleDayWidth = () => {
    if (currentView.value === 'month') {
      monthViewMode.value = monthViewMode.value === 'paged' ? 'scrolled' : 'paged';

      if (monthViewMode.value === 'scrolled') {
        scrollToMonthDate(viewDate.value);
      } else {
        const main = getElementById('main-content');
        if (main) main.scrollTop = 0;
      }
      return;
    }

    if (dayColWidth.value >= 100) {
      dayColWidth.value = getWindow().innerWidth < 400 ? 45 : 52;
    } else {
      dayColWidth.value = 100;
    }

    storageService?.setItem('musche_day_width', dayColWidth.value);
  };

  const getGhostTargetTab = (task) => {
    if (task.musicianId) return 'musician';
    if (task.projectId) return 'project';
    if (task.instrumentId) return 'instrument';
    return 'musician';
  };

  const jumpToGhostContext = (task) => {
    isContextSwitching.value = true;
    setTimeoutFn(() => {
      isContextSwitching.value = false;
    }, 600);

    let changed = false;
    const taskSession = task.sessionId || 'S_DEFAULT';
    if (currentSessionId.value !== taskSession) {
      currentSessionId.value = taskSession;
      changed = true;
    }

    const targetTab = getGhostTargetTab(task);
    if (sidebarTab.value !== targetTab) {
      sidebarTab.value = targetTab;
      changed = true;
    }

    if (changed) {
      flashingTaskId.value = task.scheduleId;
      setTimeoutFn(() => {
        if (flashingTaskId.value === task.scheduleId) flashingTaskId.value = null;
      }, 1500);
    }
  };

  return {
    viewTransitionName,
    isMouseViewDrag,
    switchView,
    onMainMouseDown,
    onMainMouseUp,
    onMainWheel,
    onMainTouchStart,
    onMainTouchEnd,
    widthIcon,
    cycleDayWidth,
    jumpToGhostContext,
  };
}
