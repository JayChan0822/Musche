import assert from 'node:assert/strict';
import test from 'node:test';

import { registerScheduleDragDropFeature } from '../app/scripts/features/schedule-drag-drop.js';

function createDropHarness({ overlap = false } = {}) {
  const task = {
    scheduleId: 'SCHED_DONE',
    templateId: 'POOL_DONE',
    projectId: 'P_DONE',
    date: '2026-06-02',
    startTime: '10:00',
    estDuration: '1800s',
  };
  const refs = {
    scheduledTasks: { value: [task] },
    pxPerMin: { value: 2 },
    sidebarTab: { value: 'project' },
    currentSessionId: { value: 'S_DEFAULT' },
    isMobile: { value: false },
  };
  const alerts = [];
  const history = [];
  const clearedPoolRecords = [];
  const removedDragOver = [];
  const documentStub = {
    querySelectorAll: (selector) => {
      if (selector !== '.grid-slot.drag-over') return [];
      return [{
        classList: {
          remove: (className) => removedDragOver.push(className),
        },
      }];
    },
  };
  const container = { getBoundingClientRect: () => ({ top: 100 }) };
  const column = { querySelector: (selector) => selector === '.relative[style*="min-height"]' ? container : null };
  const feature = registerScheduleDragDropFeature({
    refs,
    state: {
      settings: { startHour: 9, endHour: 18 },
    },
    utils: {
      formatSecs: (seconds) => `${seconds}s`,
    },
    actions: {
      getDocument: () => documentStub,
      getDocumentBody: () => ({ appendChild() {}, removeChild() {} }),
      setTimeout: (callback) => callback(),
      checkOverlap: () => overlap,
      openAlertModal: (...args) => alerts.push(args),
      pushHistory: () => history.push('push'),
      isResourceCompleted: () => true,
      clearPoolRecord: (id) => clearedPoolRecords.push(id),
    },
  });

  return {
    feature,
    task,
    refs,
    alerts,
    history,
    clearedPoolRecords,
    removedDragOver,
    poolDropEvent: { currentTarget: { classList: { remove: () => {} } } },
    weekDropEvent: {
      clientY: 140,
      target: { closest: (selector) => selector === '[data-date-str]' ? column : null },
    },
  };
}

test('a rejected completed-resource drop to pool clears stale drag state', async () => {
  const harness = createDropHarness();

  harness.feature.dragStart({
    altKey: false,
    target: null,
    dataTransfer: { effectAllowed: '' },
  }, harness.task, 'schedule');
  await harness.feature.dropToPool(harness.poolDropEvent);

  assert.deepEqual(harness.alerts, [['操作被拒绝', '该任务所属对象已处于【完成】状态，禁止移回任务池。']]);
  assert.deepEqual(harness.refs.scheduledTasks.value, [harness.task], 'rejected pool drops must not remove the schedule');
  assert.deepEqual(harness.clearedPoolRecords, [], 'rejected pool drops must not clear pool records');
  assert.deepEqual(harness.history, [], 'rejected pool drops must not push history');

  harness.feature.dropToSchedule(harness.weekDropEvent, '2026-06-03');

  assert.deepEqual(harness.refs.scheduledTasks.value, [harness.task], 'stale rejected drag data must not move the task on a later drop');
  assert.deepEqual(harness.history, [], 'stale rejected drag data must not push history on a later drop');
  assert.deepEqual(harness.removedDragOver, ['drag-over'], 'later drops may still clear visual drag-over state');
});

function startBlockDrag(harness, { offset = 13, metaKey = false } = {}) {
  const block = {
    getBoundingClientRect: () => ({ top: 220, left: 0 }), offsetWidth: 100,
    classList: { add() {} }, style: {},
    cloneNode: () => ({ classList: { remove() {} }, style: { setProperty() {} } }),
  };
  harness.feature.dragStart({
    clientY: 220 + offset * 2, clientX: 20, metaKey,
    currentTarget: block,
    // A label inside the block must not become the position origin.
    target: { ...block, getBoundingClientRect: () => ({ top: 230, left: 0 }) },
    dataTransfer: { setDragImage() {} },
  }, harness.task, 'schedule');
}

for (const [metaKey, minute, expected] of [
  [false, 73, '10:15'], [true, 73, '10:13'],
  [false, 47, '09:45'], [true, 47, '09:47'],
]) {
  test(`moving a whole block to minute ${minute} with Command=${metaKey} gives ${expected}`, () => {
    const h = createDropHarness();
    startBlockDrag(h, { metaKey: !metaKey });
    h.feature.dropToSchedule({ ...h.weekDropEvent, clientY: 100 + (minute + 13) * 2, metaKey }, '2026-06-03');
    assert.equal(h.refs.scheduledTasks.value[0].startTime, expected);
    assert.equal(h.refs.scheduledTasks.value[0].date, '2026-06-03');
    assert.equal(h.refs.scheduledTasks.value[0].estDuration, '1800s');
    assert.equal(h.refs.scheduledTasks.value[0].scheduleId, h.task.scheduleId);
    assert.equal(h.history.length, 1);
  });
}

test('whole-block move respects conflicts and clears drag state', () => {
  const h = createDropHarness({ overlap: true });
  startBlockDrag(h);
  const event = { ...h.weekDropEvent, clientY: 272, metaKey: true };
  h.feature.dropToSchedule(event, '2026-06-03');
  assert.equal(h.task.startTime, '10:00');
  assert.equal(h.task.date, '2026-06-02');
  assert.equal(h.history.length, 0);
  assert.equal(h.alerts.length, 1);
  h.feature.dropToSchedule(event, '2026-06-03');
  assert.equal(h.alerts.length, 1);
});

for (const [metaKey, minute, expected] of [
  [false, -10, '09:00'], [true, -10, '09:00'],
  [false, 550, '17:45'], [true, 550, '17:59'],
]) {
  test(`whole-block move clamps minute ${minute} with Command=${metaKey}`, () => {
    const h = createDropHarness();
    startBlockDrag(h);
    h.feature.dropToSchedule({ ...h.weekDropEvent, clientY: 100 + (minute + 13) * 2, metaKey }, '2026-06-03');
    assert.equal(h.refs.scheduledTasks.value[0].startTime, expected);
  });
}
