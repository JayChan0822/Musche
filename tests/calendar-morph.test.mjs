import assert from 'node:assert/strict';
import test from 'node:test';
import { calendarWeekDates, monthWeekRect, revealFrames, createCalendarMorph } from '../app/scripts/features/calendar-morph.js';

test('the shared week stays Sunday-to-Saturday across the year boundary', () => {
  assert.deepEqual(calendarWeekDates(new Date(2026, 0, 1)), [
    '2025-12-28', '2025-12-29', '2025-12-30', '2025-12-31',
    '2026-01-01', '2026-01-02', '2026-01-03',
  ]);
});

test('the aperture is measured from the real month row and clipped to the viewport', () => {
  const viewport = { left: 100, top: 200, right: 900, bottom: 800, width: 800, height: 600 };
  const rect = monthWeekRect({ left: 60, top: 400, right: 940, bottom: 590 }, viewport);
  assert.deepEqual(rect, { top: 200, right: 0, bottom: 210, left: 0 });
  assert.equal(revealFrames(rect)[0].clipPath, 'inset(200px 0px 210px 0px)');
  assert.equal(revealFrames(rect)[1].clipPath, 'inset(0px 0px 0px 0px)');
});

function harness({ reduced = false, missingRow = false } = {}) {
  const animations = [];
  const viewport = { left: 0, top: 100, right: 840, bottom: 820, width: 840, height: 720 };
  const root = { getBoundingClientRect: () => viewport, appendChild() {} };
  const date = new Date(2026, 8, 29);
  const days = calendarWeekDates(date);
  const makePanel = mode => ({
    dataset: { calendarView: mode },
    parentElement: root,
    style: {}, inert: false,
    classList: { add() {}, remove() {} },
    getBoundingClientRect: () => viewport,
    querySelectorAll(selector) {
      if (selector !== '[data-calendar-task]') return [];
      return [];
    },
    cloneNode() { return { removeAttribute() {}, style: {}, className: '' }; },
    querySelector(selector) {
      if (mode !== 'month' || missingRow) return null;
      const index = days.findIndex(day => selector.includes(day));
      if (index < 0) return null;
      return { getBoundingClientRect: () => ({ left: index * 120, top: 380, right: (index + 1) * 120, bottom: 560 }) };
    },
    animate(frames, options) {
      let resolve;
      const animation = {
        target: this, frames, options,
        finished: new Promise(r => { resolve = r; }),
        cancel() { this.cancelled = true; resolve(); },
        finish() { resolve(); },
      };
      animations.push(animation);
      return animation;
    },
  });
  let positioned = 0;
  const transition = createCalendarMorph({
    getDate: () => date,
    getWindow: () => ({ matchMedia: () => ({ matches: reduced }) }),
    afterRender: async () => {},
    prepareMonth: async () => { positioned++; },
  });
  return { transition, makePanel, animations, get positioned() { return positioned; } };
}

for (const destination of ['week', 'month']) {
  test(`${destination} animates the real week viewport without fake tiles or opacity fades`, async () => {
    const h = harness();
    const from = h.makePanel(destination === 'week' ? 'month' : 'week');
    const to = h.makePanel(destination);
    let leaves = 0, enters = 0;
    h.transition.leave(from, () => leaves++);
    h.transition.beforeEnter(to);
    await h.transition.enter(to, () => enters++);

    assert.equal(h.animations.length, 1);
    const animation = h.animations[0];
    assert.equal(animation.target, destination === 'week' ? to : from);
    assert.deepEqual(animation.frames, destination === 'week'
      ? [{ clipPath: 'inset(280px 0px 260px 0px)' }, { clipPath: 'inset(0px 0px 0px 0px)' }]
      : [{ clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: 'inset(280px 0px 260px 0px)' }]);
    assert.equal(to.style.opacity, undefined);
    assert.equal(from.style.opacity, undefined);
    assert.equal(to.style.visibility, '');
    assert.equal(from.style.visibility, undefined);
    assert.equal(leaves, 0);
    assert.equal(enters, 0);
    animation.finish();
    await Promise.resolve();
    assert.equal(leaves, 1);
    assert.equal(enters, 1);
    assert.equal(from.style.clipPath, '');
    assert.equal(to.style.clipPath, '');
    assert.equal(to.inert, false);
    assert.equal(h.positioned, destination === 'month' ? 1 : 0);
  });
}

test('reduced motion and missing row complete immediately', async () => {
  for (const options of [{ reduced: true }, { missingRow: true }]) {
    const h = harness(options);
    const from = h.makePanel('month'), to = h.makePanel('week');
    let completed = 0;
    h.transition.leave(from, () => completed++);
    h.transition.beforeEnter(to);
    await h.transition.enter(to, () => completed++);
    assert.equal(completed, 2);
    assert.equal(h.animations.length, 0);
  }
});

test('cancelling a transition removes the clip and completes both hooks once', async () => {
  const h = harness();
  const from = h.makePanel('month'), to = h.makePanel('week');
  let completed = 0;
  h.transition.leave(from, () => completed++);
  h.transition.beforeEnter(to);
  await h.transition.enter(to, () => completed++);
  h.transition.cancel();
  h.transition.cancel();
  assert.equal(completed, 2);
  assert.equal(h.animations[0].cancelled, true);
  assert.equal(to.style.clipPath, '');
});
