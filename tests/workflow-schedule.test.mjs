import test from 'node:test';
import assert from 'node:assert/strict';
import { ref } from 'vue';
import { scheduleContext, scheduleIdentity, scheduleMatches } from '../app/scripts/utils/schedule-context.js';
import { registerScheduleFeature } from '../app/scripts/features/schedule.js';
import { registerScheduleDeletionFeature } from '../app/scripts/features/schedule-deletion.js';
const parseTime = (s) => s.split(':').map(Number).reduce((a,b) => a * 60 + b, 0);
const mins = (s) => parseTime(s);

test('explicit stage beats task project membership and EDIT aggregates belong to editor', () => {
  const rec = scheduleIdentity({id:'T',projectId:'P',musicianId:'M',editorId:'E'}, 'pool', 'musician');
  const edit = scheduleIdentity({id:'T',projectId:'P',musicianId:'M',editorId:'E'}, 'pool', 'project');
  assert.equal(rec.stage,'rec'); assert.equal(rec.musicianId,'M'); assert.equal(rec.editorId,'');
  assert.equal(edit.stage,'edit'); assert.equal(edit.editorId,'E'); assert.equal(edit.musicianId,'');
  assert.equal(scheduleMatches(rec,edit),false);
  assert.deepEqual(scheduleIdentity({id:'E'},'aggregate','project'), {stage:'edit',editorId:'E',musicianId:'',projectId:''});
  assert.equal(scheduleContext({projectId:'P'}).legacyProject,true);
});

test('conflicts block simultaneous schedules in the same stage and shared resources across stages', () => {
  const task = { scheduleId:'A', stage:'rec', musicianId:'M', projectId:'P', date:'2026-09-28', startTime:'10:00', estDuration:'01:00:00' };
  const refs = { scheduledTasks: ref([task]), itemPool:ref([]), currentSessionId:ref('S_DEFAULT'), sidebarTab:ref('musician') };
  const f = registerScheduleFeature({refs,state:{settings:{}},utils:{parseTime,timeToMinutes:mins},actions:{}});
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00',null,'project',{stage:'edit',editorId:'M'}),true);
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00',null,'musician',{stage:'rec',musicianId:'N'}),true);
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00',null,'musician',{stage:'rec'}),true);
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00',null,'project',{stage:'edit',editorId:'N'}),false);
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00','A','musician',task),false);
  assert.equal(f.checkOverlap('2026-09-29','10:15','00:30:00',null,'musician',{stage:'rec',musicianId:'N'}),false);
  assert.equal(f.checkOverlap(task.date,'11:00','00:30:00',null,'project',{stage:'edit',editorId:'M'}),false);
  task.studioId='Studio'; refs.scheduledTasks.value=[task];
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00',null,'musician',{stage:'rec',musicianId:'N',studioId:'Studio'}),true);
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00',null,'project',{stage:'edit',editorId:'N',studioId:'Studio'}),true);
  refs.currentSessionId.value='OTHER';
  assert.equal(f.checkOverlap(task.date,'10:15','00:30:00',null,'musician',{stage:'rec',musicianId:'N'}),false);
});

test('deleting EDIT individual allocation clears only EDIT recording', () => {
  const item = {id:'T',musicianId:'M',editorId:'E',projectId:'P',records:{musician:{actualDuration:'01:00:00'},project:{actualDuration:'00:30:00'}}};
  const refs = {itemPool:ref([item]),sidebarTab:ref('musician')};
  const f = registerScheduleDeletionFeature({refs,state:{},actions:{autoUpdateEfficiency(){}}});
  f.clearPoolRecord('T',{stage:'edit',templateId:'T',editorId:'E'});
  assert.equal(refs.itemPool.value[0].records.musician.actualDuration,'01:00:00');
  assert.equal(refs.itemPool.value[0].records.project.actualDuration,'');
});

