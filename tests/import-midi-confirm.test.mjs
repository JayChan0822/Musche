import assert from 'node:assert/strict';
import test from 'node:test';

import { reactive, ref } from 'vue';

import { registerImportMidiFeature } from '../app/scripts/features/import-midi.js';
import * as midiUtils from '../app/scripts/utils/midi.js';
import { formatSecs } from '../app/scripts/utils/format.js';

function createMidiHarness({ rows = [], instruments, smf } = {}) {
  const settings = reactive({
    instruments: instruments || [{ id: 'I_VLN', name: 'Violin', group: 'Strings' }],
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
      ...midiUtils,
      generateUniqueId: () => 'I_NEW',
      generateRandomHexColor: () => '#123456',
      formatSecs,
    },
    actions: {
      openAlertModal: (...args) => alerts.push(args),
      pushHistory: (label) => historyLabels.push(label || ''),
      triggerTouchHaptic: (type) => haptics.push(type),
      sortedInstruments: ref(settings.instruments),
      nextTick: (callback) => callback(),
      getElementById: () => null,
      loadMidiSmf: async () => () => smf,
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

async function previewTrack(t, name, instruments) {
  let reader;
  t.mock.method(globalThis, 'FileReader', function () {
    reader = this;
    this.readAsBinaryString = () => {};
  });
  const smf = [[
    { ff: 0x03, dd: name, tt: 0 },
    Object.assign([0x90, 60, 100], { tt: 0 }),
    Object.assign([0x80, 60, 0], { tt: 1920 }),
  ]];
  smf.ppqn = 480;
  const harness = createMidiHarness({ instruments, smf });
  harness.feature.processMidiFile({});
  await reader.onload({ target: { result: '' } });
  assert.deepEqual(harness.alerts, []);
  return harness;
}

// Node has no browser FileReader; only the file-read boundary is replaced.
globalThis.FileReader ??= class {};

for (const name of ['?? (Guzheng)', '？？（guzheng）', '古筝 (Guzheng)', 'Guzheng 2']) {
  test(`MIDI track ${name} reuses Guzheng and preserves its duration on import`, async (t) => {
    const harness = await previewTrack(t, name, [{ id: 'I_GZ', name: 'Guzheng', group: 'Plucks' }]);
    const row = harness.refs.midiImportData.value[0];
    assert.equal(row.instrumentId, 'I_GZ');
    assert.equal(row.createNew, false);
    assert.equal(row.group, 'Plucks');
    harness.feature.confirmMidiImport();
    assert.equal(harness.refs.settings.instruments.length, 1);
    assert.deepEqual(harness.refs.managingProject.value.midiData.I_GZ, [
      { name, duration: '00:00:02', order: 0 },
    ]);
  });
}

test('MIDI matching does not pick an arbitrary similar instrument', async (t) => {
  const harness = await previewTrack(t, 'Bass', [
    { id: 'I_CB', name: 'Contrabass' },
    { id: 'I_BG', name: 'Bass Guitar' },
    { id: 'I_DB', name: 'Double Bass' },
  ]);
  assert.equal(harness.refs.midiImportData.value[0].instrumentId, '');
});
