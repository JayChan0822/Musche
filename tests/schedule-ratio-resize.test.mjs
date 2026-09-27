import assert from 'node:assert/strict';
import test from 'node:test';
import { reactive, ref } from 'vue';
import { registerSidebarStatsFeature } from '../app/scripts/features/sidebar-stats.js';
import { registerDesktopResizeFeature } from '../app/scripts/features/desktop-resize.js';
import { registerMobileResizeFeature } from '../app/scripts/features/mobile-resize.js';
import { parseTime, timeToMinutes } from '../app/scripts/utils/time.js';
import { formatSecs } from '../app/scripts/utils/format.js';
import { registerHistoryFeature } from '../app/scripts/features/history.js';

function createStats() {
  const refs = {
    itemPool: ref([{ id: 'T1', name: 'Song A', musicianId: 'M1', musicDuration: '00:03:00', sectionIndex: 0 }]),
    scheduledTasks: ref([{ scheduleId: 'B1', musicianId: 'M1', date: '2026-09-27', startTime: '10:00', estDuration: '01:00:00' }]),
    currentSessionId: ref('S_DEFAULT'), globalSearchQuery: ref(''), sidebarTab: ref('musician'),
    sortField: ref('name'), sortAsc: ref(true), statClickIndexMap: {}, isMobile: ref(false), expandedGroups: new Set(),
  };
  const settings = reactive({ musicians: [{ id: 'M1', name: 'Player', defaultRatio: 30 }], projects: [], instruments: [] });
  const feature = registerSidebarStatsFeature({
    refs, state: { settings },
    utils: {
      parseTime, formatSecs, calculateEstTime: (duration, ratio) => formatSecs(parseTime(duration) * ratio),
      getNameById: () => '', getFullSearchText: (item) => item.name.toLowerCase(),
      smartMatch: (text, query) => text.includes(query),
      isItemVisibleForView: (item) => item.visible !== false,
      peekSplitViewState: (item) => item,
    }, actions: {},
  });
  return { refs, settings, feature, ratio: () => feature.musicianStats.value[0].scheduleRatio };
}

function createResize(task, { overlap = false, height = 120, pushHistory = () => {} } = {}) {
  const refs = { resizing: ref(null), pxPerMin: ref(2) };
  const alerts = [];
  const feature = registerDesktopResizeFeature({ refs, utils: { parseTime, timeToMinutes, formatSecs }, actions: {
    getDocumentBody: () => ({ style: {} }), checkOverlap: () => overlap,
    openAlertModal: (...args) => alerts.push(args), pushHistory,
  } });
  feature.initResize({ preventDefault() {}, stopPropagation() {}, clientY: 100,
    target: { closest: () => ({ offsetHeight: height }) },
  }, task);
  return { feature, refs, alerts };
}

test('musician schedule ratio reacts to blocks without changing estimate defaults', () => {
  const h = createStats();
  assert.equal(h.ratio(), 20);
  h.refs.scheduledTasks.value[0].estDuration = '01:15:00';
  assert.equal(h.ratio(), 25);
  assert.equal(h.settings.musicians[0].defaultRatio, 30);
  assert.equal(h.feature.musicianStats.value[0].items[0].estDuration, '01:00:00');
});

test('schedule ratio totals blocks and their sections and ignores search/session/skipped items', () => {
  const h = createStats();
  h.refs.itemPool.value.push(
    { id: 'T2', name: 'Song B', musicianId: 'M1', musicDuration: '00:02:00', sectionIndex: 1 },
    { id: 'T3', name: 'Skipped', musicianId: 'M1', musicDuration: '01:00:00', isSkipped: true },
    { id: 'T4', name: 'Unscheduled', musicianId: 'M1', musicDuration: '01:00:00', sectionIndex: 2 },
    { id: 'T5', name: 'Other session', musicianId: 'M1', musicDuration: '01:00:00', sessionId: 'OTHER' },
  );
  h.refs.scheduledTasks.value.push(
    { scheduleId: 'B2', musicianId: 'M1', date: '2026-09-28', startTime: '10:00', estDuration: '00:30:00' },
    { scheduleId: 'B3', musicianId: 'M1', date: '2026-09-28', startTime: '10:00', estDuration: '05:00:00', sessionId: 'OTHER' },
  );
  assert.equal(h.ratio(), 18);
  h.refs.globalSearchQuery.value = 'song a';
  assert.equal(h.ratio(), 18);
});

