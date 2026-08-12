import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates standalone overlays group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createStandaloneOverlaysShellState \} from '\.\.\/state\/standalone-overlays-shell-state\.js';/,
    'app state factories should import the standalone overlays group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootStandaloneOverlaysShellState\(options\)\s*\{[\s\S]*return createStandaloneOverlaysShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the standalone overlays group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootStandaloneOverlaysShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the standalone overlays group shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appStandaloneOverlaysShell',
    factoryName: 'createRootStandaloneOverlaysShellState',
    dependencies: [
      'appSettingsModal',
      'appTrackListModal',
      'appMobileTaskInput',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appStandaloneOverlaysShell\s*=\s*reactive\(\{[\s\S]*appSettingsModal[\s\S]*appTrackListModal[\s\S]*appMobileTaskInput[\s\S]*\}\);/,
    'app.js should not own the standalone overlays group reactive ctx object after shell ctx extraction',
  );
});
