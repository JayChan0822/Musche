import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates CSV Import modal ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createCsvImportModalShellState \} from '\.\.\/state\/csv-import-modal-shell-state\.js';/,
    'app state factories should import the CSV Import modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootCsvImportModalShellState\(options\)\s*\{[\s\S]*return createCsvImportModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the CSV Import modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootCsvImportModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the CSV Import modal shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appCsvImportModal',
    factoryName: 'createRootCsvImportModalShellState',
    dependencies: [
      'showCsvImportModal',
      'activeImportTab',
      'csvSearchQuery',
      'csvImportConfig',
      'csvImportData',
      'groupedCsvData',
      'collapsedProjects',
      'refreshCsvStatus',
      'toggleAllRows',
      'toggleProjectCollapse',
      'isGroupSelected',
      'toggleGroupSelection',
      'confirmCsvImport',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appCsvImportModal\s*=\s*reactive\(\{[\s\S]*showCsvImportModal[\s\S]*activeImportTab[\s\S]*csvSearchQuery[\s\S]*csvImportConfig[\s\S]*csvImportData[\s\S]*groupedCsvData[\s\S]*collapsedProjects[\s\S]*refreshCsvStatus[\s\S]*toggleAllRows[\s\S]*toggleProjectCollapse[\s\S]*isGroupSelected[\s\S]*toggleGroupSelection[\s\S]*confirmCsvImport[\s\S]*\}\);/,
    'app.js should not own the CSV Import modal reactive ctx body after shell ctx extraction',
  );
});
