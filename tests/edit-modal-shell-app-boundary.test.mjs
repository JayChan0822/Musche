import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates Edit modal ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createEditModalShellState \} from '\.\.\/state\/edit-modal-shell-state\.js';/,
    'app state factories should import the Edit modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootEditModalShellState\(options\)\s*\{[\s\S]*return createEditModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Edit modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootEditModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Edit modal shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appEditModal',
    factoryName: 'createRootEditModalShellState',
    dependencies: [
      'showEditor',
      'editingItem',
      'editingSource',
      'activeDropdown',
      'dropdownSearch',
      'dropdownExpandedGroups',
      'filteredOptions',
      'isMobile',
      'showOrchestrationField',
      'parsedRoster',
      'activeOrchPresets',
      'isPercussionMode',
      'percState',
      'timeSlots',
      'deleteEditingItem',
      'saveEdit',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appEditModal\s*=\s*reactive\(\{[\s\S]*showEditor[\s\S]*editingItem[\s\S]*editingSource[\s\S]*activeDropdown[\s\S]*showOrchestrationField[\s\S]*isPercussionMode[\s\S]*deleteEditingItem[\s\S]*saveEdit[\s\S]*\}\);/,
    'app.js should not own the Edit modal reactive ctx body after shell ctx extraction',
  );
});
