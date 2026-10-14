import test from 'node:test';
import assert from 'node:assert/strict';
import {weekStripGeometry} from '../app/scripts/utils/calendar-week-motion.js';
const screenX=g=>g.trackOffset+g.selectionLeft;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('within a week selection follows fractional day progress, keeping date labels stationary',()=>{
  const start=weekStripGeometry(3,0,402), half=weekStripGeometry(3,.5,402);
  close(half.trackOffset,start.trackOffset); close(screenX(half)-screenX(start),402/14);
  close(screenX(weekStripGeometry(3,-.5,402))-screenX(start),-402/14);
});
test('cross-week commits have identical screen geometry in both directions and viewport widths',()=>{
  for(const width of [320,390,402,430]) {
    close(screenX(weekStripGeometry(6,1,width)),screenX(weekStripGeometry(0,0,width)));
    close(screenX(weekStripGeometry(0,-1,width)),screenX(weekStripGeometry(6,0,width)));
    close(weekStripGeometry(6,.5,width).trackOffset,-1.5*width);
    close(weekStripGeometry(0,-.5,width).trackOffset,-.5*width);
  }
});
test('reverse/cancel simply retraces the same geometry without direction-dependent state',()=>{
  for(const weekday of [0,3,6]) {
    const forward=[0,.2,.5,.8,1].map(p=>weekStripGeometry(weekday,p,402));
    const reverse=[1,.8,.5,.2,0].map(p=>weekStripGeometry(weekday,p,402)).reverse();
    assert.deepEqual(forward,reverse);
  }
});
