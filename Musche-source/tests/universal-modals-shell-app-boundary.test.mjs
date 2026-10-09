import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';
import { createUniversalModalsShellState } from '../app/scripts/state/universal-modals-shell-state.js';

test('app bootstrap creates universal modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createUniversalModalsShellState \} from '\.\.\/state\/universal-modals-shell-state\.js';/,
    'app state factories should import the universal modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootUniversalModalsShellState\(options\)\s*\{[\s\S]*return createUniversalModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the universal modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootUniversalModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the universal modal group shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appUniversalModalsShell',
    factoryName: 'createRootUniversalModalsShellState',
    dependencies: [
      'appInputModal',
      'appConfirmModal',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appUniversalModalsShell\s*=\s*reactive\(\{[\s\S]*appInputModal[\s\S]*appConfirmModal[\s\S]*\}\);/,
    'app.js should not own the universal modal group reactive ctx object after shell ctx extraction',
  );
});

test('universal modal group ctx preserves child modal contexts', () => {
  const appInputModal = { name: 'input' };
  const appConfirmModal = { name: 'confirm' };
  const ctx = createUniversalModalsShellState({
    reactive: (value) => value,
    resolve: (path) => ({
      shells: { appInputModal, appConfirmModal },
    }[path.split('.')[0]][path.split('.').slice(1).join('.')]),
  });

  assert.equal(ctx.appInputModal, appInputModal);
  assert.equal(ctx.appConfirmModal, appConfirmModal);
});

test('universal modal group ctx fails clearly without Vue reactive', () => {
  assert.throws(
    () => createUniversalModalsShellState({}),
    /createUniversalModalsShellState requires Vue reactive factory/,
  );
});
