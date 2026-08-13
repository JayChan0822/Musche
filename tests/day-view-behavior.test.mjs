import assert from 'node:assert/strict';
import test from 'node:test';

import { ref, computed } from 'vue';

import { registerCalendarViewFeature } from '../app/scripts/features/calendar-view.js';

const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function createFeature() {
  const refs = {
    currentView: ref('month'),
    monthViewMode: ref('scrolled'),
    viewDate: ref(new Date(2026, 7, 13)),
    visibleTopDate: ref(new Date(2026, 7, 13)),
    monthObserver: ref(null),
    monthRefs: ref([]),
    filteredScheduledTasks: ref([]),
    weekContainer: ref(null),
    pxPerMin: ref(2),
    isMobile: ref(true),
    flashingTaskId: ref(null),
    mobileTab: ref('schedule'),
    selectedDay: ref(''),
    dayViewOpen: ref(false),
  };
  const state = { settings: { startHour: 9, endHour: 18 } };
  const utils = { formatDate, timeToMinutes: (t) => parseInt(t.split(':')[0], 10) * 60 + parseInt(t.split(':')[1], 10) };
  const actions = { switchView: () => {}, setViewTransitionName: () => {}, getNow: () => Date.now(), getDate: () => new Date(), setTimeoutFn: setTimeout };

  const feature = registerCalendarViewFeature({ refs, state, utils, actions });
  return { feature, refs };
}

test('openDayView sets the selected day and opens the sheet', () => {
  const { feature, refs } = createFeature();
  feature.openDayView('2026-08-15');
  assert.equal(refs.selectedDay.value, '2026-08-15', 'openDayView should select the tapped date');
  assert.equal(refs.dayViewOpen.value, true, 'openDayView should open the day sheet');
});

test('closeDayView closes the sheet', () => {
  const { feature, refs } = createFeature();
  feature.openDayView('2026-08-15');
  feature.closeDayView();
  assert.equal(refs.dayViewOpen.value, false, 'closeDayView should close the day sheet');
});

test('changeSelectedDay pages ±1 day', () => {
  const { feature, refs } = createFeature();
  feature.openDayView('2026-08-31');
  feature.changeSelectedDay(1);
  assert.equal(refs.selectedDay.value, '2026-09-01', 'changeSelectedDay(+1) should roll into the next month');
  feature.changeSelectedDay(-1);
  assert.equal(refs.selectedDay.value, '2026-08-31', 'changeSelectedDay(-1) should roll back');
});

test('selectedDayWeek spans Sunday to Saturday around the selected day', () => {
  const { feature } = createFeature();
  feature.openDayView('2026-08-13'); // Thursday
  const week = feature.selectedDayWeek.value;
  assert.equal(week.length, 7, 'selectedDayWeek should have 7 days');
  assert.equal(week[0].fullDate, '2026-08-09', 'week should start on Sunday');
  assert.equal(week[6].fullDate, '2026-08-15', 'week should end on Saturday');
});

test('selectedDayLabel renders 月日 周X', () => {
  const { feature } = createFeature();
  feature.openDayView('2026-08-13');
  assert.equal(feature.selectedDayLabel.value, '8月13日 周四', 'selectedDayLabel should render the Chinese label');
});

test('selectedDayTasks resolves from the day map', () => {
  const { feature } = createFeature();
  feature.openDayView('2026-08-13');
  assert.deepEqual(feature.selectedDayTasks.value, [], 'selectedDayTasks should be empty for a day without tasks');
});

test('pull-down gesture beyond 80px closes the day view', () => {
  const { feature, refs } = createFeature();
  feature.openDayView('2026-08-13');
  feature.dayViewTouchStart({ touches: [{ clientY: 200 }] });
  feature.dayViewTouchEnd({ changedTouches: [{ clientY: 320 }] });
  assert.equal(refs.dayViewOpen.value, false, 'pull-down > 80px should close the day sheet');
});

test('pull-down gesture under threshold keeps the day view open', () => {
  const { feature, refs } = createFeature();
  feature.openDayView('2026-08-13');
  feature.dayViewTouchStart({ touches: [{ clientY: 200 }] });
  feature.dayViewTouchEnd({ changedTouches: [{ clientY: 240 }] });
  assert.equal(refs.dayViewOpen.value, true, 'pull-down <= 80px should keep the day sheet open');
});
