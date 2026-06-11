import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  assertNoAppImport,
  assertNoAppRegistration,
  assertSharedLazyFeatureProxy,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates metadata modal imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/metadata-modals.js',
    label: 'metadata-modals feature',
  });
  assertNoAppImport({
    modulePath: './features/metadata-modals-shell.js',
    label: 'the pass-through metadata-modals shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerMetadataModalsShellFeature\(/,
    label: 'the pass-through metadata-modals shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /metadataModalsShellFeature|withMetadataModalsShellFeature|getMetadataModalsShellFeature/,
    'app.js should not keep metadata-modals shell feature variables after removing the shell',
  );
});

test('app bootstrap proxies metadata modal handlers through the shared lazy feature proxy', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'metadataModalsFeatureProxy',
    wireName: 'wireMetadataModalsFeature',
    loaderName: 'loadMetadataModalsFeature',
    appConsumerName: 'wireMetadataModalsFeature',
    methods: [
      'openRecInfoModal',
      'saveRecInfo',
      'selectRecOption',
      'createRecOption',
      'addRecItem',
      'removeRecItem',
      'handleRecRename',
      'openCreditModal',
      'copyCreditText',
      'openProjectInfoModal',
      'saveProjectInfo',
    ],
    forbiddenPattern: /metadataModalsFeaturePromise|getMetadataModalsFeature|withMetadataModalsFeature/,
    label: 'metadata modal feature',
  });
});
