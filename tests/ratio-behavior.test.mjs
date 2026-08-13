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

test('getDefaultRatio reads the per-type setting and falls back to 20', () => {
  const feature = createFeature({
    settings: {
      musicians: [{ id: 'M1', defaultRatio: 35 }],
      projects: [{ id: 'P1', defaultRatio: 50 }],
      instruments: [],
    },
  });

  assert.equal(feature.getDefaultRatio('M1', 'musician'), 35);
  assert.equal(feature.getDefaultRatio('P1', 'project'), 50);
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
  assert.equal(feature.getTaskRatio(item), 30, 'falls back to the musician default ratio');
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

test('autoUpdateEfficiency recomputes the default ratio and resets x20-following tasks', () => {
  const settings = { musicians: [{ id: 'M1', defaultRatio: 20 }], projects: [], instruments: [] };
  const pool = [
    // 2 分钟音乐、1 分钟实际 → 平均倍率 0.5
    { id: 'T1', musicianId: 'M1', sessionId: 'S_DEFAULT', musicDuration: '02:00', ratio: 20 },
    { id: 'T2', musicianId: 'M1', sessionId: 'S_DEFAULT', musicDuration: '02:00', ratio: 20 },
  ];
  const scheduled = [{ id: 'S1', musicianId: 'M1', sessionId: 'S_DEFAULT', musicDuration: '02:00', ratio: 20 }];
  const feature = createFeature({ itemPool: pool, scheduledTasks: scheduled, settings });

  // 给两个任务各写入 1 分钟实际录音
  pool.forEach((item) => {
    feature.ensureItemRecords(item);
    item.records.musician.actualDuration = '01:00';
  });

  feature.autoUpdateEfficiency('M1', 'musician');

  assert.equal(settings.musicians[0].defaultRatio, 0.5, 'musician default ratio should update to the actual/music average');
  pool.forEach((item) => {
    assert.equal(item.ratios.musician, null, 'x20 tasks should reset to auto-follow (null ratio)');
    assert.equal(item.ratio, 0.5);
    assert.equal(item.estDuration, '00:01:00', 'estDuration should follow the new ratio');
  });
  assert.equal(scheduled[0].ratio, 0.5, 'scheduledTasks should follow the same rule');
});

test('autoUpdateEfficiency ignores other dimensions', () => {
  const settings = { musicians: [{ id: 'M1', defaultRatio: 20 }], projects: [], instruments: [] };
  const pool = [
    { id: 'T1', musicianId: 'M1', sessionId: 'S_DEFAULT', musicDuration: '02:00', ratio: 20 },
    { id: 'T2', musicianId: 'OTHER', sessionId: 'S_DEFAULT', musicDuration: '02:00', ratio: 20 },
  ];
  const feature = createFeature({ itemPool: pool, scheduledTasks: [], settings });
  pool.forEach((item) => {
    feature.ensureItemRecords(item);
    item.records.musician.actualDuration = '01:00';
  });

  feature.autoUpdateEfficiency('M1', 'musician');

  assert.equal(settings.musicians[0].defaultRatio, 0.5);
  assert.equal(pool[1].ratio, 20, 'other musician should be untouched');
});

test('autoUpdateEfficiency never writes across sessions (regression: A-session recording must not mutate B-session tasks)', () => {
  const settings = { musicians: [{ id: 'M1', defaultRatio: 20 }], projects: [], instruments: [] };
  const pool = [
    // 当前会话 S_A：2 分钟音乐、1 分钟实际
    { id: 'T1', musicianId: 'M1', sessionId: 'S_A', musicDuration: '02:00', ratio: 20 },
    // 另一会话 S_B：同乐手，必须保持原样（Ctrl+Z 救不回，写坏即丢）
    { id: 'T2', musicianId: 'M1', sessionId: 'S_B', musicDuration: '02:00', ratio: 20 },
  ];
  const scheduled = [{ id: 'S1', musicianId: 'M1', sessionId: 'S_B', musicDuration: '02:00', ratio: 20 }];
  const feature = createFeature({ itemPool: pool, scheduledTasks: scheduled, settings, currentSessionId: 'S_A' });
  // 真实场景：只有当前会话的任务有录音，B 会话任务从未被触碰
  feature.ensureItemRecords(pool[0]);
  pool[0].records.musician.actualDuration = '01:00';

  feature.autoUpdateEfficiency('M1', 'musician');

  assert.equal(settings.musicians[0].defaultRatio, 0.5, 'average ratio comes from the current session only');
  assert.equal(pool[0].ratios.musician, null, 'current-session x20 task resets to auto-follow');
  assert.equal(pool[0].ratio, 0.5);
  assert.equal(pool[1].ratio, 20, 'other-session pool task must stay untouched');
  assert.equal(pool[1].estDuration, undefined, 'other-session pool task must not gain an estDuration');
  assert.equal(pool[1].ratios, undefined, 'other-session task must not even be normalized');
  assert.equal(scheduled[0].ratio, 20, 'other-session scheduled task must stay untouched');
});
