import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  appScript,
  assertNoAppRegistration,
  assertNoStaticAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers dropdowns through the dropdowns registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/dropdowns.js',
    label: 'dropdowns feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createDropdownsFeatureRegistrar',
    registerName: 'registerDropdownsFeature',
    modulePath: 'dropdowns-feature-registrar.js',
    label: 'dropdowns',
  });
  assertNoStaticAppImport({
    modulePath: './features/dropdowns-shell.js',
    label: 'the pass-through dropdowns shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerDropdownsShellFeature\(/,
    label: 'the pass-through dropdowns shell feature',
  });
});
