import assert from 'node:assert/strict';
import test from 'node:test';
import { nextTick, ref } from 'vue';
import { registerCalendarViewFeature } from '../app/scripts/features/calendar-view.js';

function setup(scroller, fonts) {
  return registerCalendarViewFeature({
    refs: {
      currentView: ref('month'), monthViewMode: ref('scrolled'),
      viewDate: ref(new Date(2026, 8, 29)), visibleTopDate: ref(null),
      monthObserver: ref(null), monthRefs: ref([]), filteredScheduledTasks: ref([]),
      weekContainer: ref(null), pxPerMin: ref(1), isMobile: ref(false),
    },
    state: { settings: { startHour: 10, endHour: 22 } },
    utils: { formatDate: d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, timeToMinutes: () => 0 },
    actions: { getDocument: () => ({ querySelector: () => scroller, fonts }) },
  });
}

test('startup date scroll centers today at the upper golden section after Vue renders', async () => {
  const calls = [];
  const scroller = { clientHeight: 1034, scrollTo: options => calls.push(options), querySelector: selector => selector === '[data-calendar-weekdays]' ? { offsetHeight: 34 } : cell };
  const cell = { offsetTop: 5800, offsetHeight: 192, offsetParent: scroller };
  const feature = setup(scroller);
  feature.scrollToMonthDate(new Date(2026, 8, 29));
  assert.equal(calls.length, 0);
  await nextTick();
  assert.deepEqual(calls, [{ top: 5480, behavior: 'auto' }]);
  feature.scrollToMonthDate(new Date(2026, 9, 1), { smooth: true });
  await nextTick();
  assert.equal(calls[1].behavior, 'smooth');
});

test('initial positioning waits for fonts to settle the calendar viewport height', async () => {
  let finishFonts;
  const calls = [];
  const fonts = { status: 'loading', ready: new Promise(resolve => { finishFonts = resolve; }) };
  const scroller = { clientHeight: 500, scrollTo: options => calls.push(options), querySelector: selector => selector === '[data-calendar-weekdays]' ? { offsetHeight: 34 } : cell };
  const cell = { offsetTop: 5800, offsetHeight: 192, offsetParent: scroller };
  const feature = setup(scroller, fonts);
  feature.scrollToMonthDate(new Date(2026, 8, 29));
  await nextTick();
  assert.equal(calls.length, 0);
  scroller.clientHeight = 1034;
  finishFonts();
  await nextTick();
  assert.deepEqual(calls, [{ top: 5480, behavior: 'auto' }]);
});

test('month-end startup keeps the target month even when most visible cells are next month', () => {
  let cells = [];
  const scroller = { scrollTop: 1000, scrollHeight: 10000, clientHeight: 600, querySelectorAll: () => cells, querySelector: () => ({ offsetHeight: 34 }) };
  const cell = (date, top) => ({ offsetTop: top, offsetHeight: 192, getAttribute: name => name === 'data-month-key' ? date.slice(0,7) : date });
  cells = [cell('2026-09-20',1034),cell('2026-09-27',1226),cell('2026-09-29',1226),cell('2026-10-01',1226),...Array.from({length:21},(_,i)=>cell(`2026-10-${String(i+4).padStart(2,'0')}`,1418+Math.floor(i/7)*192))];
  const feature = setup(scroller);
  feature.handleInfiniteScroll({ target: scroller });
  assert.equal(feature.currentDateLabel.value,'2026年 9月');
  scroller.scrollTop = 1192;
  feature.handleInfiniteScroll({ target: scroller });
  assert.equal(feature.currentDateLabel.value,'2026年 10月');
});
