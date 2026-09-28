import test from 'node:test';
import assert from 'node:assert/strict';
import { ref } from 'vue';
import { ensureWorkflowLedger, getPartAllocation, linkWorkPart, appendWorkLog } from '../app/scripts/utils/workflow-ledger.js';
import { projectItemSection, allocateNewSchedule, resolveItemSchedule, unlinkSchedule } from '../app/scripts/utils/stable-schedule.js';
import { registerScheduleTaskActivationFeature } from '../app/scripts/features/schedule-task-activation.js';
import { registerScheduleDeletionFeature } from '../app/scripts/features/schedule-deletion.js';
import { registerScheduleFeature } from '../app/scripts/features/schedule.js';
const fixture = () => {
  const pool = ['a', 'b'].map((id, sectionIndex) => ({id,musicianId:'M',editorId:'E',sessionId:'S',musicDuration:'01:00',sectionIndex,records:{musician:{}}}));
  const blocks = ['A','B'].map((scheduleId,i) => ({scheduleId,stage:'rec',sessionId:'S',musicianId:'M',date:`2026-09-${28+i}`,startTime:'10:00',estDuration:'01:00:00'}));
  const settings = {}; ensureWorkflowLedger(settings,pool,blocks,{bootstrap:true});
  return {pool,blocks,settings};
};
test('calendar reordering changes section projection without moving allocated contents', () => {
  const {settings,pool,blocks}=fixture(); blocks[0].date='2026-09-30'; blocks.reverse();
  assert.equal(projectItemSection(settings,pool[0],'musician',blocks),1);
  assert.equal(projectItemSection(settings,pool[1],'musician',blocks),0);
  assert.equal(getPartAllocation(settings,pool[0],'rec').scheduleId,'A');
});
test('v11 unassigned content never falls back to section zero', () => {
  const {settings,pool,blocks}=fixture(); linkWorkPart(settings,pool[0],'rec',null);
  pool[0].sectionIndex=0;
  assert.equal(resolveItemSchedule(settings,pool[0],'musician',blocks),null);
  assert.equal(projectItemSection(settings,pool[0],'musician',blocks),-1);
});
test('new aggregate binds only unassigned active work in its session and stage', () => {
  const {settings,pool,blocks}=fixture(); unlinkSchedule(settings,pool,blocks[0]);
  const next={...blocks[0],scheduleId:'NEW'};
  allocateNewSchedule(settings,[...pool,{id:'OTHER',sessionId:'OTHER',musicianId:'M'}],next);
  assert.equal(getPartAllocation(settings,pool[0],'rec').scheduleId,'NEW');
  assert.equal(getPartAllocation(settings,pool[1],'rec').scheduleId,'B');
  assert.equal(getPartAllocation(settings,pool[0],'edit'),null);
});
test('delete block unassigns only its content and preserves independent actual logs', () => {
  const {settings,pool,blocks}=fixture();
  appendWorkLog(settings,pool[0],'rec',{actualDuration:'00:10:00'},{scheduleId:'A'});
  const refs={itemPool:ref(pool),scheduledTasks:ref(blocks),currentSessionId:ref('S'),sidebarTab:ref('musician'),trackListData:ref({taskRef:blocks[0]}),showTrackList:ref(true)};
  registerScheduleDeletionFeature({refs,state:{settings},actions:{pushHistory(){},autoUpdateEfficiency(){}}}).deleteCurrentSchedule();
  assert.equal(getPartAllocation(settings,pool[0],'rec')?.scheduleId,null);
  assert.equal(getPartAllocation(settings,pool[1],'rec').scheduleId,'B');
  assert.equal(settings.workflow.workLogs.length,1);
  assert.equal(settings.workflow.workLogs[0].scheduleId,'A');
});
test('splitting calendar block retains identity and all prior contents on first half', () => {
  const {settings,pool,blocks}=fixture();
  const refs={scheduledTasks:ref(blocks),itemPool:ref(pool),pxPerMin:ref(1)};
  registerScheduleTaskActivationFeature({refs,state:{settings},utils:{parseTime:()=>3600,formatSecs:s=>String(s)},actions:{getNow:()=>99,pushHistory(){}}})
    .handleTaskDblClick({metaKey:true,clientY:30,currentTarget:{getBoundingClientRect:()=>({top:0})}},blocks[0]);
  assert.ok(refs.scheduledTasks.value.some(b=>b.scheduleId==='A'));
  assert.equal(getPartAllocation(settings,pool[0],'rec').scheduleId,'A');
  assert.equal(refs.scheduledTasks.value.find(b=>b.scheduleId==='A').estDuration,'1800');
});
test('cleanup after calendar reorder uses allocations and never reassigns to a neighbor', () => {
  const {settings,pool,blocks}=fixture(); blocks[0].date='2026-10-01';
  linkWorkPart(settings,pool[1],'rec',null);
  const refs={scheduledTasks:ref(blocks),itemPool:ref(pool),currentSessionId:ref('S')};
  registerScheduleFeature({refs,state:{settings},utils:{},actions:{}}).cleanupEmptySchedules();
  assert.deepEqual(refs.scheduledTasks.value.map(b=>b.scheduleId),['A']);
  assert.equal(getPartAllocation(settings,pool[0],'rec').scheduleId,'A');
});

