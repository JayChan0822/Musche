import assert from 'node:assert/strict';
import test from 'node:test';

import { registerHistoryFeature } from '../app/scripts/features/history.js';
import { createTrackListRecords } from '../app/scripts/features/track-list-records.js';

const ref = (value) => ({ value });
const SNAP = (pool, tasks, settings = {}) => JSON.stringify({ pool, tasks, settings });

function createHistory(overrides = {}) {
  const calls = { cancel: 0 };
  const refs = {
    itemPool: ref([]),
    scheduledTasks: ref([]),
    history: ref([]),
    historyIndex: ref(-1),
    showTrackList: ref(false),
    trackListData: ref({ viewType: 'musician', schedules: [], items: [], taskRef: {} }),
    currentSessionId: ref('S1'),
    ...(overrides.refs || {}),
  };
  const state = { settings: {}, ...(overrides.state || {}) };
  const feature = registerHistoryFeature({
    refs,
    state,
    actions: {
      isItemVisibleForView: () => true,
      syncItemsForView: (items) => items,
      reopenTrackListForTask: () => {},
      cancelPendingTrackSave: () => { calls.cancel += 1; },
      ...(overrides.actions || {}),
    },
  });
  return { feature, refs, state, calls };
}

test('pushHistory dedupes an identical snapshot without touching the redo branch', () => {
  const { feature, refs } = createHistory();
  const pool = [{ id: 'A' }];
  const tasks = [{ scheduleId: 1 }];

  refs.itemPool.value = pool;
  refs.scheduledTasks.value = tasks;
  feature.pushHistory();
  feature.pushHistory();
  assert.equal(refs.history.value.length, 1, 'identical snapshots should dedupe into a single entry');
  assert.equal(refs.historyIndex.value, 0);

  refs.itemPool.value = [{ id: 'B' }];
  feature.pushHistory();
  assert.equal(refs.history.value.length, 2);
  assert.equal(refs.historyIndex.value, 1);

  // undo 回到 A，redo 分支存在（B）
  feature.undo();
  assert.equal(refs.historyIndex.value, 0);
  assert.equal(refs.itemPool.value[0].id, 'A');

  // no-op push（快照与当前索引相同）必须不砍 redo 分支
  feature.pushHistory();
  assert.equal(refs.history.value.length, 2, 'no-op push must not truncate the redo branch');
  assert.equal(refs.historyIndex.value, 0, 'no-op push must not advance the index');

  feature.redo();
  assert.equal(refs.historyIndex.value, 1, 'redo must still reach the B snapshot');
  assert.equal(refs.itemPool.value[0].id, 'B', 'redo must restore B after a no-op push');
});

test('pushHistory truncates the redo branch on a real change after undo', () => {
  const { feature, refs } = createHistory();
  refs.itemPool.value = [{ id: 'A' }];
  feature.pushHistory();
  refs.itemPool.value = [{ id: 'B' }];
  feature.pushHistory();

  feature.undo();
  refs.itemPool.value = [{ id: 'C' }]; // 真实变更
  feature.pushHistory();
  assert.equal(refs.history.value.length, 2, 'real change after undo truncates redo');
  assert.equal(refs.historyIndex.value, 1);
  feature.redo();
  assert.equal(refs.itemPool.value[0].id, 'C', 'redo lands on the newest snapshot');
});

test('undo and redo cancel any pending track-save debounce', () => {
  const { feature, calls } = createHistory();
  feature.undo();
  feature.undo(); // 栈已空，仍应调用 cancel（防 pending 写回打空撤销）
  assert.equal(calls.cancel, 2, 'undo must cancel pending write-back even at the stack bottom');

  feature.redo();
  feature.redo();
  assert.equal(calls.cancel, 4, 'redo must cancel pending write-back too');
});

test('race simulation: undo inside the debounce window keeps redo working (93e045f / 0dc4963 regression)', () => {
  test.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    // 真实两模块拼装：history + track-list-records（共享 refs）
    const calls = { cancel: 0, history: 0, efficiency: [] };
    const refs = {
      itemPool: ref([]),
      scheduledTasks: ref([]),
      history: ref([]),
      historyIndex: ref(-1),
      showTrackList: ref(false),
      trackListData: ref({ viewType: 'musician', schedules: [], items: [], taskRef: {} }),
      currentSessionId: ref('S1'),
    };
    const state = { settings: {} };

    // 先建 records：history 的 cancel action 需要真实调用它的 cancelPendingTrackSave
    const records = createTrackListRecords({
      trackListData: refs.trackListData,
      itemPool: refs.itemPool,
      scheduledTasks: refs.scheduledTasks,
      showTrackList: refs.showTrackList,
      formatSecs: (s) => `${s}s`,
      openInputModal: () => {},
      openAlertModal: () => {},
      pushHistory: () => { calls.history += 1; },
      autoUpdateEfficiency: (...args) => calls.efficiency.push(args),
      checkCanDeleteSplit: () => true,
      restoreSplitTime: () => false,
      pruneEmptySchedules: () => {},
      getViewType: () => 'musician',
      getTargetId: (item) => item.musicianId,
      autoResizeScheduleByRecords: () => {},
    });

    const history = registerHistoryFeature({
      refs,
      state,
      actions: {
        isItemVisibleForView: () => true,
        syncItemsForView: (items) => items,
        reopenTrackListForTask: () => {},
        // 模拟真实接线：history → helpers → records.cancelPendingTrackSave
        cancelPendingTrackSave: () => {
          calls.cancel += 1;
          records.cancelPendingTrackSave();
        },
      },
    });

    // 初始快照 EDIT_A
    refs.itemPool.value = [{ id: 'T1', musicianId: 'M1', sessionId: 'S1', ratio: 20, estDuration: 'old' }];
    refs.scheduledTasks.value = [];
    history.pushHistory();

    // 编辑 B：改 ratio/estDuration（模拟 autoUpdateEfficiency 写回目标）
    refs.itemPool.value = [{ id: 'T1', musicianId: 'M1', sessionId: 'S1', ratio: 90, estDuration: 'new' }];
    history.pushHistory(); // history: [A, B], index 1

    // 用户改了录音时间 → saveTrackRecord 挂起 debounce
    records.saveTrackRecord(refs.itemPool.value[0]);

    // 1.5s 内 Ctrl+Z
    history.undo(); // index 0，恢复到 A；cancel 触发
    assert.equal(calls.cancel, 1, 'undo must cancel the pending debounce');
    assert.equal(refs.itemPool.value[0].estDuration, 'old');

    // debounce 窗口走完——若未 cancel，这里会推历史砍 redo
    test.mock.timers.tick(1500);
    assert.equal(calls.history, 0, 'cancelled debounce must not push history');
    assert.equal(calls.efficiency.length, 0, 'cancelled debounce must not run the write-back');

    // redo 必须还能回到 B
    history.redo();
    assert.equal(refs.historyIndex.value, 1, 'redo branch must survive the debounce window');
    assert.equal(refs.itemPool.value[0].estDuration, 'new', 'redo must restore the edited state');
  } finally {
    test.mock.timers.reset();
  }
});
