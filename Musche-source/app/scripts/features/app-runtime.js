import { registerAppLifecycleFeature } from './app-lifecycle.js';
import { registerDataAutosaveFeature } from './data-autosave.js';

export function registerAppRuntimeFeature(context = {}) {
  const { refs = {}, values = {}, state = {}, services = {}, handlers = {}, actions = {}, vue = {} } = context;

  const appLifecycleFeature = registerAppLifecycleFeature({
    refs: {
      currentView: refs.currentView,
      monthViewMode: refs.monthViewMode,
      viewDate: refs.viewDate,
      isBootstrappingData: refs.isBootstrappingData,
    },
    values: {
      isSidebarOpen: values.isSidebarOpen,
    },
    handlers: {
      handleGlobalKey: (...args) => handlers.handleGlobalKey(...args),
      handleResizeMove: (...args) => handlers.handleResizeMove(...args),
      handleResizeEnd: (...args) => handlers.handleResizeEnd(...args),
      closeDropdowns: (...args) => handlers.closeDropdowns(...args),
    },
    actions: {
      scrollToMonthDate: (date) => actions.scrollToMonthDate(date),
      bootSessionData: (options) => actions.bootSessionData(options),
      nextTick: actions.nextTick,
    },
  });

  const dataAutosaveFeature = registerDataAutosaveFeature({
    refs: {
      itemPool: refs.itemPool,
      scheduledTasks: refs.scheduledTasks,
      currentSessionId: refs.currentSessionId,
      user: refs.user,
      saveStatus: refs.saveStatus,
      isBootstrappingData: refs.isBootstrappingData,
    },
    state: {
      settings: state.settings,
    },
    services: {
      storageService: services.storageService,
    },
    actions: {
      saveToCloud: () => actions.saveToCloud(),
    },
    vue,
  });

  const mountAppRuntime = () => {
    dataAutosaveFeature.mountDataAutosaveWatcher();
  };

  return {
    mountAppLifecycle: appLifecycleFeature.mountAppLifecycle,
    unmountAppLifecycle: appLifecycleFeature.unmountAppLifecycle,
    mountAppRuntime,
  };
}
