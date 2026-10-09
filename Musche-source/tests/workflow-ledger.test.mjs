import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateWorkflowContent } from '../app/scripts/utils/workflow-migration.js';

const fixture = () => ({pool:[{id:'a',projectId:'p',instrumentId:'i',musicianId:'m',musicDuration:'03:00',records:{musician:{actualDuration:'30:00',recStart:'10:00',recEnd:'10:30'}}}], tasks:[{scheduleId:'s',musicianId:'m',date:'2026-09-28',startTime:'10:00'}],settings:{}});
test('v11 creates independent structures and one historical record',()=>{
 const result=migrateWorkflowContent(fixture());
 assert.equal(result.schemaVersion,11);
 assert.equal(result.settings.workflow.baseTasks.length,1);
 assert.equal(result.settings.workflow.stageWorks.length,2);
 assert.equal(result.settings.workflow.workParts.length,2);
 assert.equal(result.settings.workflow.workLogs.length,1);
 assert.equal(result.settings.workflow.workLogs[0].assigneeId,'m');
 assert.equal(result.settings.workflow.allocations[0].scheduleId,'s');
});
test('reload never reimports stale adapters or remaps allocation from section order',()=>{
 const first=migrateWorkflowContent(fixture());
 assert.ok(first.settings.workflow);
 first.settings.workflow.workLogs[0].actualDuration='40:00';
 first.tasks.unshift({scheduleId:'earlier',stage:'rec',musicianId:'m',date:'2026-09-27',startTime:'10:00'});
 const next=migrateWorkflowContent(first);
 assert.equal(next.settings.workflow.workLogs.length,1);
 assert.equal(next.settings.workflow.workLogs[0].actualDuration,'40:00');
 assert.equal(next.settings.workflow.allocations[0].scheduleId,'s');
});

test('rework keeps independent attempts and stable historical identity',async()=>{
 const api=await import('../app/scripts/utils/workflow-ledger.js');
 const data=migrateWorkflowContent(fixture()), item=data.pool[0], settings=data.settings;
 assert.equal(typeof api.getActiveWorkLog,'function');
 const first=api.getActiveWorkLog(settings,item,'rec');
 item.musicianId='replacement'; item.recordingInfo={studio:'studio-1'};
 const next=api.appendWorkLog(settings,item,'rec',{actualDuration:'15:00'},{date:'2026-09-29'});
 assert.equal(first.assigneeId,'m'); assert.equal(next.assigneeId,'replacement');
 assert.equal(next.attemptNumber,2); assert.deepEqual(next.recordingInfo,{studio:'studio-1'});
 api.updateWorkLog(settings,next.id,{actualDuration:'20:00',id:'bad',partId:'bad'});
 assert.equal(next.actualDuration,'20:00'); assert.notEqual(next.partId,'bad');
 api.setActiveWorkLog(settings,item,'rec',first.id);
 assert.equal(item.records.musician.actualDuration,'30:00');
 api.invalidateWorkLog(settings,next.id);
 assert.equal(settings.workflow.workLogs.length,2);
 assert.equal(api.getWorkLogs(settings,item,'rec').length,1);
});
test('session identity prevents logs and allocations colliding',async()=>{
 const api=await import('../app/scripts/utils/workflow-ledger.js');
 const data=fixture(); data.pool.push({...data.pool[0],sessionId:'another/session'});
 const result=migrateWorkflowContent(data);
 assert.equal(new Set(result.settings.workflow.workLogs.map(log=>log.id)).size,2);
 api.linkWorkPart(result.settings,result.pool[0],'rec',null);
 assert.equal(api.getPartAllocation(result.settings,result.pool[0],'rec').scheduleId,null);
 assert.equal(api.getPartAllocation(result.settings,result.pool[1],'rec'),null);
});
test('split stages share one base task and retain distinct work parts',()=>{
 const data=fixture();data.pool.push({...data.pool[0],id:'b',splitFromId:'a',records:{},splitViews:{musician:{active:true,musicDuration:'01:00'},project:{active:false}}});
 const result=migrateWorkflowContent(data);
 assert.equal(result.settings.workflow.baseTasks.length,1);
 assert.equal(result.settings.workflow.stageWorks.length,2);
 assert.equal(result.settings.workflow.workParts.length,4);
});
test('ambiguous duplicate direct schedules stay unassigned and keep original record date',()=>{
 const data=fixture();data.tasks=[{scheduleId:'a',templateId:'a',stage:'rec',date:'2026-01-01'},{scheduleId:'b',templateId:'a',stage:'rec',date:'2026-01-02'}];
 data.pool[0].records.musician.date='2025-12-31';
 const result=migrateWorkflowContent(data), ledger=result.settings.workflow;
 assert.equal(ledger.allocations[0]?.scheduleId,null);
 assert.equal(ledger.workLogs[0].date,'2025-12-31');
 assert.equal(ledger.migrationIssues[0].type,'ambiguous-schedule');
});
test('removing a pool item archives its part while logs and task identity survive',async()=>{
 const api=await import('../app/scripts/utils/workflow-ledger.js');
 const data=migrateWorkflowContent(fixture());
 api.ensureWorkflowLedger(data.settings,[],[]);
 assert.equal(data.settings.workflow.workParts[0].archived,true);
 assert.equal(data.settings.workflow.workLogs.length,1);
});

test('v11 missing ledger is rejected instead of silently erasing its record history',()=>{
 assert.throws(()=>migrateWorkflowContent({schemaVersion:11,pool:[{id:'a',records:{musician:{actualDuration:'30:00'}}}],settings:{}}),/missing independent/);
});
