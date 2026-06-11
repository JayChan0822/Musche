import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';
import { createSettingsModalShellState } from '../app/scripts/state/settings-modal-shell-state.js';

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
  const makeBucket = () => {
    const cache = new Map();
    return new Proxy({}, {
      get(_, key) {
        if (!cache.has(key)) cache.set(key, { value: { ref: key } });
        return cache.get(key);
      },
    });
  };
  const refs = makeBucket();
  const state = makeBucket();
  const computedState = makeBucket();
  const actions = makeBucket();
  const ctx = createSettingsModalShellState({
    reactive: (value) => value,
    refs,
    state,
    computedState,
    actions,
  });

  // 可写 ref（v-model）
  for (const key of ['showSettings', 'showMetadataManager']) {
    assert.equal(ctx[key], refs[key].value, `${key} should read the ref value`);
    const sentinel = { sentinel: key };
    ctx[key] = sentinel;
    assert.equal(refs[key].value, sentinel, `${key} should write back to the ref`);
  }
  // 直传：reactive Set 不按 ref 解包
  assert.equal(ctx.settingsExpandedGroups, state.settingsExpandedGroups);
  // computed 只读
  assert.equal(ctx.allSettingsGrouped, computedState.allSettingsGrouped.value);
  assert.equal(Object.getOwnPropertyDescriptor(ctx, 'allSettingsGrouped').set, undefined);
  // action 透传
  assert.equal(ctx.clearSettingsList, actions.clearSettingsList);
  assert.equal(ctx.factoryReset, actions.factoryReset);
});

test('Settings modal shell state fails clearly without Vue reactive', () => {
  assert.throws(() => createSettingsModalShellState({}), {
    name: 'TypeError',
    message: 'createSettingsModalShellState requires Vue reactive factory',
  });
});
