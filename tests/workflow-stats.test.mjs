import assert from 'node:assert/strict';
import test from 'node:test';
import { ref, reactive } from 'vue';
import { registerSidebarStatsFeature } from '../app/scripts/features/sidebar-stats.js';
import { parseTime } from '../app/scripts/utils/time.js';
import { formatSecs } from '../app/scripts/utils/format.js';
import { peekItemSplitState } from '../app/scripts/utils/split-state.js';
import { UNASSIGNED_ID } from '../app/scripts/utils/workflow.js';

test('REC and EDIT group by independent owners and preserve unassigned work', () => {
  const refs = {
    itemPool: ref([{ id: 'T1', projectId: 'P', instrumentId: 'I', musicianId: 'A', editorId: 'B',
      musicDuration: '03:00', records: { musician: { actualDuration: '01:00:00' }, project: { actualDuration: '00:30:00' } } },
    { id: 'T2', projectId: 'P', instrumentId: 'I', musicDuration: '02:00' }]),
    scheduledTasks: ref([{ scheduleId: 'R', stage: 'rec', musicianId: 'A', projectId: 'P', date: '2026-09-28', startTime: '10:00', estDuration: '01:00:00', templateId: 'T1' },
      { scheduleId: 'E', stage: 'edit', editorId: 'B', projectId: 'P', date: '2026-09-28', startTime: '10:00', estDuration: '00:45:00', templateId: 'T1' }]),
    currentSessionId: ref('S_DEFAULT'), globalSearchQuery: ref(''), sidebarTab: ref('project'), sortField: ref('name'), sortAsc: ref(true),
    statClickIndexMap: {}, isMobile: ref(false), expandedGroups: new Set(),
  };
  const settings = reactive({ musicians: [{ id: 'A', name: 'Player', roles: ['musician'] }, { id: 'B', name: 'Editor', roles: ['editor'] }], projects: [{ id: 'P', name: 'Song' }], instruments: [] });
  const feature = registerSidebarStatsFeature({ refs, state: { settings }, utils: {
    parseTime, formatSecs, calculateEstTime: (d, r) => formatSecs(parseTime(d) * r), getNameById: () => '', getFullSearchText: () => '', smartMatch: () => true,
    isItemVisibleForView: () => true, peekSplitViewState: peekItemSplitState,
  }, actions: {} });
  const rec = feature.musicianStats.value.find((row) => row.id === 'A');
  assert.equal(rec.stage, 'rec');
  assert.equal(rec.scheduleCount, 1);
  const edit = feature.projectStats.value.find((row) => row.id === 'B');
  assert.ok(edit, 'EDIT groups by editor, not project');
  assert.equal(edit.stage, 'edit');
  assert.equal(edit.assigneeId, 'B');
  assert.equal(edit.ratioComparison.averageRatio, 10);
  assert.equal(edit.scheduleRatio, 15);
  assert.equal(edit.scheduleCount, 1);
  assert.equal(feature.projectStats.value.find((row) => row.id === UNASSIGNED_ID).items[0].id, 'T2');
  assert.equal(feature.musicianStats.value.find((row) => row.id === UNASSIGNED_ID).items[0].id, 'T2');
  assert.equal(refs.itemPool.value[0].musicianId, 'A');
  assert.equal(refs.itemPool.value[0].editorId, 'B');
});
