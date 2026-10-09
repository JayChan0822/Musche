import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  appScript,
  appStateFactoriesModule,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap creates MIDI/CSV import modal group ctx through a focused state factory', () => {
  assert.match(
    appStateFactoriesModule,
    /import \{ createMidiCsvImportModalsShellState \} from '\.\.\/state\/midi-csv-import-modals-shell-state\.js';/,
    'app state factories should import the MIDI/CSV import modal group shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMidiCsvImportModalsShellState\(options\)\s*\{[\s\S]*return createMidiCsvImportModalsShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the MIDI/CSV import modal group shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMidiCsvImportModalsShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the MIDI/CSV import modal group shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appMidiCsvImportModalsShell',
    factoryName: 'createRootMidiCsvImportModalsShellState',
    dependencies: [
      'appMidiManagerModal',
      'appMidiImportModal',
      'appCsvImportModal',
    ],
  });
  assert.match(
    appStateFactoriesModule,
    /import \{ createMidiImportModalShellState \} from '\.\.\/state\/midi-import-modal-shell-state\.js';/,
    'app state factories should import the MIDI import modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMidiImportModalShellState\(options\)\s*\{[\s\S]*return createMidiImportModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the MIDI import modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMidiImportModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the MIDI import modal shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appMidiImportModal',
    factoryName: 'createRootMidiImportModalShellState',
    dependencies: [
      'showMidiImportModal',
      'midiBpm',
      'midiViewMode',
      'midiGroupData',
      'currentMidiDisplayList',
      'confirmMidiImport',
      'selectImportGroup',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appMidiImportModal\s*=\s*reactive\(\{[\s\S]*get showMidiImportModal\(\)[\s\S]*selectImportGroup[\s\S]*\}\);/,
    'app.js should not own the MIDI import modal reactive ctx object after shell ctx extraction',
  );
  assert.doesNotMatch(
    appScript,
    /const appMidiCsvImportModalsShell\s*=\s*reactive\(\{[\s\S]*appMidiManagerModal[\s\S]*appMidiImportModal[\s\S]*appCsvImportModal[\s\S]*\}\);/,
    'app.js should not own the MIDI/CSV import modal group reactive ctx object after shell ctx extraction',
  );
});
