import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';
import { createPickerModalsShellState } from '../app/scripts/state/picker-modals-shell-state.js';

test('app bootstrap creates picker modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createPickerModalsShellState \} from '\.\.\/state\/picker-modals-shell-state\.js';/,
    'app state factories should import the picker modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootPickerModalsShellState\(options\)\s*\{[\s\S]*return createPickerModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the picker modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootPickerModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the picker modal group shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appScript,
    /const appPickerModalsShell\s*=\s*createRootPickerModalsShellState\(\{[\s\S]*appColorPickerModal[\s\S]*appDurationPicker[\s\S]*\}\);/,
    'app.js should create the picker modal group ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appPickerModalsShell\s*=\s*reactive\(\{[\s\S]*appColorPickerModal[\s\S]*appDurationPicker[\s\S]*\}\);/,
    'app.js should not own the picker modal group reactive ctx object after shell ctx extraction',
  );
});

test('picker modal group ctx preserves child modal contexts', () => {
  const appColorPickerModal = { name: 'color' };
  const appDurationPicker = { name: 'duration' };
  const ctx = createPickerModalsShellState({
    reactive: (value) => value,
    appColorPickerModal,
    appDurationPicker,
  });

  assert.equal(ctx.appColorPickerModal, appColorPickerModal);
  assert.equal(ctx.appDurationPicker, appDurationPicker);
});

test('picker modal group ctx fails clearly without Vue reactive', () => {
  assert.throws(
    () => createPickerModalsShellState({}),
    /createPickerModalsShellState requires Vue reactive factory/,
  );
});
