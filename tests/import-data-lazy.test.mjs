import assert from 'node:assert/strict';
import test from 'node:test';

import { computed, reactive, ref } from 'vue';

import { registerImportDataFeature } from '../app/scripts/features/import-data.js';

function createContext(overrides = {}) {
  return {
    refs: {
      csvSearchQuery: ref(''),
      csvImportData: ref([]),
      csvImportConfig: reactive({}),
      activeImportTab: ref('rec'),
      collapsedProjects: reactive(new Set()),
      rawCsvRows: ref([]),
      csvHeadersMap: ref({}),
      showCsvImportModal: ref(false),
      itemPool: ref([]),
      scheduledTasks: ref([]),
      currentSessionId: ref('S_DEFAULT'),
      managingProject: ref(null),
      showMidiImportModal: ref(false),
      midiImportData: ref([]),
      midiBpm: ref(120),
      midiTempoMap: ref(null),
      midiTimeSigs: ref([]),
      midiViewMode: ref('tracks'),
      midiTimeSig: ref([4, 4]),
      activeImportMenu: reactive({ rowId: null, type: null }),
      importMenuPos: ref({ top: 0, left: 0, width: 0 }),
      importSearchQuery: ref(''),
    },
    state: {
      settings: reactive({
        instruments: [],
        projects: [],
        musicians: [],
      }),
    },
    utils: {
      formatSecs: () => '00:00',
      parseTime: () => 0,
      normalizeDate: (value) => value,
      getOrchString: () => '',
      getNameById: () => 'Name',
      getOrCreateSettingItem: () => ({}),
      calculateEstTime: () => '00:00:00',
      generateUniqueId: () => 'id-1',
      buildTempoMap: () => ({}),
      buildTimeSigMap: () => [],
      extractNotesFromJZZTrack: () => [],
      calculateBarQuantizedDuration: () => ({ seconds: 0 }),
      normalizeForMatch: (value) => value,
      generateRandomHexColor: () => '#000000',
    },
    actions: {
      pushHistory: () => {},
      openAlertModal: () => {},
      autoUpdateEfficiency: () => {},
      autoResizeSchedules: () => {},
      triggerTouchHaptic: () => {},
      sortedInstruments: computed(() => []),
      nextTick: async () => {},
      getElementById: () => null,
      loadMidiSmf: async () => {},
      ...overrides,
    },
  };
}

test('import-data lazy-loads CSV and MIDI import features only when their flows are used', async () => {
  const calls = [];
  const feature = registerImportDataFeature(createContext({
    loadImportCsvFeature: async () => {
      calls.push('csv-load');
      return () => ({
        groupedCsvData: computed(() => [{ projectName: 'Project A', rows: [] }]),
        isAllSelected: computed(() => true),
        toggleProjectCollapse: (projectName) => calls.push(['csv-collapse', projectName]),
        toggleAllProjectCollapse: () => calls.push('csv-collapse-all'),
        calculateRowStatusText: () => 'NEW',
        toggleCsvSelection: () => {},
        isGroupSelected: () => false,
        toggleGroupSelection: () => {},
        toggleAllRows: () => {},
        parseCSVLine: () => ['a'],
        parseCSVRobust: () => [['a']],
        triggerCSV: () => calls.push('csv-trigger'),
        handleCSVImport: () => {},
        refreshCsvPreview: () => {},
        refreshCsvStatus: () => {},
        confirmCsvImport: () => {},
        addDataToPrepared: () => {},
      });
    },
    loadImportMidiFeature: async () => {
      calls.push('midi-load');
      return () => ({
        availableInstrumentGroups: computed(() => ['Strings']),
        midiGroupExpanded: reactive(new Set(['group-1'])),
        midiGroupData: computed(() => [{ id: 'group-1', name: 'Strings' }]),
        currentMidiDisplayList: computed(() => [{ id: 'track-1' }]),
        filteredImportOptions: computed(() => [{ id: 'inst-1' }]),
        toggleMidiGroupExpand: (groupId) => calls.push(['midi-expand', groupId]),
        findGroupSmart: () => 'Strings',
        findGroupFromLibrary: () => 'Strings',
        openImportMenu: () => {},
        closeImportMenu: () => {},
        selectImportInst: () => {},
        selectImportNewInst: () => {},
        selectImportGroup: () => {},
        triggerMidiImportForProject: () => calls.push('midi-project-trigger'),
        triggerMidiImport: () => calls.push('midi-trigger'),
        handleMidiFile: () => {},
        processMidiFile: () => {},
        onImportInstChange: () => {},
        getSmartName: () => 'Track',
        confirmMidiImport: () => {},
      });
    },
  }));

  assert.deepEqual(calls, [], 'registering import-data must not load CSV or MIDI import modules');
  assert.deepEqual(feature.groupedCsvData.value, [], 'CSV derived state should have an empty fallback before CSV import loads');
  assert.deepEqual(feature.availableInstrumentGroups.value, [], 'MIDI derived state should have an empty fallback before MIDI import loads');

  await feature.triggerCSV();

  assert.deepEqual(calls, ['csv-load', 'csv-trigger']);
  assert.deepEqual(feature.groupedCsvData.value, [{ projectName: 'Project A', rows: [] }]);

  await feature.toggleProjectCollapse('Project A');
  await feature.triggerCSV();

  assert.deepEqual(calls, ['csv-load', 'csv-trigger', ['csv-collapse', 'Project A'], 'csv-trigger'], 'CSV import feature should be cached after first use');

  await feature.triggerMidiImport();

  assert.deepEqual(calls, ['csv-load', 'csv-trigger', ['csv-collapse', 'Project A'], 'csv-trigger', 'midi-load', 'midi-trigger']);
  assert.deepEqual(feature.availableInstrumentGroups.value, ['Strings']);
  assert.equal(feature.midiGroupExpanded.has('group-1'), true);

  await feature.toggleMidiGroupExpand('group-1');
  await feature.triggerMidiImportForProject();

  assert.deepEqual(
    calls,
    ['csv-load', 'csv-trigger', ['csv-collapse', 'Project A'], 'csv-trigger', 'midi-load', 'midi-trigger', ['midi-expand', 'group-1'], 'midi-project-trigger'],
    'MIDI import feature should be cached after first use',
  );
});
