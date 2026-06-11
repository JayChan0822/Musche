import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates account modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createAccountModalsShellState \} from '\.\.\/state\/account-modals-shell-state\.js';/,
    'app state factories should import the account modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootAccountModalsShellState\(options\)\s*\{[\s\S]*return createAccountModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the account modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootAccountModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the account modal group shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appScript,
    /const appAccountModalsShell\s*=\s*createRootAccountModalsShellState\(\{[\s\S]*appAuthModal[\s\S]*appCropModal[\s\S]*\}\);/,
    'app.js should create the account modal group ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appAccountModalsShell\s*=\s*reactive\(\{[\s\S]*appAuthModal[\s\S]*appCropModal[\s\S]*\}\);/,
    'app.js should not own the account modal group reactive ctx object after shell ctx extraction',
  );
});
