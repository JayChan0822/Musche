import assert from 'node:assert/strict';
import test from 'node:test';

import { registerScheduleDragDropFeature } from '../app/scripts/features/schedule-drag-drop.js';

function createDropHarness() {
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
      checkOverlap: () => false,
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
