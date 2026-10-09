import assert from 'node:assert/strict';
import test from 'node:test';

import { addDaysToDate, addMinutesToTime, parseTime, timeToMinutes } from '../app/scripts/utils/time.js';

test('parseTime handles standard hh:mm and hh:mm:ss inputs', () => {
  assert.equal(parseTime('00:00'), 0);
  assert.equal(parseTime('09:30'), 570);
  assert.equal(parseTime('01:02:03'), 3723);
});

test('parseTime tolerates shorthand numeric input and rejects invalid text', () => {
  assert.equal(parseTime('7'), 7);
  assert.equal(parseTime(' 12:05 '), 725);
  assert.equal(parseTime('not-a-time'), 0);
});

test('timeToMinutes handles midnight and invalid values', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('23:59'), 1439);
  assert.ok(Number.isNaN(timeToMinutes('abc')));
});

test('addMinutesToTime supports normal, clamped, and stepped values', () => {
  assert.equal(addMinutesToTime('09:15', 45), '10:00');
  assert.equal(addMinutesToTime('23:50', 20, { maxMinutes: 1439 }), '23:59');
  assert.equal(addMinutesToTime('10:07', 0, { stepMinutes: 15 }), '10:00');
});

test('addDaysToDate handles same-day, cross-day, and invalid input', () => {
  assert.equal(addDaysToDate(new Date(Date.UTC(2024, 1, 28, 12)), 0), '2024-02-28');
  assert.equal(addDaysToDate(new Date(Date.UTC(2024, 1, 28, 12)), 1), '2024-02-29');
  assert.equal(addDaysToDate('not-a-date', 1), 'NaN-NaN-NaN');
});
