import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers ratio through the ratio registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/ratio.js',
    label: 'ratio feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createRatioFeatureRegistrar',
    registerName: 'registerRatioFeature',
    modulePath: 'ratio-feature-registrar.js',
    label: 'ratio',
  });
  assertNoStaticAppImport({
    modulePath: './features/ratio-shell.js',
    label: 'the pass-through ratio shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerRatioShellFeature\(/,
    label: 'the pass-through ratio shell feature',
  });
});
