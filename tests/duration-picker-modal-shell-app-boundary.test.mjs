import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates Duration Picker modal ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createDurationPickerModalShellState \} from '\.\.\/state\/duration-picker-modal-shell-state\.js';/,
    'app state factories should import the Duration Picker modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootDurationPickerModalShellState\(options\)\s*\{[\s\S]*return createDurationPickerModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Duration Picker modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootDurationPickerModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Duration Picker modal shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appDurationPicker',
    factoryName: 'createRootDurationPickerModalShellState',
    dependencies: [
      'showDurationPicker',
      'pickerPos',
      'pickerMinRef',
      'pickerSecRef',
      'tempDuration',
      'closePicker',
      'onScroll',
      'onDragStart',
      'resetDuration',
      'confirmDurationPicker',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appDurationPicker\s*=\s*reactive\(\{[\s\S]*showDurationPicker[\s\S]*pickerPos[\s\S]*pickerMinRef[\s\S]*pickerSecRef[\s\S]*tempDuration[\s\S]*closePicker[\s\S]*onScroll[\s\S]*onDragStart[\s\S]*resetDuration[\s\S]*confirmDurationPicker[\s\S]*\}\);/,
    'app.js should not own the Duration Picker modal reactive ctx body after shell ctx extraction',
  );
});
