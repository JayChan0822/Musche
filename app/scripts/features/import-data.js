import { computed, ref, shallowRef } from 'vue';

export function registerImportDataFeature(context) {
  const { refs, state, utils, actions } = context;
  const getElementById = actions.getElementById || ((id) => document.getElementById(id));
  const loadImportCsvFeature = actions.loadImportCsvFeature || (async () => {
    const module = await import('./import-csv.js');
    return module.registerImportCsvFeature;
  });
  const loadImportMidiFeature = actions.loadImportMidiFeature || (async () => {
    const module = await import('./import-midi.js');
    return module.registerImportMidiFeature;
  });

  const importCsvFeatureRef = shallowRef(null);
  const importMidiFeatureRef = shallowRef(null);
  const midiGroupExpandedVersion = ref(0);
  let importCsvFeaturePromise = null;
  let importMidiFeaturePromise = null;

  const getImportCsvFeature = () => {
    if (!importCsvFeaturePromise) {
      importCsvFeaturePromise = loadImportCsvFeature().then((registerImportCsvFeature) => {
        const importCsvFeature = registerImportCsvFeature({
          refs: {
            csvSearchQuery: refs.csvSearchQuery,
            csvImportData: refs.csvImportData,
            csvImportConfig: refs.csvImportConfig,
            activeImportTab: refs.activeImportTab,
            collapsedProjects: refs.collapsedProjects,
            rawCsvRows: refs.rawCsvRows,
            csvHeadersMap: refs.csvHeadersMap,
            showCsvImportModal: refs.showCsvImportModal,
            itemPool: refs.itemPool,
            scheduledTasks: refs.scheduledTasks,
            currentSessionId: refs.currentSessionId,
          },
          state: {
            settings: state.settings,
          },
          utils: {
            formatSecs: utils.formatSecs,
            parseTime: utils.parseTime,
            normalizeDate: utils.normalizeDate,
            getOrchString: utils.getOrchString,
            getNameById: utils.getNameById,
            getOrCreateSettingItem: utils.getOrCreateSettingItem,
            calculateEstTime: utils.calculateEstTime,
            generateUniqueId: utils.generateUniqueId,
          },
          actions: {
            pushHistory: actions.pushHistory,
            openAlertModal: actions.openAlertModal,
            autoUpdateEfficiency: actions.autoUpdateEfficiency,
            autoResizeSchedules: actions.autoResizeSchedules,
            getElementById,
          },
        });
        importCsvFeatureRef.value = importCsvFeature;
        return importCsvFeature;
      });
    }
    return importCsvFeaturePromise;
  };

  const getImportMidiFeature = () => {
    if (!importMidiFeaturePromise) {
      importMidiFeaturePromise = loadImportMidiFeature().then((registerImportMidiFeature) => {
        const importMidiFeature = registerImportMidiFeature({
          refs: {
            settings: state.settings,
            managingProject: refs.managingProject,
            showMidiImportModal: refs.showMidiImportModal,
            midiImportData: refs.midiImportData,
            midiBpm: refs.midiBpm,
            midiTempoMap: refs.midiTempoMap,
            midiTimeSigs: refs.midiTimeSigs,
            midiViewMode: refs.midiViewMode,
            midiTimeSig: refs.midiTimeSig,
            activeImportMenu: refs.activeImportMenu,
            importMenuPos: refs.importMenuPos,
            importSearchQuery: refs.importSearchQuery,
          },
          utils: {
            buildTempoMap: utils.buildTempoMap,
            buildTimeSigMap: utils.buildTimeSigMap,
            extractNotesFromJZZTrack: utils.extractNotesFromJZZTrack,
            calculateBarQuantizedDuration: utils.calculateBarQuantizedDuration,
            normalizeForMatch: utils.normalizeForMatch,
            generateUniqueId: utils.generateUniqueId,
            generateRandomHexColor: utils.generateRandomHexColor,
            formatSecs: utils.formatSecs,
          },
          actions: {
            openAlertModal: actions.openAlertModal,
            pushHistory: actions.pushHistory,

            sortedInstruments: actions.sortedInstruments,
            nextTick: actions.nextTick,
            getElementById,
            loadMidiSmf: actions.loadMidiSmf,
          },
        });
        importMidiFeatureRef.value = importMidiFeature;
        midiGroupExpandedVersion.value++;
        return importMidiFeature;
      });
    }
    return importMidiFeaturePromise;
  };

  const withImportCsvFeature = async (callback) => callback(await getImportCsvFeature());
  const withImportMidiFeature = async (callback) => callback(await getImportMidiFeature());
  const csvComputed = (key, fallback) => computed(() => importCsvFeatureRef.value?.[key]?.value ?? fallback);
  const midiComputed = (key, fallback) => computed(() => importMidiFeatureRef.value?.[key]?.value ?? fallback);
  const callCsv = (key, ...args) => withImportCsvFeature((feature) => feature[key](...args));
  const callMidi = (key, ...args) => withImportMidiFeature((feature) => feature[key](...args));

  const midiGroupExpanded = {
    has(value) {
      midiGroupExpandedVersion.value;
      return importMidiFeatureRef.value?.midiGroupExpanded.has(value) ?? false;
    },
    add(value) {
      const result = importMidiFeatureRef.value?.midiGroupExpanded.add(value);
      midiGroupExpandedVersion.value++;
      return result;
    },
    delete(value) {
      const result = importMidiFeatureRef.value?.midiGroupExpanded.delete(value) ?? false;
      midiGroupExpandedVersion.value++;
      return result;
    },
    clear() {
      importMidiFeatureRef.value?.midiGroupExpanded.clear();
      midiGroupExpandedVersion.value++;
    },
  };

  return {
    groupedCsvData: csvComputed('groupedCsvData', []),
    isAllSelected: csvComputed('isAllSelected', false),
    toggleProjectCollapse: (...args) => callCsv('toggleProjectCollapse', ...args),
    toggleAllProjectCollapse: (...args) => callCsv('toggleAllProjectCollapse', ...args),
    calculateRowStatusText: (...args) => callCsv('calculateRowStatusText', ...args),
    toggleCsvSelection: (...args) => callCsv('toggleCsvSelection', ...args),
    isGroupSelected: (...args) => callCsv('isGroupSelected', ...args),
    toggleGroupSelection: (...args) => callCsv('toggleGroupSelection', ...args),
    toggleAllRows: (...args) => callCsv('toggleAllRows', ...args),
    parseCSVLine: (...args) => callCsv('parseCSVLine', ...args),
    parseCSVRobust: (...args) => callCsv('parseCSVRobust', ...args),
    triggerCSV: (...args) => callCsv('triggerCSV', ...args),
    handleCSVImport: (...args) => callCsv('handleCSVImport', ...args),
    refreshCsvPreview: (...args) => callCsv('refreshCsvPreview', ...args),
    refreshCsvStatus: (...args) => callCsv('refreshCsvStatus', ...args),
    confirmCsvImport: (...args) => callCsv('confirmCsvImport', ...args),
    addDataToPrepared: (...args) => callCsv('addDataToPrepared', ...args),
    availableInstrumentGroups: midiComputed('availableInstrumentGroups', []),
    midiGroupExpanded,
    midiGroupData: midiComputed('midiGroupData', []),
    currentMidiDisplayList: midiComputed('currentMidiDisplayList', []),
    filteredImportOptions: midiComputed('filteredImportOptions', []),
    toggleMidiGroupExpand: (...args) => callMidi('toggleMidiGroupExpand', ...args).then((result) => {
      midiGroupExpandedVersion.value++;
      return result;
    }),
    findGroupSmart: (...args) => callMidi('findGroupSmart', ...args),
    findGroupFromLibrary: (...args) => callMidi('findGroupFromLibrary', ...args),
    openImportMenu: (...args) => callMidi('openImportMenu', ...args),
    closeImportMenu: (...args) => callMidi('closeImportMenu', ...args),
    selectImportInst: (...args) => callMidi('selectImportInst', ...args),
    selectImportNewInst: (...args) => callMidi('selectImportNewInst', ...args),
    selectImportGroup: (...args) => callMidi('selectImportGroup', ...args),
    triggerMidiImportForProject: (...args) => callMidi('triggerMidiImportForProject', ...args),
    triggerMidiImport: (...args) => callMidi('triggerMidiImport', ...args),
    handleMidiFile: (...args) => callMidi('handleMidiFile', ...args),
    processMidiFile: (...args) => callMidi('processMidiFile', ...args),
    onImportInstChange: (...args) => callMidi('onImportInstChange', ...args),
    getSmartName: (...args) => importMidiFeatureRef.value?.getSmartName(...args) ?? '',
    confirmMidiImport: (...args) => callMidi('confirmMidiImport', ...args),
  };
}
