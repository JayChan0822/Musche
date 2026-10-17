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
 assert.match(pageSpringSpec('week-slide-next').transform(1), /100%/);
 assert.match(pageSpringSpec('slide-prev').transform(1), /-100%/);
 assert.equal(pageSpringSpec('jump-fade').transform(.5), 'none');
});
