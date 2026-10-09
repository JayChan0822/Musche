import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  assertNoAppImport,
  assertNoAppRegistration,
  assertSharedLazyFeatureProxy,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates mobile touch imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/mobile-touch.js',
    label: 'mobile-touch feature',
  });

  assertNoAppImport({
    modulePath: './features/mobile-touch-shell.js',
    label: 'the pass-through mobile-touch shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerMobileTouchShellFeature\(/,
    label: 'the pass-through mobile-touch shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /mobileTouchShellFeature|withMobileTouchShellFeature/,
    'app.js should not keep mobile-touch shell loader variables after removing the shell',
  );
});

test('app bootstrap proxies mobile touch handlers through the shared lazy feature proxy', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'mobileTouchFeatureProxy',
    wireName: 'wireMobileTouchFeature',
    loaderName: 'loadMobileTouchRegistration',
    appConsumerName: 'wireMobileTouchFeature',
    methods: [
      'handleTouchStart',
      'handlePoolTouchStart',
      'handleTouchMove',
      'handleTouchEnd',
      'initMobileResize',
    ],
    forbiddenPattern: /mobileTouchFeaturePromise|loadMobileTouchFeature|withMobileTouchFeature/,
    label: 'mobile touch feature',
  });
});
