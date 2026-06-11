import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers Quick Add through the Quick Add registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/quick-add.js',
    label: 'Quick Add feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createQuickAddFeatureRegistrar',
    registerName: 'registerQuickAddFeature',
    modulePath: 'quick-add-feature-registrar.js',
    label: 'Quick Add',
  });
  assertNoStaticAppImport({
    modulePath: './features/quick-add-shell.js',
    label: 'the pass-through Quick Add shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerQuickAddShellFeature\(/,
    label: 'the pass-through Quick Add shell feature',
  });
});
