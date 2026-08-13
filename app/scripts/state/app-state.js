export function createAppState({ ref, reactive, getWindowWidth = () => globalThis.window?.innerWidth ?? 1024 } = {}) {
  if (typeof ref !== 'function' || typeof reactive !== 'function') {
    throw new TypeError('createAppState requires Vue ref and reactive factories');
  }
  if (typeof getWindowWidth !== 'function') {
    throw new TypeError('createAppState requires getWindowWidth to be a function when provided');
  }

  return {
    sidebarTab: ref('musician'),
    isMobile: ref(getWindowWidth() < 800),
    mobileTab: ref('schedule'),
    newItem: reactive({
      projectId: '',
      instrumentId: '',
      musicianId: '',
      musicDuration: '',
      ratio: 20,
    }),
    sortField: ref('status'),
    sortAsc: ref(true),
    authPasswordRef: ref(null),
    initialTouchCoords: reactive({ x: 0, y: 0 }),
    draggingTaskElement: ref(null),
    isSyncing: ref(false),
    isContextSwitching: ref(false),
    isZooming: ref(false),
    weekGridWrapper: ref(null),
    onBeforeLeave: () => {},
    onAfterLeave: () => {},
    dragState: {
      dragElClone: null,
      dragSourceTask: null,
      dragStartDate: null,
      longPressTimeout: null,
      startX: 0,
      startY: 0,
      cloneOffsetX: 0,
      cloneOffsetY: 0,
      activeDropSlot: null,
      dragSourceEl: null,
      touchOffsetMinutes: 0,
      dragClickOffsetY: 0,
      dragSourceType: 'schedule',
      monthSwitchTimer: null,
    },
  };
}
