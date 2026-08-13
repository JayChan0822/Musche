import assert from 'node:assert/strict';
import test from 'node:test';

import { ref } from 'vue';

import { registerDataPortabilityFeature } from '../app/scripts/features/data-portability.js';

function createPortability(overrides = {}) {
  const calls = { cancel: 0, history: 0 };
  const refs = {
    itemPool: ref([]),
    scheduledTasks: ref([]),
    currentSessionId: ref('S1'),
  };
  const settings = {
    sessions: [{ id: 'S1', name: 'Main' }],
    ...(overrides.settings || {}),
  };
  const actions = {
    openInputModal: () => {},
    openAlertModal: () => {},
    pushHistory: () => { calls.history += 1; },
    cancelPendingTrackSave: () => { calls.cancel += 1; },
    ...(overrides.actions || {}),
  };
  const feature = registerDataPortabilityFeature({
    refs,
    state: { settings },
    utils: { parseTime: () => 0, getNameById: () => '' },
    actions,
    ioState: { showImportModal: ref(false) },
  });
  return { feature, refs, settings, calls };
}

test('JSON import cancels pending track-save before replacing the pool', () => {
  let readCallback;
  const { feature, refs, calls } = createPortability({
    actions: {
      readFileAsText: (_file, _encoding, onLoaded) => { readCallback = onLoaded; },
    },
  });

  feature.handleJSONFile({
    target: {
      files: [{ name: 'backup.json' }],
      value: '/fake/path',
    },
  });

  readCallback({
    target: { result: JSON.stringify({ pool: [{ id: 'IMPORTED' }], tasks: [], settings: {} }) },
  });

  assert.equal(calls.cancel, 1, 'import must cancel the pending write-back before replacing the pool');
  assert.equal(refs.itemPool.value[0].id, 'IMPORTED');
  assert.equal(calls.history, 2, 'import pushes history before and after the replacement');
});