test('removing a calendar block preserves actual work in both stages', () => {
  const item = {id:'T',musicianId:'M',editorId:'E',workflowStatus:{rec:'in-progress',edit:'in-progress'},records:{musician:{actualDuration:'01:00:00'},project:{actualDuration:'00:30:00'}}};
  const task={scheduleId:'B',templateId:'T',stage:'edit',editorId:'E'};
  const refs={itemPool:ref([item]),scheduledTasks:ref([task]),currentSessionId:ref('S_DEFAULT'),sidebarTab:ref('project'),trackListData:ref({taskRef:task}),showTrackList:ref(true)};
  const f=registerScheduleDeletionFeature({refs,state:{},actions:{pushHistory(){},autoUpdateEfficiency(){}}});
  f.deleteCurrentSchedule();
  assert.equal(refs.scheduledTasks.value.length,0);
  assert.equal(refs.itemPool.value[0].records.musician.actualDuration,'01:00:00');
  assert.equal(refs.itemPool.value[0].records.project.actualDuration,'00:30:00');
});

test('opening EDIT block selects editor tasks across projects and excludes other editors', async () => {
  const { registerScheduleTaskActivationFeature } = await import('../app/scripts/features/schedule-task-activation.js');
  const edit = {scheduleId:'E1',stage:'edit',editorId:'E',date:'2026-09-28',startTime:'11:00'};
  const rec = {scheduleId:'R1',stage:'rec',musicianId:'E',projectId:'P',date:'2026-09-28',startTime:'10:00'};
  const refs = {scheduledTasks:ref([rec,edit]),itemPool:ref([{id:'T1',editorId:'E',projectId:'P'},{id:'T2',editorId:'E',projectId:'Q'},{id:'T3',editorId:'X',projectId:'P'}]),currentSessionId:ref('S_DEFAULT'),trackListData:ref({}),showTrackList:ref(false),trackListContainerRef:ref(null)};
  const f = registerScheduleTaskActivationFeature({refs,utils:{},actions:{getNameById:id=>id,setTimeout(){}}});
  f.openTrackListForTask(edit);
  assert.deepEqual(refs.trackListData.value.items.map(i=>i.id),['T1','T2']);
  assert.deepEqual(refs.trackListData.value.schedules.map(i=>i.scheduleId),['E1']);
  assert.equal(refs.trackListData.value.viewType,'project');
  assert.equal(refs.trackListData.value.name,'E');
});

test('deleting EDIT aggregate preserves REC data and other sessions', () => {
  const schedule = {scheduleId:'E1',stage:'edit',editorId:'E',date:'2026-09-28',startTime:'10:00'};
  const makeItem = sessionId => ({id:sessionId,sessionId,editorId:'E',musicianId:'M',sectionIndex:0,records:{musician:{actualDuration:'01:00:00'},project:{actualDuration:'00:30:00'}}});
  const refs = {scheduledTasks:ref([schedule]),currentSessionId:ref('S_DEFAULT'),itemPool:ref([makeItem('S_DEFAULT'),makeItem('OTHER')]),sidebarTab:ref('project')};
  const f=registerScheduleDeletionFeature({refs,state:{},actions:{autoUpdateEfficiency(){}}});
  f.clearAggregateRecords(schedule);
  assert.equal(refs.itemPool.value[0].records.project.actualDuration,'');
  assert.equal(refs.itemPool.value[0].records.musician.actualDuration,'01:00:00');
  assert.equal(refs.itemPool.value[1].records.project.actualDuration,'00:30:00');
});

test('explicit stage completion overrides duration and opposite stage completion', () => {
  const item={id:'T',musicianId:'M',editorId:'E',workflowStatus:{rec:'completed',edit:'in-progress'},records:{project:{actualDuration:'01:00:00'}}};
  const refs={itemPool:ref([item]),sidebarTab:ref('project')};
  const f=registerScheduleDeletionFeature({refs,state:{projectStats:ref([{id:'E',statusKey:'completed'}])},actions:{}});
  assert.equal(f.isResourceCompleted({templateId:'T',stage:'edit',editorId:'E'}),false);
  assert.equal(f.isResourceCompleted({templateId:'T',stage:'rec',musicianId:'M'}),true);
});
