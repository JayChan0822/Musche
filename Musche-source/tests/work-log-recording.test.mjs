import assert from 'node:assert/strict';
import test from 'node:test';
import { reactive, ref } from 'vue';
import { createTrackListRecords } from '../app/scripts/features/track-list-records.js';
import { ensureWorkflowLedger, getWorkLogs } from '../app/scripts/utils/workflow-ledger.js';
import { registerHistoryFeature } from '../app/scripts/features/history.js';
import { formatSecs } from '../app/scripts/utils/format.js';

function harness(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const itemPool = ref([{ id:'T', musicianId:'M', editorId:'E', musicDuration:'03:00', records:{musician:{recStart:'10:00',recEnd:'10:30',actualDuration:'00:30:00',assigneeId:'M'},project:{}} }]);
  const block = {scheduleId:'B',stage:'rec',musicianId:'M',date:'2026-09-28',startTime:'10:00',estDuration:'01:00:00'};
  const scheduledTasks=ref([block]);
  const settings=reactive({});
  ensureWorkflowLedger(settings,itemPool.value,scheduledTasks.value,{bootstrap:true});
  const trackListData=ref({items:itemPool.value,schedules:[block],taskRef:block,viewType:'musician'});
  const history=registerHistoryFeature({refs:{itemPool,scheduledTasks,trackListData,history:ref([]),historyIndex:ref(-1),showTrackList:ref(false)},state:{settings},actions:{}});
  history.pushHistory();
  const f=createTrackListRecords({settings,itemPool,scheduledTasks,trackListData,showTrackList:ref(true),formatSecs,getViewType:()=>trackListData.value.viewType,getTargetId:i=>i.musicianId,
    getNameById:()=> 'Player',pushHistory:history.pushHistory,autoUpdateEfficiency(){},openAlertModal(){},openInputModal(){}});
  return {f,settings,itemPool,scheduledTasks,trackListData,history,item:()=>itemPool.value[0]};
}

test('adding rework keeps prior attempt and persists only the selected new attempt', (t) => {
  const h=harness(t);
  h.f.startNewWorkAttempt(h.item());
  assert.equal(getWorkLogs(h.settings,h.item(),'rec').length,2);
  assert.equal(h.item().records.musician.recStart,'');
  Object.assign(h.item().records.musician,{recStart:'11:00',recEnd:'11:15'});
  h.f.calcTrackDiff(h.item());
  const logs=getWorkLogs(h.settings,h.item(),'rec');
  assert.equal(logs[0].actualDuration,'00:30:00');
  assert.equal(logs[1].actualDuration,'00:15:00');
  assert.equal(logs[1].attemptNumber,2);
  assert.equal(h.scheduledTasks.value[0].estDuration,'01:00:00');
  assert.equal(getWorkLogs(h.settings,h.item(),'edit').length,0);
  t.mock.timers.tick(1500);
  h.history.undo();
  assert.equal(getWorkLogs(h.settings,h.item(),'rec')[1].actualDuration,'');
  h.history.redo();
  assert.equal(getWorkLogs(h.settings,h.item(),'rec')[1].actualDuration,'00:15:00');
});

test('switching attempts loads their own identity/date and correction never changes another attempt', (t) => {
  const h=harness(t);h.f.startNewWorkAttempt(h.item());
  const logs=getWorkLogs(h.settings,h.item(),'rec');
  h.f.selectWorkAttempt(h.item(),logs[0].id);
  assert.equal(h.item().records.musician.recStart,'10:00');
  h.item().records.musician.recEnd='10:40';h.f.calcTrackDiff(h.item());
  assert.equal(getWorkLogs(h.settings,h.item(),'rec')[0].actualDuration,'00:40:00');
  assert.equal(getWorkLogs(h.settings,h.item(),'rec')[1].actualDuration,'');
});

test('clearing current attempt voids only that row and undo restores it', (t) => {
  const h=harness(t);h.f.startNewWorkAttempt(h.item());
  Object.assign(h.item().records.musician,{recStart:'11:00',recEnd:'11:15'});h.f.calcTrackDiff(h.item());t.mock.timers.tick(1500);
  h.f.clearTrackTime(h.item());
  assert.equal(getWorkLogs(h.settings,h.item(),'rec').length,1);
  assert.equal(h.settings.workflow.workLogs.length,2);
  h.history.undo();assert.equal(getWorkLogs(h.settings,h.item(),'rec').length,2);
});

test('a later attempt captures the new assignee and JSON migration preserves both attempts', async (t) => {
  const h=harness(t);
  h.item().musicianId='NEW';
  h.f.startNewWorkAttempt(h.item());
  h.item().records.musician.actualDuration='00:12:00';
  h.f.saveWorkAttempt(h.item());
  const {serializeWorkflowContent,migrateWorkflowContent}=await import('../app/scripts/utils/workflow-migration.js');
  const saved=serializeWorkflowContent(h.settings,h.itemPool.value,h.scheduledTasks.value);
  const reloaded=migrateWorkflowContent(JSON.parse(JSON.stringify(saved)));
  const logs=getWorkLogs(reloaded.settings,reloaded.pool[0],'rec');
  assert.deepEqual(logs.map(log=>log.assigneeId),['M','NEW']);
  assert.deepEqual(logs.map(log=>log.actualDuration),['00:30:00','00:12:00']);
});
