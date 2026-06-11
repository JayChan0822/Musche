import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAppFeatureRegistrarRegistry,
  assertNoAppImport,
  assertNoAppRegistration,
  assertNoStaticAppImport,
  assertSharedLazyFeatureProxy,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap uses the settings sync registrar and lazy-loads full settings actions', () => {
  assertNoStaticAppImport({
    modulePath: './features/settings-sync.js',
    label: 'light settings sync feature',
  });
  assertAppFeatureRegistrarRegistry({
    factoryName: 'createSettingsSyncFeatureRegistrar',
    registerName: 'wireSettingsSyncFeature',
    modulePath: 'settings-sync-feature-registrar.js',
    label: 'settings sync',
  });
  assertNoAppImport({
    modulePath: './features/settings.js',
    label: 'full settings feature',
  });
  assertNoAppImport({
    modulePath: './features/settings-shell.js',
    label: 'the pass-through settings shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerSettingsShellFeature\(/,
    label: 'the pass-through settings shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /settingsShellFeature|withSettingsShellFeature|getSettingsShellFeature/,
    'app.js should not keep settings shell feature variables after removing the shell',
  );
  assert.match(
    appScript,
    /allSettingsGrouped\s*=\s*computed\(\(\) => settingsFeature\.getAllSettingsGrouped\(\)\);/,
    'app.js should preserve the grouped settings computed adapter when wiring settings directly',
  );
});

test('app bootstrap proxies full settings handlers through the shared lazy feature proxy', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'settingsFeatureProxy',
    loaderName: 'loadSettingsFeature',
    methods: [
      'onSettingsItemDragStart',
      'onSettingsItemDragEnd',
      'disableRowDrag',
      'enableRowDrag',
      'onSettingsDragOver',
      'onSettingsDragLeave',
      'onSettingsDrop',
      'renameGroup',
      'addSettingsItem',
      'removeSettingsItem',
      'clearSettingsList',
      'handleItemRename',
    ],
    forbiddenPattern: /settingsFeaturePromise|getSettingsFeature|withSettingsFeature/,
    label: 'full settings feature',
  });
});
