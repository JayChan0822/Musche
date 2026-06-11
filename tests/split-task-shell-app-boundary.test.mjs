import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers split task through the split task registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/split-task.js',
    label: 'split-task feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createSplitTaskFeatureRegistrar',
    registerName: 'wireSplitTaskFeature',
    modulePath: 'split-task-feature-registrar.js',
    label: 'Split Task',
  });
  assertNoStaticAppImport({
    modulePath: './features/split-task-shell.js',
    label: 'the pass-through split-task shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerSplitTaskShellFeature\(/,
    label: 'the pass-through split-task shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /splitTaskShellFeature/,
    'app.js should not keep split-task shell feature variables after removing the shell',
  );
});
