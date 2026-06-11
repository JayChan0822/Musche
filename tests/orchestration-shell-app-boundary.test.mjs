import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers orchestration through the orchestration registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/orchestration.js',
    label: 'orchestration feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createOrchestrationFeatureRegistrar',
    registerName: 'registerOrchestrationFeature',
    modulePath: 'orchestration-feature-registrar.js',
    label: 'orchestration',
  });
  assertNoStaticAppImport({
    modulePath: './features/orchestration-shell.js',
    label: 'the pass-through orchestration shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerOrchestrationShellFeature\(/,
    label: 'the pass-through orchestration shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /orchestrationShellFeature/,
    'app.js should not keep orchestration shell feature variables after removing the shell',
  );
});
