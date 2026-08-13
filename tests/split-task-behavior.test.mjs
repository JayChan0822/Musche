import assert from 'node:assert/strict';
import test from 'node:test';

import { registerSplitTaskFeature } from '../app/scripts/features/split-task.js';
import {
  createHiddenSplitState,
  getConnectedSplitItemIds,
  getItemSplitState as getSplitViewState,
  hasVisibleSplitStateInAnyView,
  isItemVisibleInView,
  setItemSplitState,
  syncLegacySplitFields,
} from '../app/scripts/utils/split-state.js';
import { parseTime } from '../app/scripts/utils/time.js';
import { formatSecs } from '../app/scripts/utils/format.js';

const ref = (value) => ({ value });

let idCounter = 0;
const generateUniqueId = (prefix) => `${prefix}${++idCounter}`;

function createFeature(overrides = {}) {
  const {
    itemPool = [],
    scheduledTasks = [],
    currentSessionId = 'S_DEFAULT',
    showTrackList = false,
    trackListData = null,
    actions = {},
  } = overrides;

  const defaultActions = {
    getCurrentSplitView: () => 'musician',
    syncItemForView: () => {},
    ensureItemRecords: (item) => {
      if (!item.records) item.records = { musician: {}, project: {}, instrument: {} };
    },
    openAlertModal: () => {},
    openInputModal: () => {},
    pushHistory: () => {},
    autoUpdateEfficiency: () => {},
    autoSortTrackList: () => {},
  };

  return registerSplitTaskFeature({
    refs: {
      showSplitModal: ref(false),
      itemPool: ref(itemPool),
      scheduledTasks: ref(scheduledTasks),
      trackListData: ref(trackListData || { schedules: [], items: [], currentSectionIndex: 0, totalSections: 0 }),
      currentSessionId: ref(currentSessionId),
      showTrackList: ref(showTrackList),
    },
    split: {
      createHiddenSplitState,
      deactivateItemInView: (item, viewType) => setItemSplitState(item, viewType, createHiddenSplitState()),
      getConnectedSplitItemIds,
      getSplitViewState,
      hasVisibleSplitStateInAnyView,
      isItemVisibleInView,
      setItemSplitState,
      syncLegacySplitFields,
    },
    utils: { parseTime, timeToMinutes: (v) => { const [h = 0, m = 0] = String(v).split(':').map(Number); return h * 60 + m; }, formatSecs, generateUniqueId, calculateEstTime: (duration, ratio) => formatSecs(parseTime(duration) * (ratio || 1)) },
    actions: { ...defaultActions, ...actions },
  });
}

test('checkCanSplit rejects items that already have a subsequent part', () => {
  const parent = { id: 'A' };
  const child = { id: 'B' };
  setItemSplitState(child, 'musician', { splitFromId: 'A', splitTag: 'Part 2', musicDuration: '00:30' });
  const alerts = [];
  const feature = createFeature({
    itemPool: [parent, child],
    actions: { openAlertModal: (_title, msg) => alerts.push(msg) },
  });

  assert.equal(feature.checkCanSplit(parent), false, 'a task with a child part cannot be split again');
  assert.equal(alerts.length, 1);
  assert.match(alerts[0], /Part 2/);
  assert.equal(feature.checkCanSplit(child), true, 'the last part can still be split');
});

test('checkCanDeleteSplit rejects items that still have a subsequent part', () => {
  const parent = { id: 'A' };
  const child = { id: 'B' };
  setItemSplitState(child, 'musician', { splitFromId: 'A', splitTag: 'Part 2' });
  const feature = createFeature({ itemPool: [parent, child] });

  assert.equal(feature.checkCanDeleteSplit(parent), false);
  assert.equal(feature.checkCanDeleteSplit(child), true, 'the last part can be deleted');
});

test('getFamilyTotalDuration sums visible family members from the root', () => {
  const root = { id: 'A' };
  const child = { id: 'B' };
  const other = { id: 'C' };
  setItemSplitState(root, 'musician', { splitFromId: null, musicDuration: '01:00' });
  setItemSplitState(child, 'musician', { splitFromId: 'A', musicDuration: '00:30' });
  setItemSplitState(other, 'musician', { splitFromId: null, musicDuration: '05:00' });
  const feature = createFeature({ itemPool: [root, child, other] });

  assert.equal(feature.getFamilyTotalDuration(child), 90, 'root + child = 90 seconds');
  assert.equal(feature.getFamilyTotalDuration(other), 300, 'unrelated item only counts itself');
});

test('getSplitFamilyMembers returns the whole connected family via split-state traversal', () => {
  const a = { id: 'A' };
  const b = { id: 'B' };
  const c = { id: 'C' };
  setItemSplitState(b, 'musician', { splitFromId: 'A' });
  setItemSplitState(c, 'musician', { splitFromId: 'B' });
  const feature = createFeature({ itemPool: [a, b, c] });

  const members = feature.getSplitFamilyMembers(a);
  assert.deepEqual(members.map((m) => m.id).sort(), ['A', 'B', 'C']);
});

