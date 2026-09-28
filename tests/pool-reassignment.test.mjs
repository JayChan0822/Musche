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
