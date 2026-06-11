export function registerAppLifecycleFeature(context = {}) {
  const { refs = {}, values = {}, handlers = {}, actions = {} } = context;
  const {
    currentView = { value: 'week' },
    monthViewMode = { value: 'grid' },
    viewDate = { value: null },
    isBootstrappingData = { value: false },
  } = refs;
  const { isSidebarOpen = { value: false } } = values;
  const {
    handleGlobalKey = () => {},
    handleResizeMove = () => {},
    handleResizeEnd = () => {},
    closeDropdowns = () => {},
  } = handlers;
  const {
    attachClickHaptics = () => {},
    scrollToMonthDate = () => {},
    bootSessionData = async () => {},
    nextTick = async (callback) => {
      if (callback) callback();
    },
    setTimeout: setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    getWindow = () => window,
    getDocument = () => document,
  } = actions;

  const globalListeners = [
    ['keydown', handleGlobalKey],
    ['mousemove', handleResizeMove],
    ['mouseup', handleResizeEnd],
    ['click', closeDropdowns],
  ];

  const mountAppLifecycle = async () => {
    if (currentView.value === 'month' && monthViewMode.value === 'scrolled') {
      await nextTick(() => {
        scrollToMonthDate(viewDate.value);
      });
    }

    attachClickHaptics();
    const win = getWindow();
    globalListeners.forEach(([type, handler]) => {
      win.addEventListener(type, handler);
    });

    const loader = getDocument().getElementById('global-loader');
    if (loader) {
      setTimeoutFn(() => loader.classList.add('hidden'), 300);
    }

    isBootstrappingData.value = true;
    try {
      await bootSessionData({
        isSidebarOpen,
        skipHistory: true,
      });
    } finally {
      await nextTick();
      isBootstrappingData.value = false;
    }
  };

  const unmountAppLifecycle = () => {
    const win = getWindow();
    globalListeners.forEach(([type, handler]) => {
      win.removeEventListener(type, handler);
    });
  };

  return {
    mountAppLifecycle,
    unmountAppLifecycle,
  };
}
