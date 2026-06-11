import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
  settingsModalShellStateModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates Settings modal ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createSettingsModalShellState \} from '\.\.\/state\/settings-modal-shell-state\.js';/,
    'app state factories should import the Settings modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootSettingsModalShellState\(options\)\s*\{[\s\S]*return createSettingsModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Settings modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootSettingsModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Settings modal shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appScript,
    /const appSettingsModal\s*=\s*createRootSettingsModalShellState\(\{(?=[\s\S]*showSettings)(?=[\s\S]*settingsExpandedGroups)(?=[\s\S]*allSettingsGrouped)(?=[\s\S]*showMetadataManager)(?=[\s\S]*clearSettingsList:)(?=[\s\S]*factoryReset)[\s\S]*\}\);/,
    'app.js should create the Settings modal ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appSettingsModal\s*=\s*reactive\(\{[\s\S]*get showSettings\(\)[\s\S]*factoryReset[\s\S]*\}\);/,
    'app.js should not own the Settings modal reactive ctx object after shell ctx extraction',
  );
});

test('Settings modal shell state owns refs, computed values, and action pass-throughs', () => {
  assert.match(
    settingsModalShellStateModule,
    /export function createSettingsModalShellState\(\{[\s\S]*reactive,[\s\S]*refs,[\s\S]*state,[\s\S]*computedState,[\s\S]*actions,[\s\S]*\}\s*=\s*\{\}\)\s*\{[\s\S]*return reactive\(\{[\s\S]*get showSettings\(\)[\s\S]*set showSettings\(value\)[\s\S]*get settingsExpandedGroups\(\)[\s\S]*get allSettingsGrouped\(\)[\s\S]*get showMetadataManager\(\)[\s\S]*set showMetadataManager\(value\)[\s\S]*clearSettingsList:[\s\S]*factoryReset:[\s\S]*\}\);[\s\S]*\}/,
    'settings-modal-shell-state should own the Settings modal ctx getters, setters, and action wiring',
  );
});
