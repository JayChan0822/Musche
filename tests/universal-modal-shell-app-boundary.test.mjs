import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers universal modal through the universal modal registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/universal-modal.js',
    label: 'universal-modal feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createUniversalModalFeatureRegistrar',
    registerName: 'wireUniversalModalFeature',
    modulePath: 'universal-modal-feature-registrar.js',
    label: 'universal modal',
  });
  assertNoStaticAppImport({
    modulePath: './features/universal-modal-shell.js',
    label: 'the pass-through universal-modal shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerUniversalModalShellFeature\(/,
    label: 'the pass-through universal-modal shell feature',
  });
});
