import assert from 'node:assert/strict';
import test from 'node:test';
import { reactive, ref } from 'vue';
import { registerScheduleInteractionsFeature } from '../app/scripts/features/schedule-interactions.js';
import { createMainContentShellState } from '../app/scripts/state/main-content-shell-state.js';
import { AppMainContent } from '../app/scripts/components/app-main-content.js';
import { registerHistoryFeature } from '../app/scripts/features/history.js';

function harness({ overlap = false } = {}) {
  const listeners = new Map();
  const win = {
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type) { listeners.delete(type); },
  };
  const task = { scheduleId: 'B1', musicianId: 'M1', date: '2026-09-27', startTime: '10:00', estDuration: '01:00:00' };
  const refs = { scheduledTasks: ref([task]), pxPerMin: ref(2), isMobile: ref(false) };
  const settings = reactive({ startHour: 9, endHour: 18 });
  const historyRefs = { ...refs, itemPool: ref([]), history: ref([]), historyIndex: ref(-1), showTrackList: ref(false), trackListData: ref(null) };
  const history = registerHistoryFeature({ refs: historyRefs, state: { settings }, actions: {} });
  history.pushHistory();
  const label = { textContent: '' };
  let preview;
  const ghost = { style: {}, classList: { remove() {} }, remove() { preview = null; },
    querySelector: () => label, setAttribute() {}, removeAttribute() {},
  };
  const source = { draggable: true, style: { opacity: '', cursor: '' },
    getBoundingClientRect: () => ({ top: 220, left: 10, width: 160, height: 120 }), cloneNode: () => ghost,
  };
  let inside = true;
  let gridTop = 100;
  const column = { dataset: { dateStr: '2026-09-28' },
    getBoundingClientRect: () => ({ left: 200, width: 180 }),
    querySelector: () => ({ getBoundingClientRect: () => ({ top: gridTop }) }),
  };
  const doc = { body: { appendChild(el) { preview = el; } },
    elementFromPoint: () => inside ? { closest: () => column } : null,
  };
  const alerts = [];
  const checks = [];
  const feature = registerScheduleInteractionsFeature({ refs, state: { settings }, utils: {}, actions: {
    getWindow: () => win, getDocument: () => doc,
    checkOverlap: (...args) => { checks.push(args); return overlap; },
    openAlertModal: (...args) => alerts.push(args), pushHistory: history.pushHistory,
    setTimeout: () => {},
  } });
  const shell = createMainContentShellState({ reactive, resolve: (path) => (
    path === 'helpers.initPreciseScheduleMove' ? feature.initPreciseScheduleMove : undefined
  ) });
  let prevented = false;
  const start = (overrides = {}) => shell.initPreciseScheduleMove({
    button: 0, metaKey: true, clientX: 40, clientY: 246, currentTarget: source,
    target: { closest: () => null }, preventDefault() { prevented = true; }, stopPropagation() {}, ...overrides,
  }, refs.scheduledTasks.value[0]);
  // No native dragstart/drop events are delivered; mouse events can lose modifiers.
  const move = (y = 272, metaKey = false) => listeners.get('mousemove')?.({ clientX: 240, clientY: y, metaKey, preventDefault() {} });
  const end = (y = 272, metaKey = false) => listeners.get('mouseup')?.({ clientX: 240, clientY: y, metaKey });
  return { refs, start, move, end, listeners, alerts, checks, label, history, historyRefs, source,
    get preview() { return preview; }, get prevented() { return prevented; },
    leave: () => { inside = false; }, scroll: () => { gridTop -= 20; },
  };
}

test('week task blocks bind Command handling at mousedown before native dragstart', () => {
  assert.match(AppMainContent.template, /class="task-block group"\s+@mousedown="initPreciseScheduleMove\(\$event, task\)"/);
  assert.match(AppMainContent.template, /data-schedule-start[^>]*>\{\{task.startTime\}\}/);
});

