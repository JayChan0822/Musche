import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates Color Picker modal ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createColorPickerModalShellState \} from '\.\.\/state\/color-picker-modal-shell-state\.js';/,
    'app state factories should import the Color Picker modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootColorPickerModalShellState\(options\)\s*\{[\s\S]*return createColorPickerModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Color Picker modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootColorPickerModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Color Picker modal shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appRootContextWiringModule,
    /const appColorPickerModal\s*=\s*createRootColorPickerModalShellState\(\{(?=[\s\S]*showColorPickerModal)(?=[\s\S]*presetColors)(?=[\s\S]*tempColor)(?=[\s\S]*resetColorPicker)(?=[\s\S]*saveColorPicker)[\s\S]*\}\);/,
    'app.js should create the Color Picker modal ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appColorPickerModal\s*=\s*reactive\(\{[\s\S]*showColorPickerModal[\s\S]*presetColors[\s\S]*tempColor[\s\S]*resetColorPicker[\s\S]*saveColorPicker[\s\S]*\}\);/,
    'app.js should not own the Color Picker modal reactive ctx body after shell ctx extraction',
  );
});
