import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates mobile task input ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createMobileTaskInputShellState \} from '\.\.\/state\/mobile-task-input-shell-state\.js';/,
    'app state factories should import the mobile task input shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMobileTaskInputShellState\(options\)\s*\{[\s\S]*return createMobileTaskInputShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the mobile task input shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMobileTaskInputShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the mobile task input shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appScript,
    /const appMobileTaskInput\s*=\s*createRootMobileTaskInputShellState\(\{(?=[\s\S]*showMobileTaskInput)(?=[\s\S]*newItem)(?=[\s\S]*activeDropdown)(?=[\s\S]*dropdownSearch)(?=[\s\S]*filteredOptions)(?=[\s\S]*openQuickAdd)(?=[\s\S]*openDurationPicker)(?=[\s\S]*addItemToPool)[\s\S]*\}\);/,
    'app.js should create the mobile task input ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appMobileTaskInput\s*=\s*reactive\(\{[\s\S]*get showMobileTaskInput\(\)[\s\S]*addItemToPool[\s\S]*\}\);/,
    'app.js should not own the mobile task input reactive ctx object after shell ctx extraction',
  );
});
