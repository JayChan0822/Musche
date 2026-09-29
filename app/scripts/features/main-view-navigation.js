import { getScheduleStage, viewFromStage } from '../utils/workflow.js';
import { computed, nextTick, ref, watch } from 'vue';

import { pickSidebarTab } from '../utils/sidebar-tabs.js';

export function registerMainViewNavigationFeature(context) {
  const { refs, services = {}, actions = {} } = context;
  const {
    currentView,
    monthViewMode,
    viewDate,
    dayColWidth,
    slotHeight,
    weekContainer,
    isMobile,
    isResizingMobile,
    resizing,
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
    cancelPendingTrackSave = () => {},
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
    // 手机端没有周视图（顶部按钮已去掉，看单天用日视图），任何路径都别切过去
    if (isMobile.value && targetView === 'week') return;
    if (targetView === currentView.value) return;

    if (targetView === 'month') {
      viewTransitionName.value = 'view-slide-up';
      currentView.value = targetView;

      if (monthViewMode.value === 'scrolled') {
        scrollToMonthDate(viewDate.value);
      }
    } else {
      viewTransitionName.value = 'view-slide-down';
      currentView.value = targetView;
    }

  };

  // 桌面端缩到手机宽度时如果正停在周视图，拉回月视图——否则会卡在一个没有返回入口的视图里
  watch(isMobile, (mobile) => {
    if (mobile && currentView.value === 'week') {
      currentView.value = 'month';
    }
  });

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

  let zoomRevision = 0;
  let pendingZoom = null;
  const setWeekZoom = (value, pointerOffset) => {
    const container = weekContainer?.value;
    const requested = Number(value);
    if (currentView.value !== 'week' || !slotHeight || !container || !Number.isFinite(requested)) return;
    if (isDragActive() || isResizingMobile?.value || resizing?.value) return;
    const header = container.firstElementChild?.offsetHeight || 0;
    const offset = pointerOffset ?? (header + (container.clientHeight - header) / 2);
    const oldHeight = slotHeight.value;
    const height = Math.max(16, Math.min(120, requested));
    if (height === oldHeight) return;
    // 连续输入共用待应用的滚动位置，避免新比例搭配旧位置而漂移。
    const scrollTop = pendingZoom?.container === container ? pendingZoom.top : container.scrollTop;
    const anchor = (scrollTop + offset - header) / oldHeight;
    const top = Math.max(0, header + anchor * height - offset);
    pendingZoom = { container, top };
    slotHeight.value = height;
    const revision = ++zoomRevision;
    nextTick(() => {
      if (revision !== zoomRevision) return;
      if (currentView.value === 'week' && weekContainer.value === container) container.scrollTop = top;
      pendingZoom = null;
    });
  };
  const onMainWheel = (event) => {
    if (event.metaKey && currentView.value === 'week' && slotHeight && weekContainer?.value) {
      const container = weekContainer.value;
      if (!container.contains(event.target)) return;
      event.preventDefault();
      if (isDragActive() || isResizingMobile.value || resizing?.value || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const header = container.firstElementChild?.offsetHeight || 0;
      const offset = Math.max(header, event.clientY - container.getBoundingClientRect().top);
      const oldHeight = slotHeight.value;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? container.clientHeight : 1);
      const height = Math.max(16, Math.min(120, oldHeight * Math.exp(-Math.max(-240, Math.min(240, delta)) * 0.003)));
      setWeekZoom(height, offset);
      return;
    }
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

  // ghost 任务跳转的目标分类：按 人员 → 项目 → 乐器 的优先级取第一个「仍然存在」的分类，
  // 乐器分类已下线，只有乐器 id 的任务回落到录音（默认分类），不会跳进没有入口的侧栏。
  const getGhostTargetTab = (task) => viewFromStage(getScheduleStage(task));

  const jumpToGhostContext = (task) => {
    isContextSwitching.value = true;
    setTimeoutFn(() => {
      isContextSwitching.value = false;
    }, 600);

    let changed = false;
    const taskSession = task.sessionId || 'S_DEFAULT';
    if (currentSessionId.value !== taskSession) {
      cancelPendingTrackSave();
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
    setWeekZoom,
    onMainTouchStart,
    onMainTouchEnd,
    widthIcon,
    cycleDayWidth,
    jumpToGhostContext,
  };
}
