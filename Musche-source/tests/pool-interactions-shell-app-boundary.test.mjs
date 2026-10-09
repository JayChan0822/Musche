import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers pool interactions through the pool interactions registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/pool-interactions.js',
    label: 'pool interactions feature',
  });
  assertAppFeatureRegistrarRegistry({
    registerName: 'wirePoolInteractionsFeature',
    modulePath: 'pool-interactions-feature-registrar.js',
    label: 'Pool Interactions',
  });
  assertNoStaticAppImport({
    modulePath: './features/pool-interactions-shell.js',
    label: 'the pass-through pool interactions shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerPoolInteractionsShellFeature\(/,
    label: 'the pass-through pool interactions shell feature',
  });
});
