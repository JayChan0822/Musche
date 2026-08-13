import assert from 'node:assert/strict';
import test from 'node:test';

import { createTrackListRecords } from '../app/scripts/features/track-list-records.js';

const ref = (value) => ({ value });

function createRecords(overrides = {}) {
  const calls = { efficiency: [], history: 0, resize: 0 };
  const deps = {
    trackListData: ref({ viewType: 'musician', schedules: [], items: [], taskRef: {} }),
    itemPool: ref([]),
    scheduledTasks: ref([]),
    showTrackList: ref(false),
    formatSecs: (secs) => `${secs}s`,
    openInputModal: () => {},
    openAlertModal: () => {},
    pushHistory: () => { calls.history += 1; },
    autoUpdateEfficiency: (...args) => calls.efficiency.push(args),
    checkCanDeleteSplit: () => true,
    restoreSplitTime: () => false,
    pruneEmptySchedules: () => {},
    getViewType: () => 'musician',
    getTargetId: (item) => item.musicianId,
    autoResizeScheduleByRecords: () => { calls.resize += 1; },
    ...overrides,
  };
  const records = createTrackListRecords(deps);
  return { records, calls, deps };
}

test('saveTrackRecord debounces the efficiency write-back and pushes history on fire', () => {
  test.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { records, calls } = createRecords();
    const item = { id: 'T1', musicianId: 'M1', sessionId: 'S1' };

    records.saveTrackRecord(item);
    records.saveTrackRecord(item); // 去抖：重置 1500ms，只应触发一次
    assert.equal(calls.efficiency.length, 0, 'write-back must not run before the debounce fires');
    assert.equal(calls.history, 0, 'no history before the debounce fires');

    test.mock.timers.tick(1500);

    assert.deepEqual(calls.efficiency, [['M1', 'musician']], 'write-back runs exactly once after the debounce window');
    assert.equal(calls.history, 1, 'debounced write-back must enter the undo stack (93e045f regression guard)');
  } finally {
    test.mock.timers.reset();
  }
});

test('cancelPendingTrackSave drops a pending write-back so it never fires', () => {
  test.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { records, calls } = createRecords();
    const item = { id: 'T1', musicianId: 'M1', sessionId: 'S1' };

    records.saveTrackRecord(item);
    records.cancelPendingTrackSave();

    test.mock.timers.tick(1500);

    assert.equal(calls.efficiency.length, 0, 'cancelled write-back must not fire');
    assert.equal(calls.history, 0, 'cancelled write-back must not push history');
  } finally {
    test.mock.timers.reset();
  }
});

test('calcTrackDiff computes actualDuration and schedules the debounced write-back', () => {
  test.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { records, calls } = createRecords();
    const item = {
      id: 'T1',
      musicianId: 'M1',
      sessionId: 'S1',
      records: { musician: { recStart: '09:00', recEnd: '09:05', breakMinutes: 1 } },
    };

    records.calcTrackDiff(item);

    // 09:00→09:05 = 5 分钟，扣 1 分钟休息 = 4 分钟 = 240s
    assert.equal(item.records.musician.actualDuration, '240s', 'actualDuration should be recEnd - recStart - break');
    assert.equal(calls.resize, 1, 'schedule resize should run synchronously');
    assert.equal(calls.efficiency.length, 0, 'efficiency write-back is debounced, not synchronous');

    test.mock.timers.tick(1500);
    assert.deepEqual(calls.efficiency, [['M1', 'musician']], 'calcTrackDiff path also lands in the undo stack via debounce');
    assert.equal(calls.history, 1, 'history should be pushed once for the debounced write-back');
  } finally {
    test.mock.timers.reset();
  }
});