test('Command mouse drag previews and commits minute precision without native drag events', () => {
  const h = harness(); h.start(); h.move();
  assert.equal(h.prevented, true, 'mousedown prevents the native HTML drag');
  assert.equal(h.source.draggable, false, 'native draggable is disabled during the mouse gesture');
  assert.equal(h.label.textContent, '10:13');
  assert.ok(h.preview);
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:00', 'preview does not dirty stored data');
  h.end();
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:13');
  assert.equal(h.refs.scheduledTasks.value[0].date, '2026-09-28');
  assert.equal(h.refs.scheduledTasks.value[0].estDuration, '01:00:00');
  assert.equal(h.historyRefs.history.value.length, 2);
  assert.equal(h.preview, null);
  assert.equal(h.source.draggable, true);
  assert.equal(h.listeners.has('mousemove'), false);
  h.history.undo();
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:00');
  h.history.redo();
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:13');
});

test('precise move rejects overlap and keeps original date and duration', () => {
  const h = harness({ overlap: true }); h.start(); h.move(); h.end();
  assert.deepEqual(h.checks[0], ['2026-09-28', '10:13', '01:00:00', 'B1', 'musician']);
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:00');
  assert.equal(h.refs.scheduledTasks.value[0].date, '2026-09-27');
  assert.equal(h.alerts.length, 1);
  assert.equal(h.historyRefs.history.value.length, 1);
  assert.equal(h.source.style.opacity, '');
});

for (const cancel of ['escape', 'blur', 'outside']) {
  test(`precise move cancels on ${cancel} without saving or leaving listeners`, () => {
    const h = harness(); h.start(); h.move();
    if (cancel === 'outside') { h.leave(); h.end(); }
    else if (cancel === 'blur') h.listeners.get('blur')();
    else h.listeners.get('keydown')({ key: 'Escape', preventDefault() {}, stopPropagation() {} });
    assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:00');
    assert.equal(h.historyRefs.history.value.length, 1);
    assert.equal(h.preview, null);
    assert.equal(h.listeners.has('mousemove'), false);
    assert.equal(h.listeners.has('mouseup'), false);
  });
}

test('resize handles and non-primary clicks keep their existing handlers', () => {
  const h = harness();
  h.start({ button: 2 });
  assert.equal(h.prevented, false);
  h.start({ target: { closest: () => ({}) } });
  assert.equal(h.prevented, false);
  assert.equal(h.listeners.size, 0);
});

test('ordinary mouse drag previews quarter-hour positions in the target column and preserves duration', () => {
  const h = harness(); h.start({ metaKey: false }); h.move();
  assert.equal(h.prevented, true);
  assert.equal(h.source.draggable, false);
  assert.equal(h.label.textContent, '10:15');
  assert.equal(h.preview.style.left, '204px');
  assert.equal(h.preview.style.top, '250px');
  h.end();
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:15');
  assert.equal(h.refs.scheduledTasks.value[0].estDuration, '01:00:00');
  assert.equal(h.refs.scheduledTasks.value[0].date, '2026-09-28');
  assert.equal(h.historyRefs.history.value.length, 2);
  h.history.undo();
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:00');
});

test('ordinary drag can use Command to switch to minute precision', () => {
  const h = harness(); h.start({ metaKey: false });
  h.move(); assert.equal(h.label.textContent, '10:15');
  h.move(272, true); assert.equal(h.label.textContent, '10:13');
  h.move(272, false); assert.equal(h.label.textContent, '10:15');
  h.end(272, true);
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:13');
});

test('ordinary drag released outside the grid cancels the move', () => {
  const h = harness(); h.start({ metaKey: false }); h.move(); h.leave(); h.end();
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:00');
  assert.equal(h.historyRefs.history.value.length, 1);
  assert.equal(h.preview, null);
});

test('click without moving does not create a history entry', () => {
  const h = harness(); h.start(); h.end(246);
  assert.equal(h.historyRefs.history.value.length, 1);
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '10:00');
});

test('precise preview follows scroll and clamps to time bounds', () => {
  const h = harness(); h.start(); h.move(); h.scroll(); h.move();
  assert.equal(h.label.textContent, '10:23');
  h.move(-500); assert.equal(h.label.textContent, '09:00');
  h.move(5000); assert.equal(h.label.textContent, '17:59');
  h.end(5000);
  assert.equal(h.refs.scheduledTasks.value[0].startTime, '17:59');
});
