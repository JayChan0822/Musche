import assert from 'node:assert/strict';
import test from 'node:test';

import { registerAppLifecycleFeature } from '../app/scripts/features/app-lifecycle.js';
import { registerHistoryFeature } from '../app/scripts/features/history.js';
import { registerScheduleFeature } from '../app/scripts/features/schedule.js';
import { registerTrackListFeature } from '../app/scripts/features/track-list.js';
import { setItemSplitState } from '../app/scripts/utils/split-state.js';

const ref = (value) => ({ value });

test('divider drag commits before revealing the real divider and removes the ghost after render', () => {
  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalRequestAnimationFrame = global.requestAnimationFrame;
  const originalCancelAnimationFrame = global.cancelAnimationFrame;

  const frameCallbacks = [];
  const bodyChildren = new Set();
  const body = {
    appendChild: (node) => bodyChildren.add(node),
    contains: (node) => bodyChildren.has(node),
    removeChild: (node) => bodyChildren.delete(node),
  };
  const makeStyle = () => ({
    opacity: '',
    transform: '',
    transition: '',
    setProperty(name, value) { this[name] = value; },
  });
  const ghost = { style: makeStyle() };
  const divider = {
    style: makeStyle(),
    offsetHeight: 20,
    closest: () => divider,
    cloneNode: () => ghost,
    getBoundingClientRect: () => ({ top: 100, left: 20, width: 200, height: 20 }),
  };
  const taskElements = [0, 1].map(() => ({
    style: makeStyle(),
    offsetHeight: 40,
  }));
  let renderedDividers = [];
  const containerClasses = new Set();
  const container = {
    scrollTop: 0,
    classList: {
      add: (name) => containerClasses.add(name),
      remove: (name) => containerClasses.delete(name),
      contains: (name) => containerClasses.has(name),
    },
    querySelectorAll: (selector) => {
      if (selector === '.track-card') return taskElements;
      if (selector === '[id="sec-divider-1"]') return renderedDividers;
      return [];
    },
    getBoundingClientRect: () => ({ top: 0, bottom: 1000 }),
  };
  const items = [
    { id: 'A', sectionIndex: 0 },
    { id: 'B', sectionIndex: 1 },
  ];
  const moveCalls = [];
  let historyCount = 0;
  const draggingSectionIndex = ref(null);

  global.window = {
    getComputedStyle: () => ({ marginTop: '0', marginBottom: '0' }),
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  global.document = { body };
  global.requestAnimationFrame = (callback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
  global.cancelAnimationFrame = () => {};

  try {
    const feature = registerTrackListFeature({
      refs: {
        trackListData: ref({ items, viewType: 'musician', schedules: [] }),
        trackListContainerRef: ref(container),
        draggingSectionIndex,
        itemPool: ref(items),
        scheduledTasks: ref([]),
        showTrackList: ref(true),
        isMobile: ref(false),
        isDark: ref(false),
        sidebarTab: ref('musician'),
      },
      state: { settings: { instruments: [] } },
      utils: { parseTime: () => 0, formatSecs: String, getNameById: () => '' },
      actions: {
        openAlertModal: () => {},
        openInputModal: () => {},
        pushHistory: () => { historyCount += 1; },
        autoUpdateEfficiency: () => {},
        checkCanDeleteSplit: () => true,
        restoreSplitTime: () => false,
        moveDivider: (...args) => moveCalls.push(args),
        pruneEmptySchedules: () => {},
      },
    });

    feature.startDividerDrag({
      type: 'mousedown',
      cancelable: false,
      currentTarget: divider,
      clientY: 100,
    }, 1);
    assert.equal(draggingSectionIndex.value, 1, 'responsive drag state should hide the divider without a sticky inline style');
    assert.equal(divider.style.opacity, '');
    assert.equal(containerClasses.has('divider-drag-active'), true);
    feature.onDividerDragMove({ type: 'mousemove', cancelable: false, clientY: 200 });
    feature.onDividerDragEnd();

    assert.deepEqual(moveCalls, [[1, 'down', false]], 'divider data should commit synchronously on pointer release');
    assert.equal(historyCount, 1, 'one divider drag should create exactly one history entry');
    assert.equal(draggingSectionIndex.value, null);
    assert.equal(divider.style.opacity, '', 'divider visibility should be controlled by reactive classes, not inline opacity');
    assert.equal(body.contains(ghost), true, 'the drag ghost should cover the render handoff');
    assert.equal(taskElements[1].style.transition, 'none');
    assert.equal(taskElements[1].style.transform, '', 'preview transform should clear synchronously with the data commit');

    const renderedDivider = { style: makeStyle() };
    renderedDivider.style.opacity = '0';
    renderedDividers = [renderedDivider];
    assert.equal(frameCallbacks.length, 1);
    frameCallbacks.shift()();
    assert.equal(frameCallbacks.length, 1);
    frameCallbacks.shift()();

    assert.equal(divider.style.opacity, '', 'the real divider should be revealed after render');
    assert.equal(renderedDivider.style.opacity, '', 'a divider replaced by Vue should also be revealed');
    assert.equal(containerClasses.has('divider-drag-active'), false);
    assert.equal(body.contains(ghost), false, 'the ghost should be removed after render');
    taskElements.forEach((element) => {
      assert.equal(element.style.transition, '');
      assert.equal(element.style.transform, '');
    });
  } finally {
    global.window = originalWindow;
    global.document = originalDocument;
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
  }
});

test('moveDivider persists section changes in the active split view', () => {
  const item = {
    id: 'B',
    sectionIndex: 1,
    splitViews: {
      musician: { active: true, sectionIndex: 1 },
      project: { active: true, sectionIndex: 1 },
    },
  };
  const feature = registerScheduleFeature({
    refs: {
      itemPool: ref([item]),
      scheduledTasks: ref([]),
      currentSessionId: ref('S1'),
      trackListData: ref({ items: [item], viewType: 'musician' }),
      showTrackList: ref(true),
      pxPerMin: ref(1),
      sidebarTab: ref('musician'),
      currentView: ref('week'),
      viewDate: ref(new Date('2026-07-15')),
    },
    state: { settings: { startHour: 8, endHour: 20 } },
    utils: {
      parseTime: () => 0,
      timeToMinutes: () => 0,
      getNameById: () => '',
      addDaysToDate: (value) => value,
      addMinutesToTimeValue: (value) => value,
      addMinutesToTime: (value) => value,
      setItemSplitState,
    },
    actions: { pushHistory: () => {} },
  });

  feature.moveDivider(1, 'down', false);

  assert.equal(item.sectionIndex, 0);
  assert.equal(item.splitViews.musician.sectionIndex, 0, 'redo refresh must not overwrite the moved divider position');
  assert.equal(item.splitViews.project.sectionIndex, 1, 'moving one view must not change another Task List view');
});

test('history restore reopens the active Task List from the restored schedule object', () => {
  const oldTask = { scheduleId: 'S1', musicianId: 'M1', date: '2026-07-15', startTime: '09:00' };
  const currentTask = { scheduleId: 'S1', musicianId: 'M1', date: '2026-07-16', startTime: '14:00' };
  const refs = {
    itemPool: ref([{ id: 'CURRENT', musicianId: 'M1' }]),
    scheduledTasks: ref([currentTask]),
    history: ref([
      JSON.stringify({ pool: [{ id: 'OLD', musicianId: 'M1' }], tasks: [oldTask], settings: {} }),
      JSON.stringify({ pool: [{ id: 'CURRENT', musicianId: 'M1' }], tasks: [currentTask], settings: {} }),
    ]),
    historyIndex: ref(1),
    showTrackList: ref(true),
    trackListData: ref({
      taskRef: currentTask,
      schedules: [currentTask],
      currentSectionIndex: 0,
      totalSections: 1,
      viewType: 'musician',
      items: [],
    }),
    currentSessionId: ref('S1'),
  };
  const reopened = [];
  const feature = registerHistoryFeature({
    refs,
    state: { settings: {} },
    actions: {
      isItemVisibleForView: () => true,
      syncItemsForView: (items) => items,
      reopenTrackListForTask: (task) => reopened.push(task),
    },
  });

  feature.undo();

  assert.equal(reopened.length, 1);
  assert.equal(reopened[0], refs.scheduledTasks.value[0], 'Task List must bind to the restored task, not a stale taskRef');
  assert.equal(reopened[0].startTime, '09:00');
});

test('app startup records an initial history baseline', async () => {
  let bootOptions;
  const feature = registerAppLifecycleFeature({
    actions: {
      bootSessionData: async (options) => { bootOptions = options; },
      nextTick: async (callback) => { if (callback) callback(); },
      getWindow: () => ({ addEventListener: () => {}, removeEventListener: () => {} }),
      getDocument: () => ({ getElementById: () => null }),
    },
  });

  await feature.mountAppLifecycle();

  assert.equal(bootOptions.skipHistory, false, 'the first user action needs a pre-change snapshot to undo to');
});
