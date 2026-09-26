import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import JZZ from 'jzz';
import installJzzSmf from 'jzz-midi-smf';

import { reactive, ref } from 'vue';

import { registerImportMidiFeature } from '../app/scripts/features/import-midi.js';
import * as midiUtils from '../app/scripts/utils/midi.js';
import { formatSecs } from '../app/scripts/utils/format.js';
import { createDefaultSettings } from '../app/scripts/state/defaults.js';

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

async function previewSmf(t, smf, instruments) {
  let reader;
  t.mock.method(globalThis, 'FileReader', function () {
    reader = this;
    this.readAsBinaryString = () => {};
  });
  const harness = createMidiHarness({ instruments, smf });
  harness.feature.processMidiFile({});
  await reader.onload({ target: { result: '' } });
  assert.deepEqual(harness.alerts, []);
  return harness;
}

async function previewTrack(t, name, instruments) {
  const smf = [[
    { ff: 0x03, dd: name, tt: 0 },
    Object.assign([0x90, 60, 100], { tt: 0 }),
    Object.assign([0x80, 60, 0], { tt: 1920 }),
  ]];
  smf.ppqn = 480;
  return previewSmf(t, smf, instruments);
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

for (const [track, instrument] of [
  ['?? (Piano)', '钢琴 Piano'],
  ['PIANO R', '钢琴 Piano'],
  ['PIANO L', '钢琴 Piano'],
  ['钢琴 (Piano) 2', '钢琴 Piano'],
  ['古筝(Guzheng)', '古筝 Guzheng'],
  ['QUDI 1', '曲笛 Qudi'],
  ['XIAO', '箫 Xiao'],
  ['PIPA', '琵琶 Pipa'],
  ['ERHU', '二胡 Erhu'],
]) {
  test(`matches ${track} against the real default library`, async (t) => {
    const instruments = createDefaultSettings().instruments;
    const harness = await previewTrack(t, track, instruments);
    assert.equal(harness.refs.midiImportData.value[0].instrumentId,
      instruments.find((item) => item.name === instrument).id);
  });
}

for (const [track, libraryName] of [
  ['?? (Piano)', 'Grand Piano'],
  ['PIANO R', 'Grand Piano'],
  ['长笛 (Flute) 1', 'Flute'],
  ['第一小提琴 (Violin) 2', '小提琴 Violin'],
]) {
  test(`matches shared instrument names in ${track} and ${libraryName}`, async (t) => {
    const harness = await previewTrack(t, track, [{ id: 'MATCH', name: libraryName }]);
    assert.equal(harness.refs.midiImportData.value[0].instrumentId, 'MATCH');
  });
}

test('ambiguous Piano variants require a manual choice', async (t) => {
  const harness = await previewTrack(t, 'PIANO R', [
    { id: 'GRAND', name: 'Grand Piano' },
    { id: 'UPRIGHT', name: 'Upright Piano' },
  ]);
  assert.equal(harness.refs.midiImportData.value[0].instrumentId, '');
});

test('specific instrument names take priority over generic names', async (t) => {
  const harness = await previewTrack(t, '低音单簧管 (Bass Clarinet) 2', [
    { id: 'CL', name: '单簧管 Clarinet' },
    { id: 'BCL', name: '低音单簧管 Bass Clarinet' },
  ]);
  assert.equal(harness.refs.midiImportData.value[0].instrumentId, 'BCL');
});

// Opt in with the user's original Cubase export; do not commit their music as a fixture.
test('送情郎 Dorico export filters isolated duration outliers and saves track durations', {
  skip: !process.env.MUSCHE_TEST_MIDI,
}, async (t) => {
  midiUtils.installJzzSmfPlugin(JZZ, installJzzSmf);
  const smf = JZZ.MIDI.SMF(fs.readFileSync(process.env.MUSCHE_TEST_MIDI).toString('binary'));
  const instruments = createDefaultSettings().instruments;
  const harness = await previewSmf(t, smf, instruments);
  const rows = harness.refs.midiImportData.value.filter((row) => row.selected);
  assert.deepEqual(rows.map((row) => [row.name, row.noteCount, row.bars, formatSecs(row.quantizedDuration)]), [
    ['?? (Melody)', 386, 41, '00:02:42'],
    ['?? (Piano)', 541, 37, '00:02:25'],
    ['?? (Qudi)', 143, 8, '00:00:31'],
    ['? (Xiao)', 40, 10, '00:00:39'],
    ['?? (Pipa)', 76, 4, '00:00:17'],
    ['?? (Guzheng)', 210, 14, '00:00:54'],
    ['?? (Guqin)', 218, 30, '00:02:00'],
    ['?? (Erhu)', 76, 6, '00:00:25'],
    ['?? (Dagu)', 160, 8, '00:00:31'],
  ]);
  const pianoId = instruments.find((item) => item.name === '钢琴 Piano').id;
  assert.equal(rows.find((row) => row.name === '?? (Piano)').instrumentId, pianoId);
  // This test checks mapped library instruments; unmatched names retain manual mapping.
  rows.forEach((row) => { row.selected = !!row.instrumentId; });
  harness.feature.confirmMidiImport();
  const saved = JSON.parse(JSON.stringify(harness.refs.managingProject.value.midiData));
  assert.deepEqual(saved[pianoId].map((row) => [row.name, row.duration]), [
    ['?? (Piano)', '00:02:25'],
  ]);
  for (const row of rows.filter((row) => row.selected)) {
    assert.equal(saved[row.instrumentId].find((item) => item.name === row.name).duration,
      formatSecs(row.quantizedDuration));
  }
});
