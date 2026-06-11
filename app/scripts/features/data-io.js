import { registerDataPortabilityFeature } from './data-portability.js';
import { computed, reactive, ref, shallowRef } from 'vue';

export function registerDataIoFeature(context) {
  const { refs, state, utils, actions, ioState = {} } = context;
  const loadExportCsvFeature = actions.loadExportCsvFeature || (async () => {
    const module = await import('./export-csv.js');
    return module.registerExportCsvFeature;
  });

  const dataPortabilityFeature = registerDataPortabilityFeature({
    refs: {
      itemPool: refs.itemPool,
      scheduledTasks: refs.scheduledTasks,
      currentSessionId: refs.currentSessionId,
    },
    state: {
      settings: state.settings,
    },
    utils: {
      parseTime: utils.parseTime,
      getNameById: utils.getNameById,
    },
    actions: {
      openInputModal: actions.openInputModal,
      openAlertModal: actions.openAlertModal,
      pushHistory: actions.pushHistory,
    },
    ioState: {
      showImportModal: ioState.showImportModal,
    },
  });

  const showExportModal = ioState.showExportModal || ref(false);
  const exportFilter = ioState.exportFilter || reactive({
    sessions: new Set(),
    projects: new Set(),
    musicians: new Set(),
    instruments: new Set(),
    types: new Set(['REC', 'EDT']),
    dateFrom: '',
    dateTo: '',
    searchProject: '',
    searchMusician: '',
    searchInstrument: '',
  });
  const exportCsvFeatureRef = shallowRef(null);
  let exportCsvFeaturePromise = null;

  const getExportCsvFeature = () => {
    if (!exportCsvFeaturePromise) {
      exportCsvFeaturePromise = loadExportCsvFeature().then((registerExportCsvFeature) => {
        const exportCsvFeature = registerExportCsvFeature({
          refs: {
            itemPool: refs.itemPool,
            scheduledTasks: refs.scheduledTasks,
            currentSessionId: refs.currentSessionId,
          },
          state: {
            settings: state.settings,
          },
          exportState: {
            showExportModal,
            exportFilter,
          },
          utils: {
            parseTime: utils.parseTime,
            getNameById: utils.getNameById,
          },
          actions: {
            openAlertModal: actions.openAlertModal,
            openInputModal: actions.openInputModal,
            loadXlsx: actions.loadXlsx,
          },
        });
        exportCsvFeatureRef.value = exportCsvFeature;
        return exportCsvFeature;
      });
    }
    return exportCsvFeaturePromise;
  };
  const withExportCsvFeature = async (callback) => callback(await getExportCsvFeature());
  const exportSessionOptions = computed(() => exportCsvFeatureRef.value?.exportSessionOptions.value || []);
  const filteredExportProjects = computed(() => exportCsvFeatureRef.value?.filteredExportProjects.value || []);
  const filteredExportMusicians = computed(() => exportCsvFeatureRef.value?.filteredExportMusicians.value || []);
  const filteredExportInstruments = computed(() => exportCsvFeatureRef.value?.filteredExportInstruments.value || []);
  const exportDateRange = computed(() => exportCsvFeatureRef.value?.exportDateRange.value || { min: '', max: '' });
  const exportPreviewCount = computed(() => exportCsvFeatureRef.value?.exportPreviewCount.value || 0);
  const openExportModal = () => withExportCsvFeature((feature) => feature.openExportModal());
  const toggleFilterItem = (setName, id) => withExportCsvFeature((feature) => feature.toggleFilterItem(setName, id));
  const toggleFilterAll = (setName, allIds) => withExportCsvFeature((feature) => feature.toggleFilterAll(setName, allIds));
  const confirmExport = () => withExportCsvFeature((feature) => feature.confirmExport());

  return {
    showImportModal: dataPortabilityFeature.showImportModal,
    exportToICS: dataPortabilityFeature.exportToICS,
    exportJSON: dataPortabilityFeature.exportJSON,
    importJSON: dataPortabilityFeature.importJSON,
    triggerFileSelect: dataPortabilityFeature.triggerFileSelect,
    handleJSONFile: dataPortabilityFeature.handleJSONFile,
    showExportModal,
    exportFilter,
    exportSessionOptions,
    filteredExportProjects,
    filteredExportMusicians,
    filteredExportInstruments,
    exportDateRange,
    exportPreviewCount,
    exportCSV: openExportModal,
    openExportModal,
    toggleFilterItem,
    toggleFilterAll,
    confirmExport,
  };
}
