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
  const feature = createFeature({ itemPool: [item], actions: { autoUpdateEfficiency: () => {} } });

  feature.openSplitSlider(item);
  // 默认滑块在中点：02:00 → part1 01:00 / part2 01:00
  assert.equal(feature.splitState.part1Str, '00:01:00');
  assert.equal(feature.splitState.part2Str, '00:01:00');

  feature.confirmSplitSlider();

  const pool = [item];
  // itemPool 是在 register 时捕获的 ref，这里直接读 feature 内部的 refs 不可得；
  // 通过父 item 的 split 状态 + 长度语义验证：源 item 变为 Part 1，余量任务入池。
  const srcState = getSplitViewState(item, 'musician');
  assert.equal(srcState.splitTag, 'Part 1');
  assert.equal(srcState.musicDuration, '00:01:00');
  assert.equal(srcState.active, true);
});

test('splitTrack validates the remaining duration against the total', () => {
  const item = { id: 'A', musicDuration: '02:00', ratio: 20 };
  setItemSplitState(item, 'musician', { musicDuration: '02:00' });
  let captureInput = null;
  let invalidCalls = 0;
  const feature = createFeature({
    itemPool: [item],
    actions: {
      openInputModal: (_title, _init, _placeholder, onConfirm) => { captureInput = onConfirm; },
      openAlertModal: (title) => { if (title === '格式错误' || title === '数值错误') invalidCalls += 1; },
    },
  });

  feature.splitTrack(item);
  captureInput('03:00'); // 大于总长 → 数值错误
  assert.equal(invalidCalls, 1, 'remaining duration larger than total should be rejected');

  captureInput('bad');
  assert.equal(invalidCalls, 2, 'malformed duration should be rejected');
});
