import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates utility modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createUtilityModalsShellState \} from '\.\.\/state\/utility-modals-shell-state\.js';/,
    'app state factories should import the utility modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootUtilityModalsShellState\(options\)\s*\{[\s\S]*return createUtilityModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the utility modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootUtilityModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the utility modal group shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appScript,
    /const appUtilityModalsShell\s*=\s*createRootUtilityModalsShellState\(\{[\s\S]*appQuickAddModal[\s\S]*appImportModal[\s\S]*\}\);/,
    'app.js should create the utility modal group ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appUtilityModalsShell\s*=\s*reactive\(\{[\s\S]*appQuickAddModal[\s\S]*appImportModal[\s\S]*\}\);/,
    'app.js should not own the utility modal group reactive ctx object after shell ctx extraction',
  );
});
