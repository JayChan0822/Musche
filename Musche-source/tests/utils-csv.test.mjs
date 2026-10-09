import assert from 'node:assert/strict';
import test from 'node:test';

import { extractTime, getOrchString, normalizeDate, parseCSVLine, parseCSVRobust } from '../app/scripts/utils/csv.js';

test('extractTime reads ascii and full-width separators', () => {
  assert.equal(extractTime('Call: 09:30'), '09:30');
  assert.equal(extractTime('Start 7：05'), '07:05');
  assert.equal(extractTime('no time here'), '');
});

test('normalizeDate normalizes dot and hyphen formats while preserving invalid text', () => {
  assert.equal(normalizeDate('2026.05.11'), '2026-05-11');
  assert.equal(normalizeDate('2026-5-1'), '2026-05-01');
  assert.equal(normalizeDate('  not a date  '), 'not a date');
});

test('getOrchString counts instruments and uses abbreviations where defined', () => {
  assert.equal(getOrchString(['violin 1', 'violin 2', 'flute 1', 'tuba 1']), '2 Vln, 1 Fl, 1 Tuba');
  assert.equal(getOrchString(['double bass 1', 'cello 2']), '1 Db, 1 Vc');
  assert.equal(getOrchString([]), '');
});

test('parseCSVLine splits a single CSV line respecting quoted commas', () => {
  assert.deepEqual(parseCSVLine('a,"b,c",d'), ['a', 'b,c', 'd']);
  assert.deepEqual(parseCSVLine('PID,Player,Duration'), ['PID', 'Player', 'Duration']);
  assert.deepEqual(parseCSVLine(''), ['']);
});

test('parseCSVRobust parses multi-line CSV with quoted cells and CRLF', () => {
  assert.deepEqual(parseCSVRobust('a,b\n"c,d",e'), [['a', 'b'], ['c,d', 'e']]);
  assert.deepEqual(parseCSVRobust('x,y\r\nz,w'), [['x', 'y'], ['z', 'w']]);
  assert.deepEqual(parseCSVRobust('"esc""aped",v'), [['esc"aped', 'v']]);
  assert.deepEqual(parseCSVRobust(''), []);
});
