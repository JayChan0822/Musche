import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const files = [
  'app/scripts/features/auth.js',
  'app/scripts/features/mobile-ui.js',
  'app/scripts/features/import-midi.js',
  'app/scripts/features/import-csv.js',
  'app/scripts/features/export-csv.js',
];

test('feature modules import Vue helpers from the vue package instead of the global Vue object', () => {
  files.forEach((file) => {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\bVue\b/, `${file} should not reference the global Vue object`);
    assert.match(source, /from 'vue';/, `${file} should import helpers from the vue package`);
  });
});
