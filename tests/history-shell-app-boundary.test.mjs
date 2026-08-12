import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers history through the history registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/history.js',
    label: 'history feature',
  });
  assertAppFeatureRegistrarRegistry({
    registerName: 'wireHistoryFeature',
    modulePath: 'history-feature-registrar.js',
    label: 'history',
  });
  assertNoStaticAppImport({
    modulePath: './features/history-shell.js',
    label: 'the pass-through history shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerHistoryShellFeature\(/,
    label: 'the pass-through history shell feature',
  });
});
