import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap wires schedule helpers through the schedule registrar without the pass-through schedule shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/schedule.js',
    label: 'schedule feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createScheduleFeatureRegistrar',
    registerName: 'registerScheduleFeature',
    modulePath: 'schedule-feature-registrar.js',
    label: 'schedule',
  });

  assertNoStaticAppImport({
    modulePath: './features/schedule-shell.js',
    label: 'the pass-through schedule shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerScheduleShellFeature\(/,
    label: 'the pass-through schedule shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /scheduleShellFeature/,
    'app.js should not keep schedule shell feature variables after removing the shell',
  );
});
