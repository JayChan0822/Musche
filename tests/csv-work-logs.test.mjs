import assert from 'node:assert/strict';
import test from 'node:test';
import { ref, reactive } from 'vue';
import { registerImportCsvFeature } from '../app/scripts/features/import-csv.js';
import { formatSecs } from '../app/scripts/utils/format.js';
import { parseTime } from '../app/scripts/utils/time.js';
import { getWorkLogs, getPartAllocation } from '../app/scripts/utils/workflow-ledger.js';

for (const stage of ['rec', 'edit']) test(`CSV ${stage} rework rows survive import and do not mutate another session`, () => {
  let id=0;
  const settings=reactive({projects:[{id:'P',name:'Song'}],instruments:[{id:'I',name:'Erhu'}],musicians:[{id:'M',name:'Player'}]});
  const old={id:'OLD',sessionId:'A',projectId:'P',instrumentId:'I',musicianId:'M',name:'Erhu',splitTag:null,musicDuration:'03:00',records:{musician:{actualDuration:'00:50:00'}}};
  const rows=['2026-09-27','2026-09-28'].map((date,index)=>({ selected:true,hasRecData:true,hasEditData:true,projectName:'Song',name_real:'Erhu',name_merge:'Erhu',playerName:'Player',group:'',duration:'03:00',
    recDate:date,recStart:'10:00',recEnd:index?'10:15':'10:30',edtDate:date,edtStart:'10:00',edtEnd:index?'10:15':'10:30',_raw:[] }));
  const refs={csvSearchQuery:ref(''),csvImportData:ref(rows),csvImportConfig:reactive({importTypes:{tasks:true,time:true,orch:false},nameStrategy:'split'}),activeImportTab:ref(stage),collapsedProjects:new Set(),rawCsvRows:ref([]),csvHeadersMap:ref({}),showCsvImportModal:ref(true),itemPool:ref([old]),scheduledTasks:ref([]),currentSessionId:ref('B')};
  const feature=registerImportCsvFeature({refs,state:{settings},utils:{formatSecs,parseTime,normalizeDate:x=>x,getOrchString:()=>'',getNameById:()=>'',getOrCreateSettingItem:(type)=>({project:'P',instrument:'I',musician:'M'}[type]),calculateEstTime:(d,r)=>formatSecs(parseTime(d)*r),generateUniqueId:()=>`NEW${++id}`},actions:{pushHistory(){},openAlertModal(){},autoUpdateEfficiency(){},autoResizeSchedules(){}}});
  feature.confirmCsvImport();
  assert.equal(refs.itemPool.value.length,2,'same-session repeated rows must reuse one work part');
  const imported=refs.itemPool.value.find(item=>item.sessionId==='B');
  const logs=getWorkLogs(settings,imported,stage);
  assert.deepEqual(logs.map(log=>log.actualDuration),['00:30:00','00:15:00']);
  assert.deepEqual(logs.map(log=>log.date),['2026-09-27','2026-09-28']);
  assert.equal(refs.itemPool.value.find(item=>item.id==='OLD').records.musician.actualDuration,'00:50:00');
  assert.equal(getPartAllocation(settings,old,stage),null);
  feature.confirmCsvImport();
  assert.equal(getWorkLogs(settings,imported,stage).length,2,'reimporting identical rows must not duplicate attempts');
});
