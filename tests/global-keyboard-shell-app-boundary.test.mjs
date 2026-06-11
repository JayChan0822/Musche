import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers global keyboard through the keyboard registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/global-keyboard.js',
    label: 'global keyboard feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createGlobalKeyboardFeatureRegistrar',
    registerName: 'registerGlobalKeyboardFeature',
    modulePath: 'global-keyboard-feature-registrar.js',
    label: 'global keyboard',
  });
  assertNoStaticAppImport({
    modulePath: './features/global-keyboard-shell.js',
    label: 'the pass-through global keyboard shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerGlobalKeyboardShellFeature\(/,
    label: 'the pass-through global keyboard shell feature',
  });
});
