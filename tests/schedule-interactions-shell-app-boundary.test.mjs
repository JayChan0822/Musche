import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers schedule interactions through the schedule interactions registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/schedule-interactions.js',
    label: 'schedule-interactions feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createScheduleInteractionsFeatureRegistrar',
    registerName: 'wireScheduleInteractionsFeature',
    modulePath: 'schedule-interactions-feature-registrar.js',
    label: 'schedule interactions',
  });
  assertNoStaticAppImport({
    modulePath: './features/schedule-interactions-shell.js',
    label: 'the pass-through schedule-interactions shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerScheduleInteractionsShellFeature\(/,
    label: 'the pass-through schedule-interactions shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /scheduleInteractionsShellFeature/,
    'app.js should not keep schedule-interactions shell feature variables after removing the shell',
  );
});
