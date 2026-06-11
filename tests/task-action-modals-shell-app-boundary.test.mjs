import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';
import { createTaskActionModalsShellState } from '../app/scripts/state/task-action-modals-shell-state.js';

test('app bootstrap creates task action modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createTaskActionModalsShellState \} from '\.\.\/state\/task-action-modals-shell-state\.js';/,
    'app state factories should import the task action modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootTaskActionModalsShellState\(options\)\s*\{[\s\S]*return createTaskActionModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the task action modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootTaskActionModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the task action modal group shell ctx factory from createAppDependencies()',
  );
  assert.match(
    appRootContextWiringModule,
    /const appTaskActionModalsShell\s*=\s*createRootTaskActionModalsShellState\(\{[\s\S]*appEditModal[\s\S]*appSplitModal[\s\S]*\}\);/,
    'app.js should create the task action modal group ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appTaskActionModalsShell\s*=\s*reactive\(\{[\s\S]*appEditModal[\s\S]*appSplitModal[\s\S]*\}\);/,
    'app.js should not own the task action modal group reactive ctx object after shell ctx extraction',
  );
});

test('task action modal group ctx preserves child modal contexts', () => {
  const appEditModal = { name: 'edit' };
  const appSplitModal = { name: 'split' };
  const ctx = createTaskActionModalsShellState({
    reactive: (value) => value,
    appEditModal,
    appSplitModal,
  });

  assert.equal(ctx.appEditModal, appEditModal);
  assert.equal(ctx.appSplitModal, appSplitModal);
});

test('task action modal group ctx fails clearly without Vue reactive', () => {
  assert.throws(
    () => createTaskActionModalsShellState({}),
    /createTaskActionModalsShellState requires Vue reactive factory/,
  );
});
