import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates header shell ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createHeaderShellState \} from '\.\.\/state\/header-shell-state\.js';/,
    'app state factories should import the header shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootHeaderShellState\(options\)\s*\{[\s\S]*return createHeaderShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the header shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootHeaderShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the header shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appHeader',
    factoryName: 'createRootHeaderShellState',
    dependencies: [
      'showMobileMenu',
      'themeMode',
      'globalSearchQuery',
      'tempNickname',
      'openSettings',
      'handleMidiFile',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appHeader\s*=\s*reactive\(\{[\s\S]*get showMobileMenu\(\)[\s\S]*handleMidiFile[\s\S]*\}\);/,
    'app.js should not own the header reactive ctx object after shell ctx extraction',
  );
});
