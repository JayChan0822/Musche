import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateBarQuantizedDuration, cleanMidiTrackName, normalizeForMatch } from '../app/scripts/utils/midi.js';

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
