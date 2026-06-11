import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertNoAppImport,
  assertNoAppRegistration,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates desktop resize feature imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/desktop-resize.js',
    label: 'desktop resize feature',
  });
  assertNoAppImport({
    modulePath: './features/desktop-resize-shell.js',
    label: 'the pass-through desktop resize shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerDesktopResizeShellFeature\(/,
    label: 'the pass-through desktop resize shell feature',
  });
});

test('app bootstrap proxies desktop resize handlers through the shared lazy feature proxy', () => {
  assert.match(
    appScript,
    /const\s+desktopResizeFeatureProxy\s*=\s*createLazyFeatureProxy\(\{[\s\S]*loadFeature:\s*\(\)\s*=>\s*loadDesktopResizeFeature\(\)[\s\S]*const\s+initResize\s*=\s*desktopResizeFeatureProxy\.method\('initResize'\);[\s\S]*const\s+handleResizeMove\s*=\s*desktopResizeFeatureProxy\.method\('handleResizeMove'\);[\s\S]*const\s+handleResizeEnd\s*=\s*desktopResizeFeatureProxy\.method\('handleResizeEnd'\);/,
    'app.js should use the shared lazy feature proxy for desktop resize handlers',
  );
  assert.doesNotMatch(
    appScript,
    /desktopResizeFeaturePromise|getDesktopResizeFeature/,
    'app.js should not keep hand-rolled desktop resize lazy proxy variables',
  );
});
