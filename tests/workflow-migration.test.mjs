import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateWorkflowContent, preserveWorkflowBackup, createWorkflowContent } from '../app/scripts/utils/workflow-migration.js';

test('migration is lossless, non-mutating and idempotent', () => {
 const old = { unknown: { keep: true }, pool: [{ id:'a', records:{project:{actualDuration:'01:00'}}, splitViews:{musician:{active:false}} }], tasks:[{projectId:'p'},{projectId:'p',musicianId:'m'}], settings:{musicians:[{id:'m',name:'A'},{id:'e',roles:['editor']}]}};
 const before = JSON.stringify(old); const migrated = migrateWorkflowContent(old);
 assert.equal(JSON.stringify(old),before); assert.equal(migrated.schemaVersion,10);
 assert.deepEqual(migrated.tasks.map(x=>x.stage),['edit','rec']);
 assert.equal(migrated.pool[0].editorId,''); assert.equal(migrated.pool[0].records.project.actualDuration,old.pool[0].records.project.actualDuration);
 assert.deepEqual(migrated.settings.musicians.map(x=>x.roles),[['musician'],['editor']]);
 assert.deepEqual(migrateWorkflowContent(migrated),migrated);
 assert.deepEqual(migrated.unknown, old.unknown);
});
test('future schemas and malformed data are refused',()=>{
 assert.throws(()=>migrateWorkflowContent({schemaVersion:11}),/newer/);
 assert.throws(()=>migrateWorkflowContent({pool:{}}),/pool/);
});
test('backup preserves first original for each source and fails closed',()=>{
 const data=new Map();const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const original={pool:[{id:'original'}]}; const key=preserveWorkflowBackup(storage,original,'guest');
 preserveWorkflowBackup(storage,{pool:[]},'guest'); assert.deepEqual(JSON.parse(data.get(key)),original);
 assert.throws(()=>preserveWorkflowBackup({getItem:()=>null,setItem:()=>{throw Error('quota');}},original,'guest'),/quota/);
});
test('serialization retains loaded extension fields and schema marker',()=>{
 assert.deepEqual(createWorkflowContent({extension:7},{pool:[],tasks:[],settings:{}}),{extension:7,pool:[],tasks:[],settings:{},schemaVersion:10});
});

test('historical execution owner and stage duration survive later reassignment',()=>{
 const original={pool:[{id:'t',musicianId:'old-musician',editorId:'',musicDuration:'03:00',splitViews:{musician:{musicDuration:'01:00'}},records:{musician:{actualDuration:'10:00'},project:{recStart:'10:00',recEnd:'10:30'}}}],tasks:[]};
 const first=migrateWorkflowContent(original);
 assert.equal(first.pool[0].records.musician.assigneeId,'old-musician');
 assert.equal(first.pool[0].records.musician.musicDuration,'01:00');
 assert.equal(first.pool[0].records.project.assigneeId,'');
 first.pool[0].musicianId='new-musician';first.pool[0].editorId='new-editor';first.pool[0].musicDuration='05:00';
 const next=migrateWorkflowContent(first);
 assert.equal(next.pool[0].records.musician.assigneeId,'old-musician');
 assert.equal(next.pool[0].records.project.assigneeId,'');
 assert.equal(next.pool[0].records.project.musicDuration,'03:00');
});
test('empty records are not assigned historical identity',()=>{
 const data=migrateWorkflowContent({pool:[{records:{musician:{},project:{}}}]});
 assert.deepEqual(data.pool[0].records,{musician:{},project:{}});
});
