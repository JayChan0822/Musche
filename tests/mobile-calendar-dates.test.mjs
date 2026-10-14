import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftDate,dateWeek,monthWindow,lunarLabel} from '../app/scripts/utils/mobile-calendar-dates.js';
test('month window crosses year boundaries without repeating adjacent month dates',()=>{
  const months=monthWindow(new Date(2026,0,31),1);
  assert.deepEqual(months.map(m=>m.key),['2025-12','2026-01','2026-02']);
  const keys=months.flatMap(m=>m.days.filter(Boolean).map(d=>d.key));
  assert.equal(new Set(keys).size,keys.length);
  assert.equal(monthWindow(new Date(2024,1,1),0)[0].days.filter(Boolean).length,29);
  assert.deepEqual(dateWeek('2027-01-01').map(d=>d.key),['2026-12-27','2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02']);
});
test('calendar date paging does not skip or duplicate days at DST boundaries',()=>{
  const previous=process.env.TZ; process.env.TZ='America/New_York';
  try { for(const key of ['2026-03-08','2026-11-01','2024-02-29']) assert.equal(shiftDate(shiftDate(key,1),-1),key); }
  finally { if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous; }
});
test('lunar title includes cyclical year and month while date cells stay compact',()=>{
  assert.equal(lunarLabel('2026-09-28'),'十八');
  assert.equal(lunarLabel('2026-09-28',true),'丙午年八月十八');
});
