import assert from 'node:assert/strict';
import test from 'node:test';
import { buildResourceInsights } from '../app/scripts/utils/resource-insights.js';

const settings = {
  musicians: [{ id: 'M1', name: 'Alice' }, { id: 'M2', name: 'Bob' }],
  instruments: [{ id: 'I1', name: 'Erhu' }, { id: 'I2', name: 'Piano' }],
  projects: [{ id: 'P1', name: 'Film' }, { id: 'P2', name: 'Album' }],
  sessions: [{ id: 'S_DEFAULT', name: 'Session A' }, { id: 'S2', name: 'Session B' }],
};
const item = (id, overrides = {}) => ({ id, name: id, musicianId: 'M1', instrumentId: 'I1', projectId: 'P1',
  musicDuration: '03:00', records: { musician: { actualDuration: '01:00:00' }, project: { actualDuration: '10:00:00' } }, ...overrides });
const analyze = (itemPool, options = {}) => buildResourceInsights({ settings, itemPool, scheduledTasks: [], type: 'musician', id: 'M1', ...options });

test('recording ratios separate musician, instrument and project without using edit records', () => {
  const pool = [item('A'), item('B', { instrumentId: 'I2', musicDuration: '01:00', records: { musician: { actualDuration: '00:40:00' } } }),
    item('C', { musicianId: 'M2', projectId: 'P2' })];
  const result = analyze(pool);
  assert.equal(result.summary.averageRatio, 25);
  assert.equal(result.summary.medianRatio, 30);
  assert.equal(result.summary.actualSeconds, 6000);
  assert.equal(result.summary.sampleCount, 2);
  const instruments = result.breakdowns.find((group) => group.type === 'instrument').items;
  assert.equal(instruments.find((row) => row.id === 'I1').averageRatio, 20);
  assert.equal(instruments.find((row) => row.id === 'I2').averageRatio, 40);
  assert.equal(analyze(pool, { type: 'instrument', id: 'I1' }).summary.actualSeconds, 7200);
  assert.equal(analyze(pool, { type: 'project', id: 'P1' }).summary.averageRatio, 25);
});

test('all history and current session produce independently weighted results', () => {
  const pool = [item('A'), item('B', { sessionId: 'S2', musicDuration: '01:00' })];
  assert.equal(analyze(pool).summary.averageRatio, 30);
  assert.equal(analyze(pool, { sessionId: 'S_DEFAULT' }).summary.averageRatio, 20);
  assert.equal(analyze(pool, { sessionId: 'S2' }).summary.averageRatio, 60);
});

test('split families count once but sum musician-view segment durations, ignoring edit-only segments and schedule copies', () => {
  const pool = [item('ROOT', { musicDuration: '20:00', splitViews: {
    musician: { active: true, musicDuration: '01:00' }, project: { active: true, musicDuration: '20:00' },
  } }), item('CHILD', { splitViews: { musician: { active: true, splitFromId: 'ROOT', musicDuration: '02:00' } } }),
  item('EDIT', { splitViews: { musician: { active: false }, project: { active: true, musicDuration: '99:00' } } })];
  const before = JSON.stringify(pool);
  const result = analyze(pool, { scheduledTasks: [{ templateId: 'ROOT', date: '2026-09-28', ...item('COPY') }] });
  assert.equal(result.rows.length, 2);
  assert.equal(result.summary.trackCount, 1);
  assert.equal(result.summary.segmentCount, 2);
  assert.equal(result.summary.musicSeconds, 180);
  assert.equal(result.summary.actualSeconds, 7200);
  assert.equal(result.summary.averageRatio, 40);
  assert.equal(result.summary.medianRatio, 40);
  assert.equal(JSON.stringify(pool), before, 'statistics must not normalize or mutate source data');
});

test('skipped, pending, zero-length and legacy records have explicit status and valid sample denominators', () => {
  const pool = [item('SKIP', { isSkipped: true }), item('PENDING', { records: { project: { actualDuration: '02:00:00' } } }),
    item('MISSING_MUSIC', { musicDuration: '' }), item('LEGACY', { records: undefined, actualDuration: '00:30:00' })];
  const result = analyze(pool);
  assert.equal(result.summary.skippedCount, 1);
  assert.equal(result.summary.pendingCount, 1);
  assert.equal(result.summary.completedCount, 2);
  assert.equal(result.summary.sampleCount, 1);
  assert.equal(result.summary.averageRatio, 10);
  assert.equal(result.summary.actualSeconds, 5400);
  assert.equal(result.summary.unratedCount, 1);
  assert.equal(analyze([pool[1]]).summary.averageRatio, null);
});

test('dates follow exact schedules or musician section and exclude unrelated edit dates; trends use only dated samples', () => {
  const pool = [item('A'), item('B', { sectionIndex: 1 }), item('C', { musicianId: 'M1', sectionIndex: 5 })];
  const schedules = [
    { scheduleId: 'S1', musicianId: 'M1', date: '2026-08-10', startTime: '10:00' },
    { scheduleId: 'S2', musicianId: 'M1', date: '2026-09-15', startTime: '10:00' },
    { scheduleId: 'EDIT', projectId: 'P1', date: '2026-10-01', startTime: '10:00' },
  ];
  const result = analyze(pool, { scheduledTasks: schedules });
  assert.equal(result.rows.find((row) => row.id === 'A').date, '2026-08-10');
  assert.equal(result.rows.find((row) => row.id === 'B').date, '2026-09-15');
  assert.equal(result.rows.find((row) => row.id === 'C').date, null);
  assert.equal(result.summary.latestDate, '2026-09-15');
  assert.equal(result.summary.undatedRecordedCount, 1);
  assert.deepEqual(result.trend.map((row) => row.month), ['2026-08', '2026-09']);
});

test('net recording time is not deducted twice; timestamps support overnight recordings', () => {
  const result = analyze([
    item('A', { records: { musician: { actualDuration: '00:50:00', breakMinutes: 10 } } }),
    item('B', { records: { musician: { recStart: '23:30', recEnd: '00:30', breakMinutes: 10 } } }),
  ]);
  assert.equal(result.summary.actualSeconds, 6000);
  assert.equal(result.summary.breakSeconds, 1200);
});

test('empty history has no fabricated ratios, dates, collaborators or trend', () => {
  const result = analyze([]);
  assert.equal(result.summary.trackCount, 0);
  assert.equal(result.summary.averageRatio, null);
  assert.equal(result.summary.medianRatio, null);
  assert.equal(result.summary.latestDate, null);
  assert.deepEqual(result.trend, []);
  assert.ok(result.breakdowns.every((group) => group.items.length === 0));
});