test('individual blocks use template references and count shared music only once', () => {
  const h = createStats();
  h.refs.itemPool.value.push({ id: 'UNSCHEDULED', name: 'B', musicianId: 'M1', musicDuration: '00:20:00' });
  h.refs.scheduledTasks.value[0].templateId = 'T1';
  h.refs.scheduledTasks.value.push({ ...h.refs.scheduledTasks.value[0], scheduleId: 'B2', estDuration: '00:30:00' });
  assert.equal(h.ratio(), 30);
});

test('no schedule or no music exposes a fallback instead of an invalid ratio', () => {
  const h = createStats();
  h.refs.itemPool.value[0].musicDuration = '';
  assert.equal(h.ratio(), null);
  h.refs.scheduledTasks.value = [];
  assert.equal(h.ratio(), null);
});

test('ratio comparison shows average versus schedule and updates the signed margin live', () => {
  const h = createStats();
  h.refs.itemPool.value[0].records = { musician: { actualDuration: '01:00:00' } };
  const comparison = () => h.feature.musicianStats.value[0].ratioComparison;
  assert.equal(comparison().averageRatio, 20);
  assert.equal(comparison().scheduledRatio, 20);
  assert.equal(comparison().differencePercent, 0);
  h.refs.scheduledTasks.value[0].estDuration = '01:15:00';
  assert.equal(comparison().differencePercent, 25);
  h.refs.scheduledTasks.value[0].estDuration = '00:45:00';
  assert.equal(comparison().differencePercent, -25);
  assert.equal(h.settings.musicians[0].defaultRatio, 30);
});

test('comparison average is weighted by music duration, excludes skipped records and survives search', () => {
  const h = createStats();
  h.refs.itemPool.value[0].records = { musician: { actualDuration: '01:00:00' } };
  h.refs.itemPool.value.push(
    { id: 'T2', name: 'Song B', musicianId: 'M1', musicDuration: '00:01:00', records: { musician: { actualDuration: '00:40:00' } } },
    { id: 'SKIP', name: 'Skipped', musicianId: 'M1', musicDuration: '00:01:00', isSkipped: true, records: { musician: { actualDuration: '03:00:00' } } },
  );
  const before = h.feature.musicianStats.value[0].ratioComparison;
  assert.equal(before.averageRatio, 25);
  assert.equal(before.actualSeconds, 6000);
  assert.equal(before.recordedMusicSeconds, 240);
  h.refs.globalSearchQuery.value = 'song a';
  assert.deepEqual(h.feature.musicianStats.value[0].ratioComparison, before);
});

test('comparison does not invent an average from defaults or a schedule from recordings', () => {
  const h = createStats();
  let comparison = h.feature.musicianStats.value[0].ratioComparison;
  assert.equal(comparison.averageRatio, null);
  assert.equal(comparison.scheduledRatio, 20);
  assert.equal(comparison.differencePercent, null);
  h.refs.itemPool.value[0].records = { musician: { actualDuration: '01:00:00' } };
  h.refs.scheduledTasks.value = [];
  comparison = h.feature.musicianStats.value[0].ratioComparison;
  assert.equal(comparison.averageRatio, 20);
  assert.equal(comparison.scheduledRatio, null);
  assert.equal(comparison.differencePercent, null);
});

test('scheduled musician without recorded average has a neutral status, not insufficient time', () => {
  const h = createStats();
  const stat = () => h.feature.musicianStats.value[0];
  assert.equal(stat().ratioComparison.averageRatio, null);
  assert.equal(stat().statusKey, 'scheduled');
  assert.equal(stat().isFullyScheduled, false, 'unknown capacity must not prevent adding more schedule time');
  h.refs.globalSearchQuery.value = '缺时';
  assert.equal(h.feature.musicianStats.value.length, 0);
  h.refs.globalSearchQuery.value = '已排';
  assert.equal(h.feature.musicianStats.value.length, 1);
  h.refs.globalSearchQuery.value = '';
  h.refs.scheduledTasks.value = [];
  assert.equal(stat().statusKey, 'unscheduled');
});

