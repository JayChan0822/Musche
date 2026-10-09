import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRootShellCtx,
  appRootContextWiringModule,
  assertNoAppImport,
  assertNoAppRegistration,
  appStateFactoriesModule,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates MIDI manager imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/midi-manager.js',
    label: 'MIDI manager feature',
  });
  assertNoAppImport({
    modulePath: './features/midi-manager-shell.js',
    label: 'the pass-through MIDI manager shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerMidiManagerShellFeature\(/,
    label: 'the pass-through MIDI manager shell feature',
  });
  assert.doesNotMatch(
    appScript,
    /midiManagerShellFeature|withMidiManagerShell|getMidiManagerShellFeature/,
    'app.js should not keep MIDI manager shell feature variables after removing the shell',
  );
  assert.match(
    appStateFactoriesModule,
    /import \{ createMidiManagerModalShellState \} from '\.\.\/state\/midi-manager-modal-shell-state\.js';/,
    'app state factories should import the MIDI manager modal shell ctx factory',
  );
  assert.match(
    appStateFactoriesModule,
    /function createRootMidiManagerModalShellState\(options\)\s*\{[\s\S]*return createMidiManagerModalShellState\(\{[\s\S]*reactive,[\s\S]*\.\.\.options,[\s\S]*\}\);[\s\S]*\}/,
    'app state factories should bind Vue reactive for the MIDI manager modal shell ctx factory',
  );
  assert.match(
    appScript,
    /const\s+\{[\s\S]*\bcreateRootMidiManagerModalShellState\b[\s\S]*\}\s*=\s*createAppDependencies\(\);/,
    'app.js should get the MIDI manager modal shell ctx factory from createAppDependencies()',
  );
  assertRootShellCtx({
    ctxName: 'appMidiManagerModal',
    factoryName: 'createRootMidiManagerModalShellState',
    dependencies: [
      'showMidiManager',
      'projectMidiGroups',
      'activeMidiGroupRow',
      'triggerMidiImportForProject',
      'updateInstrumentGroup',
    ],
  });
  assert.doesNotMatch(
    appScript,
    /const appMidiManagerModal\s*=\s*reactive\(\{[\s\S]*get showMidiManager\(\)[\s\S]*updateInstrumentGroup[\s\S]*\}\);/,
    'app.js should not own the MIDI manager modal reactive ctx object after shell ctx extraction',
  );
});
