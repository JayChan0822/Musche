import assert from 'node:assert/strict';
import test from 'node:test';

import { formatClock, normalizeClock, timeToMinutes } from '../app/scripts/utils/time.js';
import { registerScheduleDragDropFeature } from '../app/scripts/features/schedule-drag-drop.js';
import { registerMobileTouchEndFeature } from '../app/scripts/features/mobile-touch-end.js';

// 开始时间小于 10 点是这条链路的关键场景：以前月视图落点会写出 "9:00"，
// 与全仓补零的 "09:00" 不一致 → 字符串排序错位 + ICS 的 new Date(`${date}T9:00`) 变 Invalid。
const SETTINGS = { startHour: 9, endHour: 18 };

test('formatClock / normalizeClock 一律补零', () => {
  assert.equal(formatClock(9), '09:00');
  assert.equal(formatClock(9, 30), '09:30');
  assert.equal(formatClock(0, 0), '00:00');
  assert.equal(formatClock(23, 5), '23:05');

  assert.equal(normalizeClock('9:00'), '09:00');
  assert.equal(normalizeClock('09:30'), '09:30');
  assert.equal(normalizeClock(''), '');
});

test('桌面端拖到月视图格子：新任务的开始时间补零', () => {
  const scheduledTasks = { value: [] };
  const feature = registerScheduleDragDropFeature({
    refs: {
      scheduledTasks,
      pxPerMin: { value: 2 },
      sidebarTab: { value: 'musician' },
      currentSessionId: { value: 'S_DEFAULT' },
      isMobile: { value: false },
    },
    state: { settings: SETTINGS },
    utils: { formatSecs: (seconds) => `${seconds}s` },
    actions: {
      getDocument: () => ({ querySelectorAll: () => [] }),
      checkOverlap: () => false,
      getNow: () => 1,
      pushHistory: () => {},
    },
  });

  feature.dragStart(
    { altKey: false, target: null, dataTransfer: { effectAllowed: '' } },
    { id: 'POOL_1', musicianId: 'M1', estDuration: '00:30', ratio: 20 },
    'pool',
  );
  feature.dropToMonth({}, '2026-06-02');

  assert.equal(scheduledTasks.value.length, 1);
  assert.equal(scheduledTasks.value[0].startTime, '09:00');
});

test('手机端拖到月视图格子：新任务的开始时间同样补零', () => {
  const scheduledTasks = { value: [] };
  const dragState = {
    dragElClone: {},
    dragSourceTask: { id: 'POOL_1', musicianId: 'M1', estDuration: '00:30', ratio: 20 },
    dragSourceType: 'pool',
    activeDropSlot: null,
    dragSourceEl: null,
    longPressTimeout: null,
    monthSwitchTimer: null,
  };
  const monthCell = { dataset: { date: '2026-06-02' } };
  const feature = registerMobileTouchEndFeature({
    refs: {
      scheduledTasks,
      pxPerMin: { value: 2 },
      sidebarTab: { value: 'musician' },
      currentSessionId: { value: 'S_DEFAULT' },
      lastTapState: { id: null, time: 0 },
    },
    state: dragState,
    data: { getSettings: () => SETTINGS },
    utils: { formatSecs: (seconds) => `${seconds}s` },
    actions: {
      dateNow: () => 1,
      getDocumentBody: () => ({ removeChild: () => {} }),
      elementFromPoint: () => ({
        closest: (selector) => (selector === '[data-date]' ? monthCell : null),
      }),
      checkOverlap: () => false,
      pushHistory: () => {},
    },
  });

  feature.handleTouchEnd({ changedTouches: [{ clientX: 10, clientY: 10 }] });

  assert.equal(scheduledTasks.value.length, 1);
  assert.equal(scheduledTasks.value[0].startTime, '09:00');
});

test('补零后按字符串排序与按分钟排序一致（没补零时会错位）', () => {
  const times = ['10:00', formatClock(9)];
  const byString = [...times].sort((a, b) => a.localeCompare(b));
  const byMinutes = [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  assert.deepEqual(byString, ['09:00', '10:00']);
  assert.deepEqual(byMinutes, byString);

  // 反例存档：没补零的历史数据用字符串排会把 9 点排到 10 点后面，所以排序一律走 timeToMinutes
  assert.deepEqual(['10:00', '9:00'].sort((a, b) => a.localeCompare(b)), ['10:00', '9:00']);
});