test('insufficient time remains available once a musician has a measured average', () => {
  const h = createStats();
  h.refs.itemPool.value[0].records = { musician: { actualDuration: '01:00:00' } };
  h.refs.itemPool.value.push({ id: 'T2', name: 'Song B', musicianId: 'M1', musicDuration: '00:03:00', sectionIndex: 0 });
  assert.equal(h.feature.musicianStats.value[0].statusKey, 'insufficient');
});

test('normal resizing snaps to 15 minutes; Command snaps to 1 minute in either direction', () => {
  const h = createStats();
  const task = h.refs.scheduledTasks.value[0];
  const resize = createResize(task);
  resize.feature.handleResizeMove({ clientY: 126, metaKey: false });
  assert.equal(task.estDuration, '01:15:00');
  assert.equal(h.ratio(), 25);
  resize.feature.handleResizeMove({ clientY: 126, metaKey: true });
  assert.equal(task.estDuration, '01:13:00');
  resize.feature.handleResizeMove({ clientY: 96, metaKey: true });
  assert.equal(task.estDuration, '00:58:00');
  assert.equal(h.ratio(), 19.3);
  resize.feature.handleResizeMove({ clientY: 126, metaKey: false });
  assert.equal(task.estDuration, '01:15:00');
});

test('resize uses stored duration, not minimum visual block height', () => {
  const task = { startTime: '10:00', estDuration: '00:05:00' };
  const resize = createResize(task, { height: 40 });
  resize.feature.handleResizeMove({ clientY: 102, metaKey: true });
  assert.equal(task.estDuration, '00:06:00');
  resize.feature.handleResizeMove({ clientY: -100, metaKey: true });
  assert.equal(task.estDuration, '00:05:00');
});

test('conflict rolls back duration and derived ratio without a history entry', () => {
  const h = createStats();
  let saves = 0;
  const resize = createResize(h.refs.scheduledTasks.value[0], { overlap: true, pushHistory: () => saves++ });
  resize.feature.handleResizeMove({ clientY: 130 });
  assert.equal(h.ratio(), 25);
  resize.feature.handleResizeEnd();
  assert.equal(h.ratio(), 20);
  assert.equal(saves, 0);
  assert.equal(resize.alerts.length, 1);
});

test('undo and redo restore block duration and the musician ratio together', () => {
  const h = createStats();
  const history = registerHistoryFeature({ refs: {
    ...h.refs, history: ref([]), historyIndex: ref(-1), showTrackList: ref(false), trackListData: ref(null),
  }, state: { settings: h.settings }, actions: {} });
  history.pushHistory();
  const resize = createResize(h.refs.scheduledTasks.value[0], { pushHistory: history.pushHistory });
  resize.feature.handleResizeMove({ clientY: 130 });
  resize.feature.handleResizeEnd();
  assert.equal(h.ratio(), 25);
  history.undo();
  assert.equal(h.ratio(), 20);
  assert.equal(h.refs.scheduledTasks.value[0].estDuration, '01:00:00');
  history.redo();
  assert.equal(h.ratio(), 25);
  assert.equal(h.refs.scheduledTasks.value[0].estDuration, '01:15:00');
});

test('mobile edge resizing uses the same 15 minute grid', () => {
  const task = reactive({ startTime: '10:00', estDuration: '01:00:00' });
  const refs = { isMobile: ref(true), isResizingMobile: ref(false), mobileResizeState: reactive({}), pxPerMin: ref(2) };
  const feature = registerMobileResizeFeature({ refs, utils: { parseTime, timeToMinutes, formatSecs }, actions: {
    addWindowListener() {}, requestAnimationFrameFn() {}, cancelAnimationFrameFn() {},
  } });
  feature.initMobileResize({ stopPropagation() {}, touches: [{ clientY: 100 }],
    target: { closest: () => ({ getBoundingClientRect: () => ({ height: 120 }) }) },
  }, task);
  feature.handleMobileResizeMove({ touches: [{ clientY: 126 }] });
  assert.equal(task.estDuration, '01:15:00');
});
