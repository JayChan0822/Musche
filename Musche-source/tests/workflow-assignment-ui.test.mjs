import test from 'node:test';
import assert from 'node:assert/strict';
import { ref, reactive } from 'vue';
import { registerQuickAddFeature } from '../app/scripts/features/quick-add.js';
import { registerDropdownsFeature } from '../app/scripts/features/dropdowns.js';

test('tasks can be created before either stage is assigned', () => {
 const pool = ref([]);
 const f = registerQuickAddFeature({ refs: { itemPool:pool, currentSessionId:ref('S'), showMobileTaskInput:ref(false) }, state:{settings:{musicians:[]},newItem:{projectId:'P',instrumentId:'I',musicDuration:'00:03:00'}}, utils:{getDefaultRatio:()=>20,getNameById:()=> 'Violin',generateUniqueId:()=> 'T',calculateEstTime:()=> '01:00:00',ensureItemRecords:x=>x},actions:{pushHistory(){},openAlertModal(){assert.fail('unassigned task rejected')}} });
 f.addItemToPool(); assert.equal(pool.value.length,1); assert.equal(pool.value[0].editorId,''); assert.equal(pool.value[0].musicianId,'');
});
test('editor selector filters roles and assigns independently', () => {
 const newItem = reactive({musicianId:'M'}); const activeDropdown=ref('editor');
 const f=registerDropdownsFeature({refs:{activeDropdown,editingItem:ref({}),showMobileMenu:ref(false),showProfileMenu:ref(false),settingsGroupFocus:ref(null),showGroupSuggestions:ref(false)},state:{newItem,settings:{musicians:[{id:'M',name:'Legacy'},{id:'E',name:'Editor',roles:['editor']}]} }});
 assert.deepEqual(f.filteredOptions.value.map(x=>x.id),['E']); f.selectOption('editor',{id:'E'}); assert.equal(newItem.editorId,'E'); assert.equal(newItem.musicianId,'M');
});

test('creating an editor stores a person role without assigning REC', (t) => {
 t.mock.timers.enable({apis:['setTimeout']});
 const settings = {musicians:[]}; const newItem = {musicianId:'M'};
 const refs={quickAddType:ref(''),quickAddForm:reactive({name:'',group:''}),showQuickAddModal:ref(false),activeDropdown:ref('editor')};
 const f=registerQuickAddFeature({refs,state:{settings,newItem},utils:{getExistingGroups:()=>[],generateUniqueId:()=> 'E',generateRandomHexColor:()=> '#123456'},actions:{pushHistory(){},focusElementById(){},openAlertModal(){assert.fail('unexpected')}}});
 f.openQuickAdd('editor',' Editor '); f.confirmQuickAdd();
 assert.deepEqual(settings.musicians[0].roles,['editor']); assert.equal(newItem.editorId,'E'); assert.equal(newItem.musicianId,'M');
});

import { registerSettingsFeature } from '../app/scripts/features/settings.js';
test('removing a person preserves stage work and historical records while clearing both current assignments', () => {
 const records={musician:{actualDuration:'00:10:00',performedBy:'M'},project:{actualDuration:'00:04:00',performedBy:'M'}};
 const pool=ref([{id:'T',musicianId:'M',editorId:'M',records}]); const tasks=ref([{scheduleId:1,musicianId:'M',stage:'rec'},{scheduleId:2,editorId:'M',stage:'edit'}]);
 const settings={musicians:[{id:'M',name:'Person'}],projects:[],instruments:[]};
 const f=registerSettingsFeature({refs:{itemPool:pool,scheduledTasks:tasks,settingsExpandedGroups:new Set(),newSettingsItem:{},settingsGroupFocus:ref(null)},state:{settings},utils:{},actions:{openConfirmModal:(_t,_m,confirm)=>confirm(),pushHistory(){},cleanupEmptySchedules(){assert.fail('must not prune preserved schedules')}}});
 f.removeSettingsItem('musician','M'); assert.equal(pool.value.length,1);assert.equal(tasks.value.length,2);assert.equal(pool.value[0].musicianId,'');assert.equal(pool.value[0].editorId,'');assert.deepEqual(pool.value[0].records,records);
});
test('merging personnel preserves roles and moves REC and EDIT assignments', () => {
 const source={id:'M',name:'Player',roles:['musician']},target={id:'E',name:'Editor',roles:['editor']};
 const pool=ref([{id:'T',musicianId:'M',editorId:'M'}]);const tasks=ref([{editorId:'M'}]);
 const settings={musicians:[source,target],projects:[],instruments:[]};
 const f=registerSettingsFeature({refs:{itemPool:pool,scheduledTasks:tasks,settingsExpandedGroups:new Set(),newSettingsItem:{},settingsGroupFocus:ref(null)},state:{settings},utils:{},actions:{openConfirmModal:(_t,_m,confirm)=>confirm(),pushHistory(){},autoUpdateEfficiency(){},openAlertModal(){}}});
 f.handleItemRename('musician',source,{target:{value:'Editor'}});assert.equal(pool.value[0].musicianId,'E');assert.equal(pool.value[0].editorId,'E');assert.equal(tasks.value[0].editorId,'E');assert.deepEqual(target.roles,['editor','musician']);
});
