import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers auth through the auth registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/auth.js',
    label: 'auth feature',
  });
  assertAppFeatureRegistrarRegistry({
    registerName: 'wireAuthFeature',
    modulePath: 'auth-feature-registrar.js',
    label: 'auth',
  });
  assertNoStaticAppImport({
    modulePath: './features/auth-shell.js',
    label: 'the pass-through auth shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerAuthShellFeature\(/,
    label: 'the pass-through auth shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /authShellFeature/,
    'app.js should not keep auth shell feature variables after removing the shell',
  );
  assert.match(
    appScript,
    /const\s+saveToCloud\s*=\s*\(force = false\)\s*=>\s*authFeature\.saveToCloud\(handleManualSync,\s*force\);/,
    'app.js should keep the manual-sync-aware saveToCloud adapter when wiring auth directly',
  );
});
