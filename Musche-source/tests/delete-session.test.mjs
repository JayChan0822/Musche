import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteSessionData } from '../app/scripts/utils/delete-session.js';
import { ensureWorkflowLedger, appendWorkLog } from '../app/scripts/utils/workflow-ledger.js';

test('session deletion cascades through ledger and exclusive projects, retaining shared resources', () => {
 const settings={sessions:[{id:'A'},{id:'B'}],projects:[{id:'exclusive'},{id:'shared'},{id:'unused'}],musicians:[{id:'M'}],instruments:[{id:'I'}]};
 const pool=[{id:'a',sessionId:'A',projectId:'exclusive'},{id:'b',sessionId:'A',projectId:'shared'},{id:'c',sessionId:'B',projectId:'shared'}];
 const tasks=[{scheduleId:'a',sessionId:'A'},{scheduleId:'b',sessionId:'B'}];
 ensureWorkflowLedger(settings,pool,tasks,{bootstrap:true});
 appendWorkLog(settings,pool[0],'rec',{actualDuration:'10:00'});
 const result=deleteSessionData(settings,pool,tasks,'A');
 assert.deepEqual(result.pool.map(x=>x.id),['c']);assert.deepEqual(result.tasks.map(x=>x.scheduleId),['b']);
 assert.deepEqual(settings.projects.map(x=>x.id),['shared','unused']);
 for(const name of ['baseTasks','stageWorks','workParts','workLogs','allocations']) assert.ok(settings.workflow[name].every(x=>x.sessionId!=='A'));
 assert.equal(settings.musicians.length,1);assert.equal(settings.instruments.length,1);
 assert.equal(deleteSessionData(settings,result.pool,result.tasks,'B'),null);
});
