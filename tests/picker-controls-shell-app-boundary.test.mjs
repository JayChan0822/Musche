import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap registers picker controls through the picker controls registrar without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/picker-controls.js',
    label: 'picker-controls feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createPickerControlsFeatureRegistrar',
    registerName: 'registerPickerControlsFeature',
    modulePath: 'picker-controls-feature-registrar.js',
    label: 'picker controls',
  });
  assertNoStaticAppImport({
    modulePath: './features/picker-controls-shell.js',
    label: 'the pass-through picker-controls shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerPickerControlsShellFeature\(/,
    label: 'the pass-through picker-controls shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /pickerControlsShellFeature/,
    'app.js should not keep picker-controls shell feature variables after removing the shell',
  );
});
