import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers session through the session registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/session.js',
    label: 'session feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createSessionFeatureRegistrar',
    registerName: 'registerSessionFeature',
    modulePath: 'session-feature-registrar.js',
    label: 'session',
  });
  assertNoStaticAppImport({
    modulePath: './features/session-shell.js',
    label: 'the pass-through session shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerSessionShellFeature\(/,
    label: 'the pass-through session shell feature',
  });
});
