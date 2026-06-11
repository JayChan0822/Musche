import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';
import { createExportModalShellState } from '../app/scripts/state/export-modal-shell-state.js';

test('app bootstrap creates Export modal ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createExportModalShellState \} from '\.\.\/state\/export-modal-shell-state\.js';/,
    'app state factories should import the Export modal ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootExportModalShellState\(options\)\s*\{[\s\S]*return createExportModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the Export modal ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootExportModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the Export modal ctx factory from createAppDependencies()',
  );
  assert.match(
    appRootContextWiringModule,
    /const appExportModal\s*=\s*createRootExportModalShellState\(\{[\s\S]*showExportModal[\s\S]*exportFilter[\s\S]*exportSessionOptions[\s\S]*exportPreviewCount[\s\S]*toggleFilterItem:[\s\S]*confirmExport:[\s\S]*\}\);/,
    'app.js should create the Export modal ctx through the focused shell ctx factory',
  );
  assert.doesNotMatch(
    appScript,
    /const appExportModal\s*=\s*reactive\(\{[\s\S]*showExportModal[\s\S]*exportFilter[\s\S]*confirmExport[\s\S]*\}\);/,
    'app.js should not own the Export modal reactive ctx object after shell ctx extraction',
  );
});

test('Export modal ctx exposes live refs, computed state, and actions', () => {
  const showExportModal = { value: false };
  const exportFilter = { dateFrom: '2026-06-01', types: { project: true } };
  const calls = [];
  const ctx = createExportModalShellState({
    reactive: (value) => value,
    refs: { showExportModal },
    state: { exportFilter },
    computedState: {
      exportSessionOptions: { value: ['S_DEFAULT'] },
      filteredExportProjects: { value: ['P1'] },
      filteredExportMusicians: { value: ['M1'] },
      filteredExportInstruments: { value: ['I1'] },
      exportDateRange: { value: { min: '2026-06-01', max: '2026-06-30' } },
      exportPreviewCount: { value: 4 },
    },
    actions: {
      toggleFilterItem: (...args) => calls.push(['item', ...args]),
      toggleFilterAll: (...args) => calls.push(['all', ...args]),
      confirmExport: (...args) => calls.push(['confirm', ...args]),
    },
  });

  assert.equal(ctx.showExportModal, false);
  ctx.showExportModal = true;
  assert.equal(showExportModal.value, true, 'showExportModal setter should update the source ref');
  assert.equal(ctx.exportFilter, exportFilter, 'exportFilter should stay live for nested v-model fields');
  assert.deepEqual(ctx.exportSessionOptions, ['S_DEFAULT']);
  assert.deepEqual(ctx.filteredExportProjects, ['P1']);
  assert.deepEqual(ctx.filteredExportMusicians, ['M1']);
  assert.deepEqual(ctx.filteredExportInstruments, ['I1']);
  assert.deepEqual(ctx.exportDateRange, { min: '2026-06-01', max: '2026-06-30' });
  assert.equal(ctx.exportPreviewCount, 4);
  ctx.toggleFilterItem('projects', 'P1');
  ctx.toggleFilterAll('musicians');
  ctx.confirmExport();
  assert.deepEqual(calls, [
    ['item', 'projects', 'P1'],
    ['all', 'musicians'],
    ['confirm'],
  ]);
});

test('Export modal ctx fails clearly without Vue reactive', () => {
  assert.throws(
    () => createExportModalShellState({}),
    /createExportModalShellState requires Vue reactive factory/,
  );
});
