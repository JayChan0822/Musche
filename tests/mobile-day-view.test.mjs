import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reactive, ref } from 'vue';

import { registerMobileDayViewFeature } from '../app/scripts/features/mobile-day-view.js';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const NOW = new Date(2026, 7, 13, 10, 30); // 2026-08-13 周四 10:30

function setup({ tasksByDate = {}, now = NOW, viewDate = new Date(2026, 7, 1) } = {}) {
  const refs = {
    selectedDay: ref(''),
    dayViewOpen: ref(false),
    dayViewContainer: ref(null),
    viewDate: ref(viewDate),
    isMobile: ref(true),
    mobileTab: ref('schedule'),
    pxPerMin: ref(1), // slotHeight 30 → 1px/分钟
  };
  const timers = [];
  const feature = registerMobileDayViewFeature({
    refs,
    state: { settings: reactive({ startHour: 6, endHour: 24 }) },
    utils: { formatDate },
    actions: {
      getTasksForDate: (dateStr) => tasksByDate[dateStr] || [],
      getDate: () => new Date(now),
      setTimeoutFn: (callback) => { timers.push(callback); return timers.length; },
      requestAnimationFrameFn: (callback) => { callback(); return 0; },
      setIntervalFn: () => 1,
      clearIntervalFn: () => {},
    },
  });

  return { refs, feature, runTimers: () => { while (timers.length) timers.shift()(); } };
}

test('点日期打开日视图：记录选中日、置为打开态', () => {
  const { refs, feature } = setup();

  feature.openDayView('2026-08-13');

  assert.equal(refs.selectedDay.value, '2026-08-13');
  assert.equal(refs.dayViewOpen.value, true);
  assert.equal(feature.selectedDayLabel.value, '2026年8月13日 周四');
  assert.equal(feature.selectedDayMonthLabel.value, '8月');
});

test('顶部周日期条是选中日所在周的周日～周六，并标出今天与有日程的日子', () => {
  const { feature } = setup({ tasksByDate: { '2026-08-14': [{ scheduleId: 1, startTime: '09:00' }] } });

  feature.openDayView('2026-08-13');
  const week = feature.selectedDayWeek.value;

  assert.equal(week.length, 7);
  assert.deepEqual(week.map((d) => d.fullDate), [
    '2026-08-09', '2026-08-10', '2026-08-11', '2026-08-12',
    '2026-08-13', '2026-08-14', '2026-08-15',
  ]);
  assert.deepEqual(week.map((d) => d.weekday), ['日', '一', '二', '三', '四', '五', '六']);
  assert.deepEqual(week.filter((d) => d.isToday).map((d) => d.fullDate), ['2026-08-13']);
  assert.deepEqual(week.filter((d) => d.hasTasks).map((d) => d.fullDate), ['2026-08-14']);
});

test('日视图只列出当天的任务，切天后跟着换', () => {
  const { feature } = setup({
    tasksByDate: {
      '2026-08-13': [{ scheduleId: 1, startTime: '09:00' }],
      '2026-08-14': [{ scheduleId: 2, startTime: '11:00' }, { scheduleId: 3, startTime: '15:00' }],
    },
  });

  feature.openDayView('2026-08-13');
  assert.deepEqual(feature.selectedDayTasks.value.map((t) => t.scheduleId), [1]);

  feature.changeSelectedDay(1);
  assert.deepEqual(feature.selectedDayTasks.value.map((t) => t.scheduleId), [2, 3]);
});

test('翻天跨月正确，并按方向设置滑动动画', () => {
  const { refs, feature } = setup();

  feature.openDayView('2026-08-31');
  feature.changeSelectedDay(1);
  assert.equal(refs.selectedDay.value, '2026-09-01');
  assert.equal(feature.dayTransitionName.value, 'day-slide-next');

  feature.changeSelectedDay(-1);
  assert.equal(refs.selectedDay.value, '2026-08-31');
  assert.equal(feature.dayTransitionName.value, 'day-slide-prev');
});

test('打开时时间轴滚到当天第一个任务', () => {
  const { refs, feature, runTimers } = setup({
    tasksByDate: { '2026-08-13': [{ scheduleId: 1, startTime: '09:00' }] },
  });
  refs.dayViewContainer.value = { scrollTop: 0 };

  feature.openDayView('2026-08-13');
  runTimers();

  // 09:00 距起始 06:00 是 180 分钟 → 180px，再上留 80px
  assert.equal(refs.dayViewContainer.value.scrollTop, 100);
});

test('当天没有任务时，今天滚到当前时刻', () => {
  const { refs, feature, runTimers } = setup();
  refs.dayViewContainer.value = { scrollTop: 0 };

  feature.openDayView('2026-08-13');
  runTimers();

  // 10:30 距 06:00 是 270 分钟 → 270px，再上留 80px
  assert.equal(refs.dayViewContainer.value.scrollTop, 190);
});

test('当前时刻红线只在今天出现，且限定在设置的时段内', () => {
  const inHours = setup();
  inHours.feature.openDayView('2026-08-13');
  assert.deepEqual(inHours.feature.nowIndicatorStyle.value, { top: '270px' });

  inHours.feature.selectDay('2026-08-14');
  assert.equal(inHours.feature.nowIndicatorStyle.value, null);

  const beforeStart = setup({ now: new Date(2026, 7, 13, 2, 0) });
  beforeStart.feature.openDayView('2026-08-13');
  assert.equal(beforeStart.feature.nowIndicatorStyle.value, null);
});

