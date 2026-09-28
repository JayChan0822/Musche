import test from 'node:test';
import assert from 'node:assert/strict';
import {ref,nextTick} from 'vue';
import {registerMainViewNavigationFeature} from '../app/scripts/features/main-view-navigation.js';
test('command wheel scales week time axis and preserves pointer time',async()=>{
 const container={scrollTop:300,clientHeight:600,firstElementChild:{offsetHeight:56},contains:()=>true,getBoundingClientRect:()=>({top:0})};
 const refs={currentView:ref('week'),monthViewMode:ref('grid'),viewDate:ref(new Date()),dayColWidth:ref(80),slotHeight:ref(40),weekContainer:ref(container),isMobile:ref(false),isResizingMobile:ref(false),currentSessionId:ref('S'),sidebarTab:ref('musician'),flashingTaskId:ref(null),isContextSwitching:ref(false)};
 const f=registerMainViewNavigationFeature({refs,services:{storageService:{getItem(){},setItem(){}}}});
 let prevented=0;const event={metaKey:true,deltaY:-100,deltaX:0,deltaMode:0,clientY:200,target:{},preventDefault:()=>prevented++};
 const anchor=(300+200-56)/40;
 f.onMainWheel(event);await nextTick();
 assert.ok(refs.slotHeight.value>40);assert.equal(prevented,1);
 assert.ok(Math.abs((refs.weekContainer.value.scrollTop+200-56)/refs.slotHeight.value-anchor)<0.001);
 const height=refs.slotHeight.value;
 f.onMainWheel({...event,metaKey:false});assert.equal(refs.slotHeight.value,height);
 refs.currentView.value='month';f.onMainWheel(event);assert.equal(refs.slotHeight.value,height);
});
