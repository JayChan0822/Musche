import test from 'node:test';
import assert from 'node:assert/strict';
import { registerRatioFeature } from '../app/scripts/features/ratio.js';
import { parseTime } from '../app/scripts/utils/time.js';
import { formatSecs } from '../app/scripts/utils/format.js';

test('stage estimates follow the correct person and actual updates do not rewrite booked blocks', () => {
  const item = { id: 'T', musicianId: 'A', editorId: 'B', projectId: 'P', musicDuration: '03:00', ratio: 20,
    ratios: { musician: null, project: null },
    records: { musician: { actualDuration: '01:00:00' }, project: { actualDuration: '00:30:00' } },
    splitViews: { musician: { active: true, musicDuration: '03:00' }, project: { active: true, musicDuration: '03:00' } },
  };
  const block = { stage: 'edit', editorId: 'B', templateId: 'T', musicDuration: '03:00', estDuration: '02:00:00' };
  const settings = { musicians: [{ id: 'A' }, { id: 'B' }], projects: [{ id: 'P', defaultRatio: 99 }], instruments: [] };
  const feature = registerRatioFeature({ refs: { itemPool: { value: [item] }, scheduledTasks: { value: [block] }, currentSessionId: { value: 'S_DEFAULT' },
    trackListData: { value: {} }, showTrackList: { value: false }, sidebarTab: { value: 'project' } },
    state: { settings }, utils: { parseTime, formatSecs }, actions: {} });
  assert.equal(feature.getTaskRatio(item), 10);
  assert.equal(feature.getTaskRatio(item, 'musician'), 20);
  feature.autoUpdateEfficiency('B', 'project');
  assert.equal(block.estDuration, '02:00:00');
  assert.equal(item.records.musician.actualDuration, '01:00:00');
  assert.equal(settings.projects[0].defaultRatio, 99);
});

test('rework average sums attempts once per content and never reads stale legacy record', async () => {
  const { ensureWorkflowLedger, appendWorkLog } = await import('../app/scripts/utils/workflow-ledger.js');
  const item = { id: 'T', musicianId: 'A', editorId: 'B', musicDuration: '02:00', records: { musician: { actualDuration: '10:00:00' } } };
  const settings = { musicians: [], projects: [], instruments: [] };
  ensureWorkflowLedger(settings, [item]);
  const feature = registerRatioFeature({ refs: { itemPool: { value: [item] }, scheduledTasks: { value: [] }, currentSessionId: { value: 'S_DEFAULT' },
    trackListData: { value: {} }, showTrackList: { value: false }, sidebarTab: { value: 'musician' } }, state: { settings }, utils: { parseTime, formatSecs }, actions: {} });
  assert.equal(feature.getDefaultRatio('A'), 20);
  assert.equal(feature.calculateSingleRatio(item), '-');
  appendWorkLog(settings, item, 'rec', { actualDuration: '00:10:00', musicDuration: '02:00', assigneeId: 'A' });
  appendWorkLog(settings, item, 'rec', { actualDuration: '00:05:00', musicDuration: '02:00', assigneeId: 'A' });
  appendWorkLog(settings, item, 'edit', { actualDuration: '00:02:00', musicDuration: '02:00', assigneeId: 'B' });
  assert.equal(feature.getDefaultRatio('A'), 7.5);
  assert.equal(feature.calculateSingleRatio(item), '7.5');
  assert.equal(feature.getDefaultRatio('B', 'project'), 1);
});
