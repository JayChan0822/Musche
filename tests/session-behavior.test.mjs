import assert from 'node:assert/strict';
import test from 'node:test';

import { registerSessionFeature } from '../app/scripts/features/session.js';

const ref = (value) => ({ value });

function createSession(overrides = {}) {
  const calls = { cancel: 0, history: 0 };
  const refs = {
    currentSessionId: ref('S1'),
    activeDropdown: ref(null),
    ...(overrides.refs || {}),
  };
  const settings = {
    sessions: [{ id: 'S1', name: 'Main' }, { id: 'S2', name: 'Alt' }],
    ...(overrides.settings || {}),
  };
  const actions = {
    openInputModal: () => {},
    openConfirmModal: () => {},
    openAlertModal: () => {},
    pushHistory: () => { calls.history += 1; },
    cancelPendingTrackSave: () => { calls.cancel += 1; },
    ...(overrides.actions || {}),
  };
  const feature = registerSessionFeature({
    refs,
    state: { settings },
    utils: { generateUniqueId: (p) => `${p}_NEW` },
    actions,
  });
  return { feature, refs, settings, calls };
}

test('switchSession cancels pending track-save before switching the session id', () => {
  const { feature, refs, calls } = createSession();

  feature.switchSession('S2');

  assert.equal(calls.cancel, 1, 'switchSession must cancel the pending write-back');
  assert.equal(refs.currentSessionId.value, 'S2');
  assert.equal(refs.activeDropdown.value, null);
});

test('handleSessionAction new-session creation cancels pending track-save', () => {
  let confirmCallback;
  const { feature, refs, settings, calls } = createSession({
    actions: {
      openInputModal: (_title, _init, _placeholder, onConfirm) => { confirmCallback = onConfirm; },
    },
  });

  feature.handleSessionAction('new');
  confirmCallback('2026 春季录音');

  assert.equal(calls.cancel, 1, 'new-session creation must cancel the pending write-back');
  assert.equal(settings.sessions.length, 3);
  assert.equal(refs.currentSessionId.value, 'S_NEW');
  assert.equal(calls.history, 1);
});

test('handleSessionAction delete-session cancels pending track-save before falling to the first session', () => {
  let confirmCallback;
  const { feature, refs, calls } = createSession({
    actions: {
      openConfirmModal: (_title, _msg, onConfirm) => { confirmCallback = onConfirm; },
    },
  });

  feature.handleSessionAction('delete');
  confirmCallback();

  assert.equal(calls.cancel, 1, 'delete-session must cancel the pending write-back');
  assert.equal(refs.currentSessionId.value, 'S2', 'falls back to the first remaining session');
});

test('handleSessionAction delete refuses when only one session remains (no cancel)', () => {
  const alerts = [];
  const { feature, calls } = createSession({
    settings: { sessions: [{ id: 'S1', name: 'Only' }] },
    actions: { openAlertModal: (title) => alerts.push(title) },
  });

  feature.handleSessionAction('delete');

  assert.deepEqual(alerts, ['无法删除']);
  assert.equal(calls.cancel, 0, 'refused delete must not touch the pending write-back');
});
