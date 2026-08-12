import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates Export/Credit modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createExportCreditModalsShellState \} from '\.\.\/state\/export-credit-modals-shell-state\.js';/,
    'app state factories should import the Export/Credit modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootExportCreditModalsShellState\(options\)\s*\{[\s\S]*return createExportCreditModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Export/Credit modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootExportCreditModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Export/Credit modal group shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appExportCreditModalsShell',
    factoryName: 'createRootExportCreditModalsShellState',
    dependencies: [
      'appExportModal',
      'appCreditModal',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appExportCreditModalsShell\s*=\s*reactive\(\{[\s\S]*appExportModal[\s\S]*appCreditModal[\s\S]*\}\);/,
    'app.js should not own the Export/Credit modal group reactive ctx object after shell ctx extraction',
  );
});
