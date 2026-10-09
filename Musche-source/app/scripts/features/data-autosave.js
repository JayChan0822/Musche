import { serializeWorkflowContent, isWorkflowWriteBlocked } from '../utils/workflow-migration.js';
export function registerDataAutosaveFeature(context = {}) {
  const { refs = {}, state = {}, services = {}, actions = {}, vue = {} } = context;
  const {
    itemPool = { value: [] },
    scheduledTasks = { value: [] },
    currentSessionId = { value: null },
    user = { value: null },
    saveStatus = { value: 'saved' },
    isBootstrappingData = { value: false },
  } = refs;
  const { settings = {} } = state;
  const { storageService = { saveData: () => {} } } = services;
  const {
    clearTimeout: clearTimeoutFn = (timer) => clearTimeout(timer),
    setTimeout: setTimeoutFn = (callback, delay) => setTimeout(callback, delay),
    saveToCloud = () => {},
  } = actions;
  const { watch: watchFn = null } = vue;

  let syncTimeout = null;

  const handleDataChanged = () => {
    if (isBootstrappingData.value || isWorkflowWriteBlocked(settings)) return;

    if (user.value) {
      if (saveStatus.value !== 'saving') {
        saveStatus.value = 'unsaved';
      }

      clearTimeoutFn(syncTimeout);
      syncTimeout = setTimeoutFn(() => {
        saveToCloud();
      }, 1000);
      return;
    }

    storageService.saveData('v11_data', serializeWorkflowContent(settings, itemPool.value, scheduledTasks.value, { lastSessionId: currentSessionId.value }));
  };

  const mountDataAutosaveWatcher = () => {
    if (!watchFn) return null;
    return watchFn([itemPool, scheduledTasks, settings, currentSessionId], handleDataChanged, { deep: true });
  };

  return {
    handleDataChanged,
    mountDataAutosaveWatcher,
  };
}
