import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftDate,dateWeek,monthWindow,lunarLabel,formatLunarDateParts} from '../app/scripts/utils/mobile-calendar-dates.js';
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

const parts = day => [{type:'yearName',value:'丙午'},{type:'month',value:'九月'},{type:'day',value:day}];
test('numeric and localized Chinese lunar days produce identical labels for all 30 days',()=>{
  const days=['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
  days.forEach((label,index)=>assert.deepEqual(formatLunarDateParts(parts(label)),formatLunarDateParts(parts(String(index+1)))));
  for (const value of ['9','09','９','九','初九','初九日']) assert.equal(formatLunarDateParts(parts(value)).short,'初九');
  assert.equal(formatLunarDateParts(parts('二十一')).short,'廿一');
  assert.equal(formatLunarDateParts(parts('初一')).short,'九月');
  assert.equal(formatLunarDateParts([...parts('初一').filter(p=>p.type!=='month'),{type:'month',value:'闰六月'}]).full,'丙午年闰六月初一');
});
test('missing or invalid localized day never produces undefined, NaN or a false lunar date',()=>{
  for (const value of [undefined,'','unknown','NaN','0','31','1.5','-1']) assert.deepEqual(formatLunarDateParts(parts(value)),{short:'',full:''});
  assert.deepEqual(formatLunarDateParts([]),{short:'',full:''});
});
