import assert from 'node:assert/strict';
import test from 'node:test';

import { registerTaskEditorFeature } from '../app/scripts/features/task-editor.js';

function createEditorHarness({ scheduleId = 501, templateId = 'POOL_1' } = {}) {
  const scheduledTask = {
    scheduleId,
    templateId,
    musicianId: 'M1',
    projectId: 'P1',
    instrumentId: 'I1',
  };
  const refs = {
    itemPool: { value: templateId ? [{ id: templateId, musicianId: 'M1' }] : [] },
    scheduledTasks: { value: [scheduledTask] },
    editingItem: { value: {} },
    editingSource: { value: '' },
    showEditor: { value: false },
    sidebarTab: { value: 'musician' },
    trackListData: { value: { viewType: 'musician' } },
  };
  const cancelledNotifications = [];
  const clearedPoolRecords = [];
  let historyCount = 0;

  const feature = registerTaskEditorFeature({
    refs,
    split: {
      ensureItemSplitViews: () => {},
      normalizeSplitViewType: (viewType) => viewType || 'musician',
      getSplitViewState: () => ({ splitFromId: null }),
      setItemSplitState: () => {},
      syncLegacySplitFields: () => {},
      rebalanceSplitFamilyDuration: () => ({ ok: true }),
      syncFamilyLegacyFields: () => {},
      syncFamilySharedIdentity: () => {},
      syncFamilyOrchestration: () => {},
      syncFamilyTotalDuration: () => {},
      syncScheduledDurationsFromFamily: () => {},
    },
    utils: {
      calculateEstTime: () => '01:00:00',
      getDefaultRatio: () => 20,
    },
    actions: {
      checkCanDeleteSplit: () => true,
      restoreSplitTime: () => true,
      clearPoolRecord: (id) => clearedPoolRecords.push(id),
      clearAggregateRecords: () => {},
      cleanupEmptySchedules: () => {},
      openAlertModal: () => {},
      autoUpdateEfficiency: () => {},
      updateTaskNotification: () => {},
      pushHistory: () => { historyCount += 1; },
      cancelNotification: (id) => cancelledNotifications.push(id),
    },
  });

  return {
    feature,
    refs,
    scheduledTask,
    cancelledNotifications,
    clearedPoolRecords,
    get historyCount() { return historyCount; },
  };
}

test('deleting a scheduled edit item cancels numeric notifications and clears template records', async () => {
  const harness = createEditorHarness({ scheduleId: 501, templateId: 'POOL_1' });

  harness.feature.openEditModal(harness.scheduledTask, 'schedule');
  await harness.feature.deleteEditingItem();

  assert.deepEqual(harness.cancelledNotifications, [501]);
  assert.deepEqual(harness.clearedPoolRecords, ['POOL_1']);
  assert.deepEqual(harness.refs.scheduledTasks.value, []);
  assert.equal(harness.refs.showEditor.value, false);
  assert.equal(harness.historyCount, 1);
});

test('deleting a scheduled edit item with a non-numeric id never cancels notification NaN', async () => {
  const harness = createEditorHarness({ scheduleId: 'SCHED_IMPORTED', templateId: 'POOL_IMPORTED' });

  harness.feature.openEditModal(harness.scheduledTask, 'schedule');
  await harness.feature.deleteEditingItem();

  assert.deepEqual(harness.cancelledNotifications, [], 'non-numeric schedule ids should not send NaN to notification cancellation');
  assert.deepEqual(harness.clearedPoolRecords, ['POOL_IMPORTED']);
  assert.deepEqual(harness.refs.scheduledTasks.value, []);
  assert.equal(harness.refs.showEditor.value, false);
  assert.equal(harness.historyCount, 1);
});
