import test from 'node:test';
import {
  assertNoAppImport,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap leaves CSV and MIDI import utilities inside the import-data dependency loader', () => {
  assertNoAppImport({
    modulePath: './utils/csv.js',
    label: 'CSV utilities used only by import-data',
  });
  assertNoAppImport({
    modulePath: './utils/midi.js',
    label: 'MIDI utilities used only by import-data',
  });
});
