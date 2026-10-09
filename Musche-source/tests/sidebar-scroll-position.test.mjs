import assert from 'node:assert/strict';
import test from 'node:test';
import { ref } from 'vue';
import { registerSidebarNavigationFeature } from '../app/scripts/features/sidebar-navigation.js';
import { registerSelectionFeature } from '../app/scripts/features/selection.js';

function setup({ cardTop = 900, scrollTop = 200, scrollHeight = 2400 } = {}) {
  const calls = [], classes = [], timers = [];
  const card = {
    getBoundingClientRect: () => ({ top: cardTop, height: 120 }),
    scrollIntoView: options => calls.push(options),
    classList: { add: (...args) => classes.push(['add', ...args]), remove: (...args) => classes.push(['remove', ...args]) },
  };
  const scroller = {
    clientHeight: 600, clientTop: 0, scrollHeight, scrollTop,
    getBoundingClientRect: () => ({ top: 100 }),
    querySelector: () => card,
    scrollTo: options => calls.push(options),
  };
  const refs = { isMobile: ref(false), isSidebarOpen: ref(true), sidebarTab: ref('musician') };
  const feature = registerSidebarNavigationFeature({ refs, actions: {
    getDocument: () => ({ querySelector: () => card }),
    setTimeoutFn: callback => timers.push(callback),
  } });
  feature.sidebarScrollRef.value = scroller;
  return { feature, refs, calls, classes, runTimers: () => { while (timers.length) timers.shift()(); } };
}

test('selecting a schedule positions its sidebar card at 38.2% and retains highlight', () => {
  const h = setup();
  const selection = registerSelectionFeature({ refs: {
    ...h.refs, selectedSource: ref(null), selectedTaskId: ref(null), selectedPoolIds: ref(new Set()),
    scheduledTasks: ref([{ scheduleId: 'schedule-1', musicianId: 'person-1' }]),
  }, actions: { scrollToSidebarItem: h.feature.scrollToSidebarItem } });
  selection.selectTask('schedule-1', 'schedule');
  h.runTimers();
  assert.deepEqual(h.calls, [{ top: 830.8, behavior: 'smooth' }]);
  assert.deepEqual(h.classes, [['add', 'ring-2', 'ring-[#ffffff]'], ['remove', 'ring-2', 'ring-[#ffffff]']]);
});

test('sidebar positioning respects the start and end of the scrollable list', () => {
  const start = setup({ cardTop: 100, scrollTop: 0 });
  start.feature.scrollToSidebarItem('first'); start.runTimers();
  assert.equal(start.calls[0].top, 0);
  const end = setup({ scrollHeight: 1000 });
  end.feature.scrollToSidebarItem('last'); end.runTimers();
  assert.equal(end.calls[0].top, 400);
});
