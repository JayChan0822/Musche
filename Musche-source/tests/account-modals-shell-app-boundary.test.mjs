import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
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
  assertRootShellCtx({
    ctxName: 'appAccountModalsShell',
    factoryName: 'createRootAccountModalsShellState',
    dependencies: [
      'appAuthModal',
      'appCropModal',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appAccountModalsShell\s*=\s*reactive\(\{[\s\S]*appAuthModal[\s\S]*appCropModal[\s\S]*\}\);/,
    'app.js should not own the account modal group reactive ctx object after shell ctx extraction',
  );
});
