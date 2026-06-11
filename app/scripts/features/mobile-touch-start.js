export function registerMobileTouchStartFeature(context) {
  const { refs, state, actions = {} } = context;
  const { isMobile, mobileTab } = refs;
  const {
    setTimeout: setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    isTaskGhost = () => false,
    startMobileDrag = () => {},
    triggerTouchHaptic = () => {},
  } = actions;

  const storeTouchStartState = (event, item, sourceType, dateStr = null) => {
    const touch = event.touches[0];
    const targetEl = event.currentTarget;

    state.dragSourceType = sourceType;
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.dragSourceTask = item;
    if (dateStr !== null) state.dragStartDate = dateStr;

    const rect = targetEl.getBoundingClientRect();
    state.cloneOffsetX = touch.clientX - rect.left;
    state.cloneOffsetY = touch.clientY - rect.top;
    state.dragClickOffsetY = touch.clientY - rect.top;

    return { touch, targetEl };
  };

  const handleTouchStart = (event, task, dateStr) => {
    if (!isMobile.value) return null;

    const { touch, targetEl } = storeTouchStartState(event, task, 'schedule', dateStr);

    state.longPressTimeout = setTimeoutFn(() => {
      if (!isTaskGhost(task)) {
        startMobileDrag(targetEl, touch);
      }
    }, 300);

    return state.longPressTimeout;
  };

  const handlePoolTouchStart = (event, item, type = 'pool') => {
    if (!isMobile.value) return null;
    if (type === 'pool') return null;

    if (
      type === 'aggregate' &&
      (item.statusKey === 'completed' || item.statusKey === 'full' || item.statusKey === 'in-progress')
    ) {
      return null;
    }

    const { touch, targetEl } = storeTouchStartState(event, item, type);

    state.longPressTimeout = setTimeoutFn(() => {
      startMobileDrag(targetEl, touch);
      mobileTab.value = 'schedule';
      triggerTouchHaptic('Heavy');
    }, 300);

    return state.longPressTimeout;
  };

  return {
    handleTouchStart,
    handlePoolTouchStart,
  };
}