test('saved v11 snapshot preserves reordered and canceled links on restore', async () => {
  const { serializeWorkflowContent, migrateWorkflowContent } = await import('../app/scripts/utils/workflow-migration.js');
  const {settings,pool,blocks}=fixture();
  blocks[0].date='2026-10-01'; linkWorkPart(settings,pool[1],'rec',null);
  pool[0].sectionIndex=0; pool[1].sectionIndex=0;
  const restored=migrateWorkflowContent(JSON.parse(JSON.stringify(serializeWorkflowContent(settings,pool,blocks))));
  const sorted=restored.tasks.sort((a,b)=>a.date.localeCompare(b.date));
  assert.equal(projectItemSection(restored.settings,restored.pool[0],'musician',sorted),1);
  assert.equal(projectItemSection(restored.settings,restored.pool[1],'musician',sorted),-1);
  assert.equal(getPartAllocation(restored.settings,restored.pool[0],'rec').scheduleId,'A');
});
test('explicit schedule resize reads all attempts only on the selected block date', async () => {
  const { createTrackListLayout } = await import('../app/scripts/features/track-list-layout.js');
  const {settings,pool,blocks}=fixture();
  appendWorkLog(settings,pool[0],'rec',{recStart:'10:15',recEnd:'10:30'},{scheduleId:'A',date:blocks[0].date});
  appendWorkLog(settings,pool[0],'rec',{recStart:'10:45',recEnd:'11:00'},{scheduleId:'A',date:blocks[0].date});
  appendWorkLog(settings,pool[0],'rec',{recStart:'08:00',recEnd:'18:00'},{scheduleId:'A',date:'2026-10-01'});
  appendWorkLog(settings,pool[0],'rec',{recStart:'07:00',recEnd:'20:00'},{scheduleId:'OTHER',date:blocks[0].date});
  const tasks=ref(blocks);
  const layout=createTrackListLayout({settings,scheduledTasks:tasks,trackListData:ref({items:pool,schedules:blocks}),getViewType:()=> 'musician',formatSecs:s=>String(s)});
  layout.autoResizeScheduleByRecords(true);
  assert.equal(tasks.value[0].startTime,'10:15');
  assert.equal(tasks.value[0].estDuration,'2700');
});
test('history fallback rebuilds canonical sections and excludes canceled rows after undo/redo', async () => {
  const { registerHistoryFeature } = await import('../app/scripts/features/history.js');
  const {settings,pool,blocks}=fixture();
  const refs={itemPool:ref(pool),scheduledTasks:ref(blocks),history:ref([]),historyIndex:ref(-1),showTrackList:ref(true),currentSessionId:ref('S'),trackListData:ref({taskRef:blocks[0],schedules:blocks,items:pool})};
  const history=registerHistoryFeature({refs,state:{settings},actions:{isItemVisibleForView:()=>true,syncItemsForView(){}}});
  history.pushHistory();
  refs.scheduledTasks.value[0].date='2026-10-01'; linkWorkPart(settings,pool[1],'rec',null); history.pushHistory();
  history.undo();
  assert.deepEqual(refs.trackListData.value.items.map(item=>[item.id,item.sectionIndex]),[['a',0],['b',1]]);
  history.redo();
  assert.deepEqual(refs.trackListData.value.schedules.map(block=>block.scheduleId),['B','A']);
  assert.deepEqual(refs.trackListData.value.items.map(item=>[item.id,item.sectionIndex]),[['a',1]]);
  assert.equal(refs.trackListData.value.currentSectionIndex,1);
});
test('automatic cleanup and prune preserve unallocated blocks referenced by historical work', () => {
  const {settings,pool,blocks}=fixture();
  appendWorkLog(settings,pool[0],'rec',{actualDuration:'00:10:00'},{scheduleId:'A',date:blocks[0].date});
  unlinkSchedule(settings,pool,blocks[0]);
  const refs={scheduledTasks:ref(blocks),itemPool:ref(pool),currentSessionId:ref('S'),sidebarTab:ref('musician'),showTrackList:ref(true),trackListData:ref({schedules:blocks,items:pool,totalSections:2,currentSectionIndex:0})};
  const schedule=registerScheduleFeature({refs,state:{settings},utils:{},actions:{}});
  schedule.cleanupEmptySchedules(); schedule.pruneEmptySchedules();
  assert.deepEqual(refs.scheduledTasks.value.map(b=>b.scheduleId),['A','B']);
  assert.equal(getPartAllocation(settings,pool[0],'rec').scheduleId,null);
  assert.equal(getPartAllocation(settings,pool[1],'rec').scheduleId,'B');
});