test('syncFamilySharedIdentity propagates project/instrument/musician changes across the family', () => {
  const a = { id: 'A', projectId: 'P1', instrumentId: 'I1', musicianId: 'M1' };
  const b = { id: 'B', projectId: 'P1', instrumentId: 'I1', musicianId: 'M1' };
  setItemSplitState(b, 'musician', { splitFromId: 'A' });
  const scheduled = { templateId: 'B', projectId: 'P1', instrumentId: 'I1', musicianId: 'M1' };
  const feature = createFeature({ itemPool: [a, b], scheduledTasks: [scheduled] });

  feature.syncFamilySharedIdentity(a, { projectId: 'P2', musicianId: 'M2' });

  assert.equal(b.projectId, 'P2');
  assert.equal(b.musicianId, 'M2');
  assert.equal(b.instrumentId, 'I1', 'unspecified fields should stay');
  assert.equal(scheduled.projectId, 'P2', 'scheduled task identity should follow too');
  assert.equal(scheduled.musicianId, 'M2');
});

test('syncFamilyOrchestration copies the new orchestration to all family members', () => {
  const a = { id: 'A', orchestration: '2 2 2 2' };
  const b = { id: 'B', orchestration: '2 2 2 2' };
  setItemSplitState(b, 'musician', { splitFromId: 'A' });
  const feature = createFeature({ itemPool: [a, b] });

  feature.syncFamilyOrchestration(a, '3 3 3 3');

  assert.equal(a.orchestration, '3 3 3 3');
  assert.equal(b.orchestration, '3 3 3 3');
});

test('syncScheduledDurationsFromFamily mirrors template durations into scheduled tasks', () => {
  const a = { id: 'A', musicDuration: '01:00', estDuration: '02:00', ratio: 30 };
  const b = { id: 'B', musicDuration: '00:30', estDuration: '01:00', ratio: 30 };
  setItemSplitState(b, 'musician', { splitFromId: 'A', musicDuration: '00:30', estDuration: '01:00' });
  const scheduled = { templateId: 'B', musicDuration: '99:99', estDuration: '99:99', ratio: 0 };
  const feature = createFeature({ itemPool: [a, b], scheduledTasks: [scheduled] });

  feature.syncScheduledDurationsFromFamily(b);

  assert.equal(scheduled.musicDuration, '00:30');
  assert.equal(scheduled.estDuration, '01:00');
  assert.equal(scheduled.ratio, 30);
});

test('restoreSplitTime merges a deleted part back into its parent', () => {
  const parent = { id: 'A' };
  const child = { id: 'B' };
  setItemSplitState(parent, 'musician', { musicDuration: '01:00', splitTag: 'Part 1' });
  setItemSplitState(child, 'musician', { splitFromId: 'A', musicDuration: '00:30', splitTag: 'Part 2' });
  // 真实拆分会把另一视图标记为 hidden，restore 时据此判断是否整体删除
  setItemSplitState(child, 'project', createHiddenSplitState());
  const feature = createFeature({ itemPool: [parent, child] });

  const shouldRemoveTask = feature.restoreSplitTime({ id: 'B' });

  assert.equal(shouldRemoveTask, true, 'the deleted child should be fully removed');
  assert.equal(getSplitViewState(parent, 'musician').musicDuration, '00:01:30', 'parent absorbs the child duration');
  assert.equal(getSplitViewState(parent, 'musician').splitTag, '', 'parent tag clears when no children remain');
});

test('restoreSplitTime returns false for a root item with no parent', () => {
  const root = { id: 'A' };
  setItemSplitState(root, 'musician', { musicDuration: '01:00' });
  const feature = createFeature({ itemPool: [root] });

  assert.equal(feature.restoreSplitTime({ id: 'A' }), false);
});

test('confirmSplitSlider creates a remainder task and splits the source item', () => {
  const item = { id: 'A', musicDuration: '02:00', ratio: 20, musicianId: 'M1', sessionId: 'S_DEFAULT' };
  setItemSplitState(item, 'musician', { musicDuration: '02:00' });
  syncLegacySplitFields(item, 'musician');
  const pool = [item];
  const feature = createFeature({ itemPool: pool, actions: { autoUpdateEfficiency: () => {} } });

  feature.openSplitSlider(item);
  // 默认滑块在中点：02:00 → part1 01:00 / part2 01:00
  assert.equal(feature.splitState.part1Str, '00:01:00');
  assert.equal(feature.splitState.part2Str, '00:01:00');

  feature.confirmSplitSlider();

  const srcState = getSplitViewState(item, 'musician');
  assert.equal(srcState.splitTag, 'Part 1');
  assert.equal(srcState.musicDuration, '00:01:00');
  assert.equal(srcState.active, true);

  assert.equal(pool.length, 2, 'a remainder task should be pushed into the pool');
  const remainder = pool[1];
  assert.equal(remainder.musicDuration, '00:01:00', 'remainder keeps the second half duration');
  assert.equal(getSplitViewState(remainder, 'musician').splitTag, 'Part 2', 'remainder is tagged as the next part');
  assert.equal(remainder.musicianId, 'M1', 'remainder inherits the family identity');
});

