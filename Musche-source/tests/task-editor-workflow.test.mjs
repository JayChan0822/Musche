import test from 'node:test';
import assert from 'node:assert/strict';
import { registerTaskEditorFeature } from '../app/scripts/features/task-editor.js';
function harness(view) {
 const item={id:'T',musicianId:'M',editorId:'E',musicDuration:'00:03:00',ratio:20,workflowStatus:{rec:'completed',edit:'not-started'}};
 const refs={itemPool:{value:[item]},scheduledTasks:{value:[{templateId:'T',stage:'rec',estDuration:'REC'}, {templateId:'T',stage:'edit',estDuration:'EDIT'}]},editingItem:{value:{}},editingSource:{value:''},showEditor:{value:false},sidebarTab:{value:view},trackListData:{value:{}}};
 const calls=[],syncs=[];
 const f=registerTaskEditorFeature({refs,split:{ensureItemSplitViews(){},normalizeSplitViewType:x=>x,getSplitViewState:()=>({}),setItemSplitState(){},syncLegacySplitFields(){},rebalanceSplitFamilyDuration:()=>({ok:true}),syncFamilyLegacyFields(){},syncFamilySharedIdentity(){},syncFamilyOrchestration(){},syncFamilyTotalDuration(){},syncScheduledDurationsFromFamily:(_item,stage)=>syncs.push(stage)},utils:{calculateEstTime:(_duration,ratio)=>String(ratio),getDefaultRatio:(id,stage)=>{calls.push([id,stage]);return stage==='project'?8:15}},actions:{pushHistory(){},autoUpdateEfficiency(){}}});
 return {f,refs,calls,syncs,item};
}
for(const [view,id,ratio] of [['musician','M',15],['project','E',8]]) test(`editing ${view} selects its own estimate and preserves the other stage schedule`,()=>{
 const {f,refs,item,calls,syncs}=harness(view);f.openEditModal(item,'pool'); assert.equal(refs.editingItem.value.ratio,ratio); assert.deepEqual(calls.at(-1),[id,view]);
 refs.editingItem.value.workflowStatus.edit='in-progress';f.saveEdit();
 assert.equal(refs.itemPool.value[0].workflowStatus.rec,'completed');assert.equal(refs.itemPool.value[0].workflowStatus.edit,'in-progress');
 assert.equal(refs.scheduledTasks.value[view==='musician'?1:0].estDuration,view==='musician'?'EDIT':'REC'); assert.deepEqual(syncs,[view]);
});
