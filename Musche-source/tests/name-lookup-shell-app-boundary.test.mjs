import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers name lookup through the name lookup registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/name-lookup.js',
    label: 'name lookup feature',
  });
  assertAppFeatureRegistrarRegistry({
    registerName: 'wireNameLookupFeature',
    modulePath: 'name-lookup-feature-registrar.js',
    label: 'name lookup',
  });
  assertNoStaticAppImport({
    modulePath: './features/name-lookup-shell.js',
    label: 'the pass-through name lookup shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerNameLookupShellFeature\(/,
    label: 'the pass-through name lookup shell feature',
  });
});
