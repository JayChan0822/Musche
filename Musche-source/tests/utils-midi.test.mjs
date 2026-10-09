import assert from 'node:assert/strict';
import test from 'node:test';

import JZZ from 'jzz';
import installJzzSmf from 'jzz-midi-smf';

import { calculateBarQuantizedDuration, cleanMidiTrackName, filterDurationOutlierNotes, installJzzSmfPlugin, normalizeForMatch } from '../app/scripts/utils/midi.js';

test('normalizeForMatch normalizes case, punctuation, digits, and Unicode flats', () => {
  assert.equal(normalizeForMatch('Viola♭ 2'), 'violab');
  assert.equal(normalizeForMatch('C#-Flat.12'), 'c# b');
  assert.equal(normalizeForMatch('Strings_(In)'), 'strings');
});

test('cleanMidiTrackName removes trailing numbering while preserving Unicode text', () => {
  assert.equal(cleanMidiTrackName('Violin I'), 'Violin');
  assert.equal(cleanMidiTrackName('Flûte 2'), 'Flûte');
  assert.equal(cleanMidiTrackName('Cello_3'), 'Cello');
});

test('calculateBarQuantizedDuration returns zeros for empty note lists', () => {
  assert.deepEqual(
    calculateBarQuantizedDuration([], { ppq: 480, events: [{ tick: 0, mpb: 500000, seconds: 0 }] }, [
      { ticks: 0, timeSignature: [4, 4] },
    ]),
    { seconds: 0, rawSeconds: 0, bars: 0 }
  );
});

test('calculateBarQuantizedDuration counts active bars across bar boundaries', () => {
  const tempoMap = { ppq: 480, events: [{ tick: 0, mpb: 500000, seconds: 0 }] };
  const timeSigs = [{ ticks: 0, timeSignature: [4, 4] }];
  const notes = [{ ticks: 0, durationTicks: 2400, midi: 60 }];

  assert.deepEqual(calculateBarQuantizedDuration(notes, tempoMap, timeSigs), {
    seconds: 4,
    rawSeconds: 2.5,
    bars: 2,
  });
});

test('filterDurationOutlierNotes excludes isolated implausibly long note events', () => {
  const notes = [
    { ticks: 0, durationTicks: 120, midi: 60 },
    { ticks: 240, durationTicks: 240, midi: 67 },
    { ticks: 480, durationTicks: 180, midi: 72 },
    { ticks: 900, durationTicks: 40000, midi: 24 },
  ];
  assert.deepEqual(filterDurationOutlierNotes(notes, 480), notes.slice(0, 3));
});

test('filterDurationOutlierNotes preserves long notes when they are typical for the track', () => {
  const notes = [
    { ticks: 0, durationTicks: 12000, midi: 36 },
    { ticks: 12000, durationTicks: 14000, midi: 40 },
    { ticks: 26000, durationTicks: 13000, midi: 43 },
  ];
  assert.deepEqual(filterDurationOutlierNotes(notes, 480), notes);
});

test('installJzzSmfPlugin explicitly attaches the SMF parser to the imported JZZ instance', () => {
  delete JZZ.MIDI.SMF;

  assert.equal(typeof JZZ.MIDI.SMF, 'undefined');
  assert.equal(installJzzSmfPlugin(JZZ, installJzzSmf), true);
  assert.equal(typeof JZZ.MIDI.SMF, 'function');
});
