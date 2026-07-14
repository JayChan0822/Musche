export function registerMobileTouchMoveFeature(context) {
  const { refs, state, actions = {} } = context;
  const { isMobile, currentView, weekContainer } = refs;
  const {
    clearTimeout: clearTimeoutFn = (timer) => clearTimeout(timer),
    setTimeout: setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    getWindowSize = () => ({ innerWidth: window.innerWidth, innerHeight: window.innerHeight }),
    elementFromPoint = (x, y) => document.elementFromPoint(x, y),
    requestAnimationFrameFn = (callback) => requestAnimationFrame(callback),
    startAutoScroll = () => {},
    updateAutoScrollDirection = () => {},
    stopAutoScroll = () => {},
    isAutoScrollActive = () => false,
    changeDate = () => {},

  } = actions;

  const clearMonthSwitchTimer = () => {
    if (state.monthSwitchTimer) {
      clearTimeoutFn(state.monthSwitchTimer);
      state.monthSwitchTimer = null;
    }
  };

  const updateEdgePaging = (touch, directionHandler) => {
    const { innerWidth } = getWindowSize();
    const edgeThreshold = 50;
    let switchDir = 0;

    if (touch.clientX < edgeThreshold) switchDir = -1;
    else if (touch.clientX > innerWidth - edgeThreshold) switchDir = 1;

    if (switchDir !== 0) {
      if (!state.monthSwitchTimer) {
        state.monthSwitchTimer = setTimeoutFn(() => {
          directionHandler(switchDir);

          state.monthSwitchTimer = null;
        }, 800);
      }
    } else {
      clearMonthSwitchTimer();
    }
  };

  const updateWeekAutoScroll = (touch, scrollContainer) => {
    let vx = 0;
    let vy = 0;

    if (isMobile.value) {
      const { innerWidth, innerHeight } = getWindowSize();
      const topZone = 500;
      const bottomZone = innerHeight - 150;
      const leftZone = 60;
      const rightZone = innerWidth - 60;
      const ramp = 80;

      if (touch.clientY < topZone) vy = -Math.min(1, (topZone - touch.clientY) / ramp);
      else if (touch.clientY > bottomZone) vy = Math.min(1, (touch.clientY - bottomZone) / ramp);

      if (touch.clientX < leftZone) vx = -Math.min(1, (leftZone - touch.clientX) / ramp);
      else if (touch.clientX > rightZone) vx = Math.min(1, (touch.clientX - rightZone) / ramp);
    }

    if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
      if (!isAutoScrollActive()) startAutoScroll(vx, vy, scrollContainer, scrollContainer);
      else updateAutoScrollDirection(vx, vy);
    } else {
      stopAutoScroll();
    }
  };

  const updateDropSlotHighlight = (touch) => {
    const target = elementFromPoint(touch.clientX, touch.clientY);
    if (state.activeDropSlot) state.activeDropSlot.classList.remove('drag-over');
    state.activeDropSlot = null;

    if (target) {
      const slot = target.closest('.grid-slot, .droppable-slot');
      if (slot) {
        state.activeDropSlot = slot;
        state.activeDropSlot.classList.add('drag-over');
      }
    }
  };

  // 命中测试 / 高亮 / 边缘检测都会强制布局或样式重算，
  // 合并到每帧最多一次，避免 120Hz 触摸事件把帧预算吃光导致拖拽不跟手。
  let dragFrameQueued = false;
  let lastDragTouch = null;

  const processDragFrame = () => {
    dragFrameQueued = false;
    const touch = lastDragTouch;
    if (!touch || !state.dragElClone) return; // 拖拽已结束，丢弃过期帧

    const scrollContainer = weekContainer.value;

    if (currentView.value === 'week' && scrollContainer) {
      updateWeekAutoScroll(touch, scrollContainer);
      updateEdgePaging(touch, changeDate);
    } else if (currentView.value === 'month' && isMobile.value) {
      updateEdgePaging(touch, changeDate);
    }

    updateDropSlotHighlight(touch);
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];

    if (state.longPressTimeout && !state.dragElClone) {
      const deltaX = Math.abs(touch.clientX - state.startX);
      const deltaY = Math.abs(touch.clientY - state.startY);

      if (deltaX > 10 || deltaY > 10) {
        clearTimeoutFn(state.longPressTimeout);
        state.longPressTimeout = null;
      }
      return;
    }

    if (!state.dragElClone) return;

    if (event.cancelable) event.preventDefault();

    // 跟手的部分每个触摸事件都更新：只写 transform，由合成器直接消费，开销极低
    const x = touch.clientX - state.cloneOffsetX;
    const y = touch.clientY - state.cloneOffsetY;
    state.dragElClone.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    lastDragTouch = { clientX: touch.clientX, clientY: touch.clientY };
    if (!dragFrameQueued) {
      dragFrameQueued = true;
      requestAnimationFrameFn(processDragFrame);
    }
  };

  return {
    handleTouchMove,
  };
}
