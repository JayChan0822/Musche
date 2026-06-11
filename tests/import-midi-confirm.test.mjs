import assert from 'node:assert/strict';
import test from 'node:test';

import { reactive, ref } from 'vue';

import { registerImportMidiFeature } from '../app/scripts/features/import-midi.js';

function createMidiHarness({ rows }) {
  const settings = reactive({
    instruments: [{ id: 'I_VLN', name: 'Violin', group: 'Strings' }],
  });
  const refs = {
    settings,
    managingProject: ref({ id: 'P_MIDI', midiData: {} }),
    showMidiImportModal: ref(true),
    midiImportData: ref(rows),
    midiBpm: ref(120),
    midiTempoMap: ref(null),
    midiTimeSigs: ref(null),
    midiViewMode: ref('tracks'),
    midiTimeSig: ref([4, 4]),
    activeImportMenu: reactive({ rowId: null, type: null }),
    importMenuPos: reactive({ top: 0, left: 0, width: 0 }),
    importSearchQuery: ref(''),
  };
  const historyLabels = [];
  const haptics = [];
  const alerts = [];
  const feature = registerImportMidiFeature({
    refs,
    utils: {
      buildTempoMap: () => ({ events: [{ bpm: 120, mpb: 500000 }] }),
      buildTimeSigMap: () => [{ timeSignature: [4, 4] }],
      extractNotesFromJZZTrack: () => [],
      calculateBarQuantizedDuration: () => ({ seconds: 0, rawSeconds: 0, bars: 0 }),
      normalizeForMatch: (value) => String(value || '').toLowerCase().replace(/[^a-z0-9#]+/g, ' ').trim(),
      generateUniqueId: () => 'I_NEW',
      generateRandomHexColor: () => '#123456',
      formatSecs: (value) => `${value}s`,
    },
    actions: {
      openAlertModal: (...args) => alerts.push(args),
      pushHistory: (label) => historyLabels.push(label || ''),
      triggerTouchHaptic: (type) => haptics.push(type),
      sortedInstruments: ref(settings.instruments),
      nextTick: (callback) => callback(),
      getElementById: () => null,
      loadMidiSmf: async () => () => [],
    },
  });

  return { feature, refs, historyLabels, haptics, alerts };
}

test('confirming MIDI import with no selected rows keeps the modal open without success side effects', () => {
  const harness = createMidiHarness({
    rows: [{
      id: 1,
      name: 'Violin 1',
      originalName: 'Violin 1',
      instrumentId: 'I_VLN',
      createNew: false,
      selected: false,
      quantizedDuration: 1800,
      group: 'Strings',
      _sortIndex: 1,
    }],
  });

  harness.feature.confirmMidiImport();

  assert.deepEqual(harness.refs.managingProject.value.midiData, {}, 'no-op MIDI confirmation must not write midiData');
  assert.deepEqual(harness.historyLabels, [], 'no-op MIDI confirmation must not dirty undo history');
  assert.deepEqual(harness.haptics, [], 'no-op MIDI confirmation must not trigger success haptics');
  assert.equal(harness.refs.showMidiImportModal.value, true, 'no-op MIDI confirmation should keep the modal open');
  assert.deepEqual(harness.alerts, [['提示', '请至少选择一条可导入的 MIDI 轨道。']]);
});
