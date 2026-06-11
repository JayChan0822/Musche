import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers split view through the split view registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/split-view.js',
    label: 'split-view feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createSplitViewFeatureRegistrar',
    registerName: 'wireSplitViewFeature',
    modulePath: 'split-view-feature-registrar.js',
    label: 'split view',
  });
  assertNoStaticAppImport({
    modulePath: './features/split-view-shell.js',
    label: 'the pass-through split-view shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerSplitViewShellFeature\(/,
    label: 'the pass-through split-view shell feature',
  });
});
