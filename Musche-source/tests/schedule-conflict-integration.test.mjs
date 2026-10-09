import assert from 'node:assert/strict';
import test from 'node:test';
import { ref } from 'vue';
import { registerScheduleFeature } from '../app/scripts/features/schedule.js';
import { registerDesktopResizeFeature } from '../app/scripts/features/desktop-resize.js';
import { registerTaskEditorFeature } from '../app/scripts/features/task-editor.js';
import { parseTime, timeToMinutes } from '../app/scripts/utils/time.js';
import { formatSecs } from '../app/scripts/utils/format.js';

function setup() {
  const refs = { scheduledTasks: ref([
    { scheduleId: 'A', stage: 'rec', musicianId: 'M1', date: '2026-09-29', startTime: '10:00', estDuration: '01:00:00' },
    { scheduleId: 'B', stage: 'rec', musicianId: 'M2', date: '2026-09-29', startTime: '11:00', estDuration: '01:00:00' },
  ]), currentSessionId: ref('S_DEFAULT'), itemPool: ref([]), sidebarTab: ref('musician') };
  const utils = { parseTime, timeToMinutes, formatSecs };
  const schedule = registerScheduleFeature({ refs, state: { settings: {} }, utils, actions: {} });
  const alerts = [], history = [];
  const actions = { checkOverlap: schedule.checkOverlap, openAlertModal: (...args) => alerts.push(args), pushHistory: () => history.push(1) };
  return { refs, utils, actions, alerts, history };
}

test('resizing into another musician schedule restores duration and displays conflict', () => {
  const h = setup();
  const task = h.refs.scheduledTasks.value[0];
  const resize = registerDesktopResizeFeature({ refs: { ...h.refs, resizing: ref(null), pxPerMin: ref(2) }, utils: h.utils,
    actions: { ...h.actions, getDocumentBody: () => ({ style: {} }) } });
  resize.initResize({ preventDefault() {}, stopPropagation() {}, clientY: 100, target: { closest: () => ({ offsetHeight: 120 }) } }, task);
  resize.handleResizeMove({ clientY: 130 });
  resize.handleResizeEnd();
  assert.equal(task.estDuration, '01:00:00');
  assert.match(h.alerts[0][0], /冲突/);
  assert.equal(h.history.length, 0);
});

test('editing a schedule into a conflict keeps its draft open and leaves saved data untouched', () => {
  const h = setup();
  const refs = { ...h.refs, editingItem: ref({ ...h.refs.scheduledTasks.value[0], startTime: '10:30' }), editingSource: ref('schedule'), showEditor: ref(true), trackListData: ref({}) };
  const editor = registerTaskEditorFeature({ refs, split: { normalizeSplitViewType: x => x, ensureItemSplitViews() {}, syncLegacySplitFields() {}, setItemSplitState() {}, getSplitViewState: () => ({}) },
    utils: { calculateEstTime: () => '01:00:00', getDefaultRatio: () => 20 }, actions: { ...h.actions, autoUpdateEfficiency() {} } });
  editor.saveEdit();
  assert.equal(refs.scheduledTasks.value[0].startTime, '10:00');
  assert.equal(refs.showEditor.value, true);
  assert.equal(h.history.length, 0);
  assert.match(h.alerts[0][0], /冲突/);
});
