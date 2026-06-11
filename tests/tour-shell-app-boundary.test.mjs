import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  assertNoAppImport,
  assertNoAppRegistration,
  assertSharedLazyFeatureProxy,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates tour imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/tour.js',
    label: 'tour feature',
  });
  assertNoAppImport({
    modulePath: './features/tour-shell.js',
    label: 'the pass-through tour shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerTourShellFeature\(/,
    label: 'the pass-through tour shell feature',
  });
});

test('app bootstrap proxies tour handlers through the shared lazy feature proxy', () => {
  assertSharedLazyFeatureProxy({
    proxyName: 'tourFeatureProxy',
    wireName: 'wireTourFeature',
    loaderName: 'loadTourFeature',
    appConsumerName: 'wireTourFeature',
    methods: ['startTour', 'mountTourAutostart'],
    forbiddenPattern: /tourFeaturePromise|getTourFeature/,
    label: 'tour feature',
  });
  assert.match(
    appScript,
    /if\s*\(!storageService\.getItem\(['"]musche_tour_seen['"]\)\)\s*\{\s*mountTourAutostart\(\);/s,
    'app.js must preserve seen-tour short-circuiting before loading the tour feature',
  );
});
