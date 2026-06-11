import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appDependenciesModule,
  appFeatureLoadersModule,
  appScript,
  assertNoAppImport,
  assertNoAppRegistration,
  assertSharedLazyFeatureProxy,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates data I/O imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/data-io.js',
    label: 'data I/O feature',
  });
  assertNoAppImport({
    modulePath: './features/data-io-shell.js',
    label: 'the pass-through data I/O shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerDataIoShellFeature\(/,
    label: 'the pass-through data I/O shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /dataIoShellFeature|withDataIoShellFeature|getDataIoShellFeature/,
    'app.js should not keep data I/O shell feature variables after removing the shell',
  );
});

test('app bootstrap keeps XLSX support inside the data I/O feature loader boundary', () => {
  assert.match(
    appDependenciesModule,
    /createAppFeatureLoaders\(\{[\s\S]*xlsxSupport:\s*supportLoaders\.loadXlsx[\s\S]*\}\)/,
    'app dependencies should inject XLSX support into the data I/O feature loader registry',
  );
  assert.match(
    appFeatureLoadersModule,
    /createDataIoFeatureLoader\(\{\s*loadXlsx:\s*xlsxSupport\s*\}\)/,
    'app feature loader registry should pass XLSX support to the data I/O feature loader',
  );
  assert.doesNotMatch(
    appScript,
    /\bloadXlsx\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack data-I/O-only XLSX support from the root dependency registry',
  );
  assert.doesNotMatch(
    appScript,
    /registerDataIoFeature\(\{[\s\S]*\bloadXlsx\b[\s\S]*\}\)/,
    'app.js should not manually pass XLSX support into data I/O registration',
  );
});

test('app bootstrap proxies data I/O handlers through the shared lazy feature proxy', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'dataIoFeatureProxy',
    loaderName: 'loadDataIoFeature',
    methods: [
      'exportToICS',
      'exportJSON',
      'importJSON',
      'triggerFileSelect',
      'handleJSONFile',
      'exportCSV',
      'openExportModal',
      'toggleFilterItem',
      'toggleFilterAll',
      'confirmExport',
    ],
    forbiddenPattern: /dataIoFeaturePromise|getDataIoFeature|withDataIoFeature/,
    label: 'data I/O feature',
  });
});
