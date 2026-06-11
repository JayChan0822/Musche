import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appDependenciesModule,
  appFeatureLoadersModule,
  appSupportLoadersModule,
  appScript,
  assertNoAppRegistration,
  assertNoDynamicAppImport,
  assertNoStaticAppImport,
  assertSharedLazyFeatureProxy,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap lazy-loads import-data through the dependency loader without the pass-through shell', () => {
  assertNoStaticAppImport({
    modulePath: './features/import-data.js',
    registerName: 'registerImportDataFeature',
    label: 'import-data feature',
  });
  assertNoDynamicAppImport({
    modulePath: './features/import-data.js',
    label: 'import-data feature internals',
  });
  assertNoDynamicAppImport({
    modulePath: './features/import-shell.js',
    label: 'the pass-through import shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerImportShellFeature\(/,
    label: 'the pass-through import shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /importShellFeature|withImportShellFeature|getImportShellFeature/,
    'app.js should not keep import shell feature variables after removing the shell',
  );
});

test('app bootstrap keeps MIDI SMF support inside the import-data dependency loader boundary', () => {
  assert.match(
    appDependenciesModule,
    /createAppFeatureLoaders\(\{[\s\S]*midiSmfSupport:\s*supportLoaders\.loadMidiSmf[\s\S]*\}\)/,
    'app dependencies should inject MIDI SMF support into the import-data feature loader registry',
  );
  assert.match(
    appFeatureLoadersModule,
    /createImportDataDependencyLoader\(\{\s*loadMidiSmf:\s*midiSmfSupport\s*\}\)/,
    'app feature loader registry should keep MIDI SMF support inside the import-data dependency loader',
  );
  assert.doesNotMatch(
    appSupportLoadersModule,
    /loadImportDataDependencies|createImportDataDependencyLoader/,
    'app support loader registry should not expose import-data feature wiring to app.js',
  );
  assert.doesNotMatch(
    appScript,
    /\bloadMidiSmf\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack import-data-only MIDI SMF support from the root dependency registry',
  );
  assert.doesNotMatch(
    appScript,
    /registerImportDataFeature\(\{[\s\S]*\bloadMidiSmf\b[\s\S]*\}\)/,
    'app.js should not manually pass MIDI SMF support into import-data registration',
  );
});

test('app bootstrap proxies import-data handlers through the shared lazy feature proxy', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'importDataFeatureProxy',
    wireName: 'wireImportDataFeature',
    loaderName: 'loadImportDataFeature',
    appConsumerName: 'wireImportDataFeature',
    methods: [
      'calculateRowStatusText',
      'confirmCsvImport',
      'triggerMidiImportForProject',
      'handleMidiFile',
      'toggleProjectCollapse',
      'selectImportGroup',
    ],
    forbiddenPattern: /importDataFeaturePromise|getImportDataFeature|withImportDataFeature/,
    label: 'import-data feature',
  });
  assert.match(
    appScript,
    /const\s+getSmartName\s*=\s*\(row\)\s*=>\s*importDataFeature\?\.getSmartName\(row\)\s*\?\?\s*'';/,
    'app.js should keep the synchronous import-data smart-name fallback for unloaded MIDI imports',
  );
});
