import assert from 'node:assert/strict';
import test from 'node:test';

import { computed, reactive, ref } from 'vue';

import { registerDataIoFeature } from '../app/scripts/features/data-io.js';

function createContext(overrides = {}) {
  return {
    refs: {
      itemPool: ref([]),
      scheduledTasks: ref([{ scheduleId: 'task-1', sessionId: 'S_DEFAULT', date: '2026-06-02', startTime: '10:00', estDuration: '01:00:00' }]),
      currentSessionId: ref('S_DEFAULT'),
    },
    state: {
      settings: reactive({
        sessions: [{ id: 'S_DEFAULT', name: '默认录音日程' }],
        projects: [],
        musicians: [],
        instruments: [],
      }),
    },
    utils: {
      parseTime: () => 3600,
      getNameById: () => 'Name',
    },
    actions: {
      openInputModal: () => {},
      openAlertModal: () => {},
      pushHistory: () => {},
      loadXlsx: async () => ({}),
      ...overrides,
    },
  };
}

test('data I/O lazy-loads Excel export only when the export flow is opened', async () => {
  const calls = [];
  let dataIoFeature;
  dataIoFeature = registerDataIoFeature(createContext({
    loadExportCsvFeature: async () => {
      calls.push('load');
      return ({ exportState }) => {
        assert.equal(exportState.showExportModal, dataIoFeature.showExportModal);
        assert.equal(exportState.exportFilter, dataIoFeature.exportFilter);
        return {
          showExportModal: exportState.showExportModal,
          exportFilter: exportState.exportFilter,
          exportSessionOptions: computed(() => [{ id: 'S_DEFAULT', name: '默认录音日程' }]),
          filteredExportProjects: computed(() => []),
          filteredExportMusicians: computed(() => []),
          filteredExportInstruments: computed(() => []),
          exportDateRange: computed(() => ({ min: '2026-06-02', max: '2026-06-02' })),
          exportPreviewCount: computed(() => 1),
          openExportModal() {
            exportState.showExportModal.value = true;
          },
          toggleFilterItem() {},
          toggleFilterAll() {},
          confirmExport: async () => {},
          exportCSV() {
            exportState.showExportModal.value = true;
          },
        };
      };
    },
  }));

  assert.deepEqual(calls, [], 'registering data I/O must not load the Excel export module');
  assert.equal(dataIoFeature.showExportModal.value, false);
  assert.deepEqual(dataIoFeature.exportDateRange.value, { min: '', max: '' });

  await dataIoFeature.exportCSV();

  assert.deepEqual(calls, ['load'], 'opening Excel export must load the export module once');
  assert.equal(dataIoFeature.showExportModal.value, true);
  assert.deepEqual(dataIoFeature.exportSessionOptions.value, [{ id: 'S_DEFAULT', name: '默认录音日程' }]);

  await dataIoFeature.openExportModal();
  assert.deepEqual(calls, ['load'], 'reopening Excel export must reuse the loaded export module');
});
