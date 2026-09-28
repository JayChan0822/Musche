import test from 'node:test';
import assert from 'node:assert/strict';
import { reassignPoolTask } from '../app/scripts/utils/pool-reassignment.js';
import { ensureWorkflowLedger, linkWorkPart, appendWorkLog, getPartAllocation } from '../app/scripts/utils/workflow-ledger.js';
for (const [view,stage,key] of [['musician','rec','musicianId'],['project','edit','editorId']]) {
 test(`${stage} reassignment clears only its allocation and preserves history`,()=>{
  const settings={musicians:[{id:'new',roles:['musician','editor']}]};
  const item={id:'a',musicianId:'old',editorId:'old'};const other={id:'b',musicianId:'old',editorId:'old'};
  const pool=[item,other];const tasks=[{scheduleId:'s',stage}];
  ensureWorkflowLedger(settings,pool,tasks,{bootstrap:true});
  linkWorkPart(settings,item,stage,'s');linkWorkPart(settings,other,stage,'s');
  appendWorkLog(settings,item,stage,{actualDuration:'01:00',assigneeId:'old'},{scheduleId:'s'});
  const logs=JSON.stringify(settings.workflow.workLogs);
  assert.equal(reassignPoolTask(settings,pool,tasks,item.id,view,'new'),true);
  assert.equal(item[key],'new');assert.equal(item[key==='editorId'?'musicianId':'editorId'],'old');
  assert.equal(getPartAllocation(settings,item,stage).scheduleId,null);
  assert.equal(getPartAllocation(settings,other,stage).scheduleId,'s');assert.equal(tasks.length,1);
  assert.equal(JSON.stringify(settings.workflow.workLogs),logs);
  assert.equal(reassignPoolTask(settings,pool,tasks,item.id,view,'new'),false);
  assert.equal(reassignPoolTask(settings,pool,tasks,item.id,view,'missing'),false);
  assert.equal(reassignPoolTask(settings,pool,tasks,item.id,view,'__UNASSIGNED__'),true);
  assert.equal(item[key],'');
 });
}

test('reassignment removes an empty unrecorded booking but never a recorded one', () => {
 for (const recorded of [false,true]) {
  const settings={musicians:[{id:'new',roles:['musician']}]};
  const item={id:'a',musicianId:'old'};const schedules=[{scheduleId:'s',stage:'rec'}];
  ensureWorkflowLedger(settings,[item],schedules,{bootstrap:true});
  linkWorkPart(settings,item,'rec','s');
  if(recorded) appendWorkLog(settings,item,'rec',{recStart:'10:00'},{scheduleId:'s'});
  reassignPoolTask(settings,[item],schedules,'a','musician','new');
  assert.equal(schedules.length,recorded?1:0);
 }
});

test('joins the only matching schedule and rejects ambiguous or invalid destinations', () => {
 const settings={musicians:[{id:'new',roles:['editor']}]};
 const item={id:'a',sessionId:'S',editorId:'old'};
 const tasks=[{scheduleId:'B',sessionId:'S',stage:'edit',editorId:'new',date:'2026-09-28',startTime:'10:00'},
 {scheduleId:'other-stage',sessionId:'S',stage:'rec',musicianId:'new'},
 {scheduleId:'other-session',sessionId:'X',stage:'edit',editorId:'new'}];
 assert.equal(reassignPoolTask(settings,[item],tasks,'a','project','new'),true);
 assert.equal(getPartAllocation(settings,item,'edit').scheduleId,'B');
 item.editorId='old';tasks.push({...tasks[0],scheduleId:'C'});
 assert.equal(reassignPoolTask(settings,[item],tasks,'a','project','new'),false);
 assert.equal(item.editorId,'old');
 assert.equal(reassignPoolTask(settings,[item],tasks,'a','project','new','other-session'),false);
 assert.equal(reassignPoolTask(settings,[item],tasks,'a','project','new','C'),true);
 assert.equal(getPartAllocation(settings,item,'edit').scheduleId,'C');
});

test('multi-schedule drop waits for selection and cancellation leaves source untouched', async () => {
 const { registerScheduleDragDropFeature }=await import('../app/scripts/features/schedule-drag-drop.js');
 for(const chosen of [null,'B2']) {
  const item={id:'a',sessionId:'S',editorId:'old'};
  const settings={musicians:[{id:'new',roles:['editor']}]};
  const tasks=['B1','B2'].map(scheduleId=>({scheduleId,stage:'edit',sessionId:'S',editorId:'new'}));
  let choose,history=0;
  const feature=registerScheduleDragDropFeature({refs:{itemPool:{value:[item]},scheduledTasks:{value:tasks},sidebarTab:{value:'project'},currentSessionId:{value:'S'},pxPerMin:{value:1}},state:{settings},utils:{formatSecs:String},actions:{getDocument:()=>({querySelectorAll:()=>[]}),pushHistory:()=>history++,chooseSchedule:()=>new Promise(resolve=>choose=resolve)}});
  feature.dragStart({dataTransfer:{},target:null},item,'pool');
  const pending=feature.dropToPool({currentTarget:{classList:{remove(){}}},target:{closest:()=>({dataset:{statId:'new'}})}});
  assert.equal(item.editorId,'old');
  feature.handleDragEnd({target:null});
  choose(chosen);await pending;
  assert.equal(item.editorId,chosen?'new':'old');
  assert.equal(history,chosen?2:0);
  if(chosen)assert.equal(getPartAllocation(settings,item,'edit').scheduleId,'B2');
 }
});
