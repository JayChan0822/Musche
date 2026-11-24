import test from 'node:test';
import assert from 'node:assert/strict';
import { DESKTOP_SPRING, pageSpringSpec } from '../app/scripts/utils/desktop-spring-transition.js';
import { stepSpring } from '../app/scripts/utils/calendar-spring.js';

test('desktop spring overshoots gently and settles within its CSS sampling window', () => {
 const samples = Array.from({length:121}, (_, i) => stepSpring({position:0,velocity:0,target:1}, i/120, DESKTOP_SPRING));
 const peak = Math.max(...samples.map(s => s.position));
 assert.ok(peak > 1.02 && peak < 1.07, `overshoot ${peak}`);
 assert.ok(Math.abs(samples[72].position-1)<.001);
});

test('page transforms preserve direction and keep positioning fades stationary', () => {
 for (const name of ['week-slide-next', 'slide-next', 'week-slide-prev', 'slide-prev', 'jump-fade']) {
  const { enter, exit, spring } = pageSpringSpec(name);
  const swipe = name.includes('fade') ? 0 : name.includes('prev') ? 1 : -1;
  assert.equal(Math.sign(-enter) || 0, swipe);
  assert.equal(Math.sign(exit) || 0, swipe);
  const samples = Array.from({length:31}, (_, i) => stepSpring({position:enter,velocity:0,target:0}, i/60, spring));
  assert.ok(samples.every(({ velocity }) => velocity * swipe >= 0), name);
 }
});
