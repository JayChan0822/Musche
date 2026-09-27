import assert from 'node:assert/strict';
import test from 'node:test';

import { registerRatioFeature } from '../app/scripts/features/ratio.js';
import { parseTime } from '../app/scripts/utils/time.js';
import { formatSecs } from '../app/scripts/utils/format.js';

const ref = (value) => ({ value });

function createFeature(overrides = {}) {
  const {
    itemPool = [],
    scheduledTasks = [],
    settings = { musicians: [], projects: [], instruments: [] },
    actions = {},
    currentSessionId = 'S_DEFAULT',
  } = overrides;

  return registerRatioFeature({
    refs: {
      trackListData: ref({ viewType: 'musician', items: [] }),
      showTrackList: ref(false),
      sidebarTab: ref('musician'),
      itemPool: ref(itemPool),
      scheduledTasks: ref(scheduledTasks),
      currentSessionId: ref(currentSessionId),
      musicianStats: ref([]),
    },
    state: { settings },
    utils: { parseTime, formatSecs },
    actions,
  });
}

test('ensureItemRecords migrates legacy ratio/recording fields into per-view records and ratios', () => {
  const feature = createFeature();
  const item = {
    id: 'T1',
    musicianId: 'M1',
    ratio: 40,
    actualDuration: '01:00',
    recStart: '09:00',
    recEnd: '10:00',
    breakMinutes: 5,
  };

  feature.ensureItemRecords(item);

  assert.deepEqual(item.records.musician, {
    recStart: '09:00',
    recEnd: '10:00',
    actualDuration: '01:00',
    breakMinutes: 5,
  }, 'legacy recording fields should migrate into the musician record');
  assert.deepEqual(item.records.project, {});
  assert.deepEqual(item.records.instrument, {});
  assert.equal(item.ratios.musician, 40, 'legacy ratio should seed the musician ratio');
  assert.equal(item.ratios.project, null);
  assert.equal(item.ratios.instrument, null);
});

test('getDefaultRatio ignores historical stored defaults without actual stage records', () => {
  const feature = createFeature({
    settings: {
      musicians: [{ id: 'M1', defaultRatio: 35 }],
      projects: [{ id: 'P1', defaultRatio: 50 }],
      instruments: [],
    },
  });

  assert.equal(feature.getDefaultRatio('M1', 'musician'), 20);
  assert.equal(feature.getDefaultRatio('P1', 'project'), 20);
  assert.equal(feature.getDefaultRatio('MISSING', 'musician'), 20, 'missing entry falls back to 20');
  assert.equal(feature.getDefaultRatio('X', 'instrument'), 20, 'empty list falls back to 20');
});

test('calculateEstTime multiplies duration seconds by the ratio', () => {
  const feature = createFeature();
  // 01:00 = 60s, ratio 2 → 120s → 00:02:00
  assert.equal(feature.calculateEstTime('01:00', 2), '00:02:00');
  // ratio 缺省按 1 处理
  assert.equal(feature.calculateEstTime('00:30', undefined), '00:00:30');
});

test('getTaskRatio prefers the active-view ratio over the default setting', () => {
  const feature = createFeature({
    settings: { musicians: [{ id: 'M1', defaultRatio: 30 }], projects: [], instruments: [] },
  });
  const item = { id: 'T1', musicianId: 'M1', ratios: { musician: 45, project: null, instrument: null } };

  assert.equal(feature.getTaskRatio(item), 45, 'local ratio wins over default');
  item.ratios.musician = null;
  assert.equal(feature.getTaskRatio(item), 20, 'no observed records uses an initial estimate');
});

test('calculateSingleRatio returns the actual/music ratio or dash', () => {
  const feature = createFeature();
  const item = {
    id: 'T1',
    musicDuration: '02:00',
    records: { musician: { actualDuration: '01:00' } },
  };

  assert.equal(feature.calculateSingleRatio(item), '0.5');
  item.records.musician.actualDuration = '';
  assert.equal(feature.calculateSingleRatio(item), '-', 'missing actual duration yields dash');
  item.records.musician.actualDuration = '01:00';
  item.musicDuration = '';
  assert.equal(feature.calculateSingleRatio(item), '-', 'missing music duration yields dash');
});

test('isDefaultRatio compares against the musician default or the x20 baseline', () => {
  const feature = createFeature({
    settings: { musicians: [{ id: 'M1', defaultRatio: 35 }], projects: [], instruments: [] },
  });

  assert.equal(feature.isDefaultRatio({ ratio: 35, musicianId: 'M1' }), true);
  assert.equal(feature.isDefaultRatio({ ratio: 40, musicianId: 'M1' }), false);
  assert.equal(feature.isDefaultRatio({ ratio: 20, musicianId: 'M2' }), true, 'musician without explicit default compares to 20');
  assert.equal(feature.isDefaultRatio({}), true, 'missing ratio counts as default');
});

test('autoUpdateEfficiency returns a derived ratio without mutating estimates or bookings', () => {
  const settings = { musicians: [{ id: 'M1', defaultRatio: 20 }], projects: [], instruments: [] };
  const pool = [{ id: 'T1', musicianId: 'M1', musicDuration: '02:00', ratio: 20,
    records: { musician: { actualDuration: '01:00' } } }];
  const scheduled = [{ stage: 'rec', musicianId: 'M1', estDuration: '02:00:00' }];
  const feature = createFeature({ settings, itemPool: pool, scheduledTasks: scheduled });
  const before = JSON.stringify({ settings, pool, scheduled });
  assert.equal(feature.autoUpdateEfficiency('M1', 'musician'), 0.5);
  assert.equal(JSON.stringify({ settings, pool, scheduled }), before);
});

test('derived averages exclude other people, stages, and sessions without normalizing them', () => {
  const pool = [
    { id: 'T1', musicianId: 'M1', sessionId: 'S_A', musicDuration: '02:00', records: { musician: { actualDuration: '01:00' } } },
    { id: 'T2', musicianId: 'M1', sessionId: 'S_B', musicDuration: '02:00', records: { musician: { actualDuration: '10:00:00' } } },
    { id: 'T3', musicianId: 'OTHER', sessionId: 'S_A', musicDuration: '02:00', records: { musician: { actualDuration: '10:00:00' } } },
  ];
  const feature = createFeature({ itemPool: pool, currentSessionId: 'S_A' });
  const before = JSON.stringify(pool);
  assert.equal(feature.autoUpdateEfficiency('M1', 'musician'), 0.5);
  assert.equal(feature.autoUpdateEfficiency('M1', 'project'), 20);
  assert.equal(JSON.stringify(pool), before);
});
