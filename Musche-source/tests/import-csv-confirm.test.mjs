import assert from 'node:assert/strict';
import test from 'node:test';

import { reactive, ref } from 'vue';

import { registerImportCsvFeature } from '../app/scripts/features/import-csv.js';

function createCsvHarness({ rows }) {
  const refs = {
    csvSearchQuery: ref(''),
    csvImportData: ref(rows),
    csvImportConfig: reactive({
      importTypes: { tasks: true, time: true, orch: true },
      nameStrategy: 'split',
      showSkipRows: false,
    }),
    activeImportTab: ref('rec'),
    collapsedProjects: reactive(new Set()),
    rawCsvRows: ref([]),
    csvHeadersMap: ref({}),
    showCsvImportModal: ref(true),
    itemPool: ref([]),
    scheduledTasks: ref([]),
    currentSessionId: ref('S_DEFAULT'),
  };
  const historyLabels = [];
  const alerts = [];
  const feature = registerImportCsvFeature({
    refs,
    state: {
      settings: {
        projects: [],
        instruments: [],
        musicians: [],
      },
    },
    utils: {
      formatSecs: (seconds) => `${seconds}s`,
      parseTime: (value) => value,
      normalizeDate: (value) => value,
      getOrchString: () => '',
      getNameById: () => '',
      getOrCreateSettingItem: () => '',
      calculateEstTime: () => '00:00',
      generateUniqueId: () => 'T_NEW',
    },
    actions: {
      pushHistory: (label) => historyLabels.push(label || ''),
      openAlertModal: (...args) => alerts.push(args),
      autoUpdateEfficiency: () => {},
      autoResizeSchedules: () => {},
      getElementById: () => null,
    },
  });

  return { feature, refs, historyLabels, alerts };
}

test('confirming CSV import with no selected rows closes the modal without pushing history', () => {
  const harness = createCsvHarness({
    rows: [{
      selected: false,
      hasRecData: true,
      hasEditData: false,
      recStatusText: 'SKIP',
      editStatusText: 'SKIP',
    }],
  });

  harness.feature.confirmCsvImport();

  assert.deepEqual(harness.historyLabels, [], 'no-op CSV confirmation must not dirty undo history');
  assert.equal(harness.refs.showCsvImportModal.value, false, 'no selected rows should close the CSV modal');
  assert.deepEqual(harness.alerts, [], 'no selected rows should close quietly');
});

test('confirming CSV import with only invalid selected rows alerts without pushing history', () => {
  const harness = createCsvHarness({
    rows: [{
      selected: true,
      hasRecData: false,
      hasEditData: false,
      recStatusText: 'SKIP',
      editStatusText: 'SKIP',
    }],
  });

  harness.feature.confirmCsvImport();

  assert.deepEqual(harness.historyLabels, [], 'invalid selected rows must not dirty undo history');
  assert.equal(harness.refs.showCsvImportModal.value, true, 'invalid selected rows should keep the CSV modal open');
  assert.deepEqual(harness.alerts, [['提示', '当前视图 (Recording) 没有选中的有效任务。']]);
});
