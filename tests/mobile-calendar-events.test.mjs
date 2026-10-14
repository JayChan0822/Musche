import test from 'node:test';
import assert from 'node:assert/strict';
import { ref } from 'vue';
import { registerMobileCalendarEvents } from '../app/scripts/features/mobile-calendar-events.js';
import { registerScheduleFeature } from '../app/scripts/features/schedule.js';
import { serializeWorkflowContent } from '../app/scripts/utils/workflow-migration.js';
const draft = {title:'排练', date:'2026-10-14', startTime:'10:00', endTime:'11:30', notes:'琴房', allDay:false};
function setup(tasks = [], checkOverlap = () => false) {
  const refs = { scheduledTasks:ref(tasks), currentSessionId:ref('S_DEFAULT'), itemPool:ref([]), sidebarTab:ref('project') };
  const history=[];
  const api=registerMobileCalendarEvents({refs,actions:{checkOverlap,createId:()=> 'C1',pushHistory:()=> history.push(JSON.stringify(refs.scheduledTasks.value))}});
  return {refs,history,...api};
}
test('create commits once into persisted schedules; isolated draft cancellation has no side effects', () => {
  const f=setup(); const pending={...draft}; pending.title='未保存';
  assert.equal(f.refs.scheduledTasks.value.length,0); assert.equal(f.history.length,0);
  const result=f.commitCalendarEvent(null,draft);
  assert.equal(result.ok,true); assert.equal(f.history.length,1); assert.equal(f.history[0],'[]');
  assert.equal(result.task.isCalendarEvent,true); assert.equal(result.task.calendarTitle,'排练');
  assert.equal(result.task.estDuration,'01:30:00'); assert.equal(result.task.sessionId,'S_DEFAULT');
  const content=serializeWorkflowContent({},[],f.refs.scheduledTasks.value);
  assert.equal(content.tasks[0].calendarTitle,'排练'); assert.equal(content.tasks[0].notes,'琴房');
  assert.equal(content.tasks[0].isCalendarEvent,true);
});
test('editing work task retains identity, business records and computes ratio', () => {
  const f=setup([{scheduleId:'W',date:draft.date,startTime:'09:00',estDuration:'01:00:00',musicDuration:'00:10:00',ratio:'6.0',stage:'edit',editorId:'E',templateId:'T',recordingInfo:{notes:'preserve'},custom:{data:1}}]);
  const task=f.refs.scheduledTasks.value[0]; const recording=task.recordingInfo;
  const r=f.commitCalendarEvent(task,draft);
  assert.equal(r.ok,true); assert.equal(r.task,task); assert.equal(task.ratio,'9.0');
  assert.equal(task.templateId,'T'); assert.equal(task.editorId,'E'); assert.equal(task.recordingInfo,recording);
  assert.equal(task.calendarTitle,undefined); assert.equal(task.notes,undefined);
  assert.equal(f.history.length,1); assert.equal(f.deleteCalendarEvent(task).ok,false);
  assert.equal(f.commitCalendarEvent(task,{...draft,allDay:true}).ok,false);
  assert.equal(f.history.length,1);
});
test('conflict, invalid dates/times and foreign sessions never mutate or save history', () => {
  const f=setup([],()=>true);
  assert.equal(f.commitCalendarEvent(null,draft).ok,false); assert.equal(f.history.length,0);
  const g=setup();
  for (const patch of [{date:'2026-02-30'},{date:'2026-13-01'},{startTime:'24:00'},{endTime:'24:01'},{endTime:'09:00'},{startTime:'9:00'},{title:'  '}]) assert.equal(g.commitCalendarEvent(null,{...draft,...patch}).ok,false);
  assert.equal(g.history.length,0); assert.equal(g.refs.scheduledTasks.value.length,0);
  const h=setup([{scheduleId:'F',sessionId:'OTHER',isCalendarEvent:true}]);
  assert.equal(h.commitCalendarEvent(h.refs.scheduledTasks.value[0],draft).ok,false);
  assert.equal(h.deleteCalendarEvent(h.refs.scheduledTasks.value[0]).ok,false); assert.equal(h.history.length,0);
});
test('all-day and midnight end use the existing duration representation; free deletion is explicit', () => {
  const f=setup(); let r=f.commitCalendarEvent(null,{...draft,allDay:true});
  assert.equal(r.task.startTime,'00:00'); assert.equal(r.task.estDuration,'24:00:00');
  r=f.commitCalendarEvent(r.task,{...draft,startTime:'23:30',endTime:'24:00'});
  assert.equal(r.task.estDuration,'00:30:00'); assert.equal(r.task.allDay,false);
  assert.equal(f.deleteCalendarEvent(r.task).ok,true); assert.equal(f.refs.scheduledTasks.value.length,0); assert.equal(f.history.length,3);
});
test('conflicts use current work stage/resources and do not ignore current task exclusion', () => {
  const work={scheduleId:'W',stage:'edit',editorId:'E',date:draft.date,startTime:'10:00',estDuration:'01:00:00'};
  const f=setup([work]);
  const parseTime=s=>s.split(':').map(Number).reduce((a,b)=>a*60+b,0);
  const schedule=registerScheduleFeature({refs:f.refs,state:{settings:{}},utils:{parseTime,timeToMinutes:s=>parseTime(s)},actions:{}});
  const api=registerMobileCalendarEvents({refs:f.refs,actions:{checkOverlap:schedule.checkOverlap,pushHistory:()=>f.history.push('h')}});
  assert.equal(api.commitCalendarEvent(f.refs.scheduledTasks.value[0],draft).ok,true);
  f.refs.scheduledTasks.value.push({...work,scheduleId:'W2'});
  assert.equal(api.commitCalendarEvent(f.refs.scheduledTasks.value[0],{...draft,endTime:'12:00'}).ok,false);
  f.refs.scheduledTasks.value[1].sessionId='OTHER';
  assert.equal(api.commitCalendarEvent(f.refs.scheduledTasks.value[0],{...draft,endTime:'12:00'}).ok,true);
});
for (const settings of [{},{workflow:{version:11,allocations:[],workLogs:[]}}]) test(`cleanup preserves calendar events for workflow ${settings.workflow?.version || 'legacy'}`, () => {
  const free={scheduleId:'C',isCalendarEvent:true,calendarTitle:'日历',stage:'rec',date:draft.date,startTime:'10:00'};
  const f=setup([free,{scheduleId:'EMPTY',stage:'rec',date:draft.date,startTime:'11:00'}]);
  const schedule=registerScheduleFeature({refs:f.refs,state:{settings},utils:{},actions:{}});
  schedule.cleanupEmptySchedules();
  assert.deepEqual(f.refs.scheduledTasks.value.map(t=>t.scheduleId),['C']);
  assert.equal(schedule.getBlockTitle(free),'日历'); assert.equal(schedule.isTaskGhost(free),false);
});

test('calendar titles and notes are searchable without joining unrelated work sections', async () => {
  const { registerSearchFeature } = await import('../app/scripts/features/search.js');
  const f=setup([{scheduleId:'C',isCalendarEvent:true,calendarTitle:'排练',notes:'琴房',date:draft.date,startTime:'10:00'}]);
  const refs={...f.refs, globalSearchQuery:ref('琴房'), currentSearchIndex:ref(0),showTrackList:ref(false),trackListSearchQuery:ref('')};
  const search=registerSearchFeature({refs,actions:{},utils:{},state:{sidebarTab:ref('musician'),musicianStats:ref([]),settings:{}}});
  assert.equal(search.filteredScheduledTasks.value.length,1);
  refs.globalSearchQuery.value='排练'; assert.equal(search.filteredScheduledTasks.value.length,1);
  refs.globalSearchQuery.value='不存在'; assert.equal(search.filteredScheduledTasks.value.length,0);
  refs.globalSearchQuery.value='完成'; assert.equal(search.filteredScheduledTasks.value.length,0);
});
