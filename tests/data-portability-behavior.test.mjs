import assert from 'node:assert/strict';
import test from 'node:test';

import { ref } from 'vue';

import { registerDataPortabilityFeature } from '../app/scripts/features/data-portability.js';

function createPortability(overrides = {}) {
  const calls = { cancel: 0, history: 0 };
  const refs = {
    itemPool: ref([]),
    scheduledTasks: ref([]),
    currentSessionId: ref('S1'),
  };
  const settings = {
    sessions: [{ id: 'S1', name: 'Main' }],
    ...(overrides.settings || {}),
  };
  const actions = {
    openInputModal: () => {},
    openAlertModal: () => {},
    pushHistory: () => { calls.history += 1; },
    cancelPendingTrackSave: () => { calls.cancel += 1; },
    ...(overrides.actions || {}),
  };
  const feature = registerDataPortabilityFeature({
    refs,
    services: { storageService: overrides.storage || {getItem:()=>null, setItem:()=>{}} },
    state: { settings },
    utils: { parseTime: () => 0, getNameById: () => '' },
    actions,
    ioState: { showImportModal: ref(false) },
  });
  return { feature, refs, settings, calls };
}

test('JSON import cancels pending track-save before replacing the pool', () => {
  let readCallback;
  const { feature, refs, calls } = createPortability({
    actions: {
      readFileAsText: (_file, _encoding, onLoaded) => { readCallback = onLoaded; },
    },
  });

  feature.handleJSONFile({
    target: {
      files: [{ name: 'backup.json' }],
      value: '/fake/path',
    },
  });

  readCallback({
    target: { result: JSON.stringify({ pool: [{ id: 'IMPORTED' }], tasks: [], settings: {} }) },
  });

  assert.equal(calls.cancel, 1, 'import must cancel the pending write-back before replacing the pool');
  assert.equal(refs.itemPool.value[0].id, 'IMPORTED');
  assert.equal(calls.history, 2, 'import pushes history before and after the replacement');
});


test('JSON import aborts before mutation when backup cannot be saved', () => {
 let readCallback; const alerts=[];
 const {feature,refs,calls}=createPortability({storage:{getItem:()=>null,setItem:()=>{throw Error('quota');}},actions:{readFileAsText:(_f,_e,cb)=>{readCallback=cb;},openAlertModal:(...args)=>alerts.push(args),logError:()=>{}}});
 refs.itemPool.value=[{id:'original'}];
 feature.handleJSONFile({target:{files:[{name:'b.json'}],value:''}});
 readCallback({target:{result:JSON.stringify({pool:[{id:'incoming'}],tasks:[]})}});
 assert.equal(refs.itemPool.value[0].id,'original'); assert.equal(calls.history,0);
 assert.ok(alerts[0][1].includes('quota'));
});
test('JSON import/export preserves extension fields and stage assignment',()=>{
 let readCallback;let exported;
 const {feature}=createPortability({actions:{readFileAsText:(_f,_e,cb)=>{readCallback=cb;},openInputModal:(_title,_name,_hint,cb)=>cb('backup.json'),downloadTextFile:text=>{exported=JSON.parse(text);}}});
 feature.handleJSONFile({target:{files:[{name:'b.json'}],value:''}});
 readCallback({target:{result:JSON.stringify({customExtension:{important:true},pool:[{id:'t',editorId:'e'}],tasks:[{scheduleId:1,stage:'edit',musicianId:'m',editorId:'e'}],settings:{musicians:[{id:'e',roles:['editor']}]}})}});
 feature.exportJSON();
 assert.equal(exported.schemaVersion,11);assert.deepEqual(exported.customExtension,{important:true});
 assert.equal(exported.tasks[0].stage,'edit');assert.equal(exported.tasks[0].editorId,'e');
 assert.deepEqual(exported.settings.musicians[0].roles,['editor']);
});