test('confirmSplitSlider rejects split points at either end of the slider', () => {
  const item = { id: 'A', musicDuration: '02:00', ratio: 20, musicianId: 'M1', sessionId: 'S_DEFAULT' };
  setItemSplitState(item, 'musician', { musicDuration: '02:00' });
  syncLegacySplitFields(item, 'musician');
  const alerts = [];
  const pool = [item];
  const feature = createFeature({
    itemPool: pool,
    actions: { openAlertModal: (title) => alerts.push(title) },
  });

  feature.openSplitSlider(item);
  feature.splitState.splitPoint = 0;
  feature.confirmSplitSlider();
  assert.deepEqual(alerts, ['无效拆分'], 'start of the slider is an invalid split point');
  assert.equal(pool.length, 1, 'no remainder task should be created');
  assert.equal(getSplitViewState(item, 'musician').splitTag, '', 'source item stays untouched');

  alerts.length = 0;
  feature.splitState.splitPoint = feature.splitState.totalSec;
  feature.confirmSplitSlider();
  assert.deepEqual(alerts, ['无效拆分'], 'end of the slider is an invalid split point');
  assert.equal(pool.length, 1, 'no remainder task should be created');
  assert.equal(getSplitViewState(item, 'musician').splitTag, '', 'source item stays untouched');
});

test('splitTrack validates the remaining duration against the total', () => {
  const item = { id: 'A', musicDuration: '02:00', ratio: 20 };
  setItemSplitState(item, 'musician', { musicDuration: '02:00' });
  let captureInput = null;
  const alertTitles = [];
  const feature = createFeature({
    itemPool: [item],
    actions: {
      openInputModal: (_title, _init, _placeholder, onConfirm) => { captureInput = onConfirm; },
      openAlertModal: (title) => alertTitles.push(title),
    },
  });

  feature.splitTrack(item);
  captureInput('03:00'); // 大于总长 → 数值错误
  assert.deepEqual(alertTitles, ['数值错误'], 'remaining duration larger than total should be rejected');

  captureInput('bad'); // 格式非法 → 格式错误
  assert.deepEqual(alertTitles, ['数值错误', '格式错误'], 'malformed duration should be rejected with its own error type');

  captureInput('00:00'); // 恰好 0 → 数值错误
  assert.deepEqual(alertTitles, ['数值错误', '格式错误', '数值错误'], 'zero remaining duration should be rejected as a numeric error');
});

test('splitTrack rejects items without a usable total duration', () => {
  const alerts = [];
  const feature = createFeature({
    itemPool: [],
    actions: { openAlertModal: (title) => alerts.push(title) },
  });

  const noDuration = { id: 'A', musicDuration: '' };
  setItemSplitState(noDuration, 'musician', { musicDuration: '' });
  feature.splitTrack(noDuration);
  assert.deepEqual(alerts, ['无法拆分'], 'empty total duration should be unsplittable');

  const zeroDuration = { id: 'B', musicDuration: '00:00' };
  setItemSplitState(zeroDuration, 'musician', { musicDuration: '00:00' });
  feature.splitTrack(zeroDuration);
  assert.deepEqual(alerts, ['无法拆分', '无法拆分'], 'zero total duration should be unsplittable');
});

test('openSplitSlider rejects items without a usable total duration without opening the modal', () => {
  const alerts = [];
  const feature = createFeature({
    itemPool: [],
    actions: { openAlertModal: (title) => alerts.push(title) },
  });

  const noDuration = { id: 'A', musicDuration: '' };
  setItemSplitState(noDuration, 'musician', { musicDuration: '' });
  feature.openSplitSlider(noDuration);
  assert.deepEqual(alerts, ['无法拆分'], 'empty total duration should be unsplittable via the slider entry too');
  assert.equal(feature.splitState.task, null, 'split modal should stay closed');
  assert.equal(feature.splitState.totalSec, 0, 'no split math should run');

  alerts.length = 0;
  const zeroDuration = { id: 'B', musicDuration: '00:00' };
  setItemSplitState(zeroDuration, 'musician', { musicDuration: '00:00' });
  feature.openSplitSlider(zeroDuration);
  assert.deepEqual(alerts, ['无法拆分'], 'zero total duration should be unsplittable via the slider entry too');
  assert.equal(feature.splitState.task, null, 'split modal should stay closed');
});
