import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CALENDAR_SPRINGS, createCalendarSpring, stepSpring } from '../app/scripts/utils/calendar-spring.js';

const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
function clock(options = {}) {
  let time = 0;
  let id = 0;
  const pending = new Map();
  const updates = [];
  const completions = [];
  const spring = createCalendarSpring({
    now: () => time,
    raf: (callback) => { pending.set(++id, callback); return id; },
    cancelRaf: (key) => pending.delete(key),
    reducedMotion: false,
    onUpdate: (position) => updates.push(position),
    onComplete: (state) => completions.push(state),
    ...options,
  });
  return { spring, pending, updates, completions, advance(ms) {
    time += ms;
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((callback) => callback(time));
  } };
}

test('analytic spring is frame-rate independent in under, critical and over damping', () => {
  for (const damping of [18, 20, 35]) {
    const config = { stiffness: 100, damping, mass: 1 };
    const initial = { position: 137, velocity: -92, target: -43 };
    const expected = stepSpring(initial, 0.75, config);
    for (const rate of [60, 120]) {
      let state = initial;
      for (let frame = 0; frame < rate * 0.75; frame++) state = stepSpring(state, 1 / rate, config);
      close(state.position, expected.position);
      close(state.velocity, expected.velocity);
    }
  }
});

test('presets settle after a long background interval without overflow', () => {
  for (const config of [...Object.values(CALENDAR_SPRINGS), { stiffness: 100, damping: 2000, mass: 1 }]) {
    const state = stepSpring({ position: 0, velocity: 1000, target: 1 }, 86400, config);
    close(state.position, 1);
    close(state.velocity, 0);
  }
});

test('reversal preserves current position and momentum; replacement cancels the stale frame', () => {
  const c = clock();
  c.spring.animateTo(100);
  c.advance(50);
  const { position, velocity } = c.spring.snapshot();
  const stale = [...c.pending.values()][0];
  c.spring.animateTo(-100);
  assert.equal(c.spring.position, position);
  assert.equal(c.spring.velocity, velocity);
  const count = c.updates.length;
  stale();
  assert.equal(c.updates.length, count);
  c.advance(10);
  assert.ok(c.spring.velocity < velocity);
  assert.equal(c.pending.size, 1);
  c.advance(10000);
  assert.equal(c.spring.position, -100);
  assert.equal(c.completions.length, 1);
  assert.equal(c.pending.size, 0);
});

test('stop keeps momentum for gesture takeover; jump and explicit release velocity are supported', () => {
  const c = clock();
  c.spring.animateTo(100);
  c.advance(40);
  const state = c.spring.snapshot();
  const stopped = c.spring.stop();
  assert.equal(stopped.position, state.position);
  assert.equal(stopped.velocity, state.velocity);
  assert.equal(c.pending.size, 0);
  c.spring.jump(30, -15);
  c.spring.animateTo(0);
  assert.equal(c.spring.velocity, -15);
  c.spring.animateTo(100, 400);
  assert.equal(c.spring.velocity, 400);
});

test('dispose prevents stale callbacks, new work and completion notifications', () => {
  const c = clock();
  c.spring.animateTo(100);
  const stale = [...c.pending.values()][0];
  c.spring.dispose();
  stale();
  c.spring.animateTo(20);
  c.spring.jump(5);
  assert.equal(c.spring.position, 0);
  assert.equal(c.pending.size, 0);
  assert.equal(c.updates.length, 0);
  assert.equal(c.completions.length, 0);
});

test('reduced motion settles synchronously and can change during a spring', () => {
  let reduced = false;
  const c = clock({ reducedMotion: () => reduced });
  c.spring.animateTo(100);
  reduced = true;
  c.advance(16);
  assert.equal(c.spring.position, 100);
  assert.equal(c.completions.length, 1);
  c.spring.animateTo(0);
  assert.equal(c.spring.position, 0);
  assert.equal(c.completions.length, 2);
  assert.equal(c.pending.size, 0);
});

test('completion thresholds honor both displacement and velocity, for pixels or progress', () => {
  const c = clock({ positionThreshold: 0.15, velocityThreshold: 1 });
  c.spring.jump(0.1, 30);
  c.spring.animateTo(0);
  c.advance(1);
  assert.equal(c.spring.active, true);
  for (let index = 0; index < 240 && c.spring.active; index++) c.advance(1000 / 120);
  assert.equal(c.spring.active, false);
  assert.equal(c.spring.position, 0);
  assert.equal(c.spring.velocity, 0);
  assert.equal(c.completions.length, 1);
});

test('callbacks may replace or dispose a spring without scheduling duplicate work', () => {
  let spring;
  let replace = false;
  const c = clock({ onUpdate: () => { if (replace) { replace = false; spring.animateTo(-10); } } });
  spring = c.spring;
  spring.animateTo(10);
  replace = true;
  c.advance(16);
  assert.equal(c.pending.size, 1);
  assert.equal(spring.target, -10);
  const d = clock({ onUpdate: () => d.spring.dispose() });
  d.spring.animateTo(20);
  d.advance(10000);
  assert.equal(d.completions.length, 0);
  assert.equal(d.pending.size, 0);
});

test('invalid physics and nonfinite input fail explicitly', () => {
  assert.throws(() => createCalendarSpring({ config: { mass: 0 } }), RangeError);
  assert.throws(() => createCalendarSpring({ positionThreshold: 0 }), RangeError);
  assert.throws(() => stepSpring({ position: 0, velocity: 0, target: 1 }, -1), RangeError);
  assert.throws(() => clock().spring.animateTo(NaN), RangeError);
});