test('横滑翻天：左滑下一天、右滑上一天', () => {
  const { refs, feature } = setup();
  feature.openDayView('2026-08-13');

  feature.dayViewTouchStart({ touches: [{ clientX: 300, clientY: 400 }], target: {} });
  feature.dayViewTouchEnd({ changedTouches: [{ clientX: 200, clientY: 410 }] });
  assert.equal(refs.selectedDay.value, '2026-08-14');

  feature.dayViewTouchStart({ touches: [{ clientX: 100, clientY: 400 }], target: {} });
  feature.dayViewTouchEnd({ changedTouches: [{ clientX: 220, clientY: 395 }] });
  assert.equal(refs.selectedDay.value, '2026-08-13');
});

test('顶部下拉关闭日视图，已滚动时下拉不关', () => {
  const { refs, feature } = setup();
  refs.dayViewContainer.value = { scrollTop: 0 };
  feature.openDayView('2026-08-13');

  feature.dayViewTouchStart({ touches: [{ clientX: 200, clientY: 200 }], target: {} });
  feature.dayViewTouchEnd({ changedTouches: [{ clientX: 205, clientY: 320 }] });
  assert.equal(refs.dayViewOpen.value, false);

  refs.dayViewContainer.value = { scrollTop: 240 };
  feature.openDayView('2026-08-13');
  feature.dayViewTouchStart({ touches: [{ clientX: 200, clientY: 200 }], target: {} });
  feature.dayViewTouchEnd({ changedTouches: [{ clientX: 205, clientY: 320 }] });
  assert.equal(refs.dayViewOpen.value, true);
});

test('任务块上的手势归拖拽处理，日视图不抢（不翻天也不关闭）', () => {
  const { refs, feature } = setup();
  refs.dayViewContainer.value = { scrollTop: 0 };
  feature.openDayView('2026-08-13');

  const taskTarget = { closest: (selector) => (selector === '.task-block' ? {} : null) };
  feature.dayViewTouchStart({ touches: [{ clientX: 300, clientY: 200 }], target: taskTarget });
  feature.dayViewTouchEnd({ changedTouches: [{ clientX: 150, clientY: 330 }] });

  assert.equal(refs.selectedDay.value, '2026-08-13');
  assert.equal(refs.dayViewOpen.value, true);
});

test('关闭时若在日视图里翻到了别的月，底下的月视图跟上', () => {
  const { refs, feature } = setup({ viewDate: new Date(2026, 7, 1) });

  feature.openDayView('2026-08-31');
  feature.changeSelectedDay(1);
  feature.closeDayView();

  assert.equal(refs.dayViewOpen.value, false);
  assert.equal(formatDate(refs.viewDate.value), '2026-09-01');
});

test('同月内关闭不动月视图的日期', () => {
  const viewDate = new Date(2026, 7, 1);
  const { refs, feature } = setup({ viewDate });

  feature.openDayView('2026-08-20');
  feature.closeDayView();

  assert.equal(refs.viewDate.value, viewDate);
});

// —— 任务跳转（搜索 / 统计卡片）在手机端落到日视图，而不是没有返回入口的周视图 ——
const { registerCalendarViewFeature } = await import('../app/scripts/features/calendar-view.js');

function createCalendarView({ isMobile }) {
  const openedDays = [];
  const refs = {
    currentView: ref('month'),
    // paged：避免 viewDate 变更触发 scrolled 模式的 scrollToMonthDate（会摸 document）
    monthViewMode: ref('paged'),
    viewDate: ref(new Date(2026, 7, 1)),
    visibleTopDate: ref(new Date(2026, 7, 1)),
    monthObserver: ref(null),
    monthRefs: ref([]),
    filteredScheduledTasks: ref([]),
    weekContainer: ref(null),
    pxPerMin: ref(1),
    isMobile: ref(isMobile),
    flashingTaskId: ref(null),
    mobileTab: ref('schedule'),
  };
  const feature = registerCalendarViewFeature({
    refs,
    state: { settings: reactive({ startHour: 10, endHour: 22 }) },
    utils: { formatDate, timeToMinutes: (time) => Number(String(time).split(':')[0]) * 60 },
    actions: {
      openMobileDayView: (dateStr) => openedDays.push(dateStr),
      setTimeoutFn: () => 0,
      getDate: () => new Date(NOW),
    },
  });
  return { feature, refs, openedDays };
}

test('手机端跳转任务：打开当天日视图，不切周视图', () => {
  const { feature, refs, openedDays } = createCalendarView({ isMobile: true });

  feature.smartScrollToTask({ scheduleId: 'S-1', date: '2026-09-10', startTime: '11:00' });

  assert.deepEqual(openedDays, ['2026-09-10']);
  assert.equal(refs.currentView.value, 'month', '手机端不再切到周视图');
  assert.equal(formatDate(refs.viewDate.value), '2026-09-10', '底下的月视图跟到目标日期');
  assert.equal(refs.flashingTaskId.value, 'S-1', '目标任务照常高亮');
});

test('桌面端跳转任务：仍然切到周视图', () => {
  const { feature, refs, openedDays } = createCalendarView({ isMobile: false });

  feature.smartScrollToTask({ scheduleId: 'S-1', date: '2026-09-10', startTime: '11:00' });

  assert.deepEqual(openedDays, [], '桌面端不开日视图');
  assert.equal(refs.currentView.value, 'week');
});
