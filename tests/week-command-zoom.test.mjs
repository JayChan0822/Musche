import test from 'node:test';
import assert from 'node:assert/strict';
import {ref,nextTick} from 'vue';
import {registerMainViewNavigationFeature} from '../app/scripts/features/main-view-navigation.js';

test('wide-screen column expansion exceeds the fitted day width and toggles back', () => {
 const writes=[];
 const container={clientWidth:1890,firstElementChild:{firstElementChild:{offsetWidth:70}}};
 const refs={currentView:ref('week'),monthViewMode:ref('scrolled'),viewDate:ref(new Date()),dayColWidth:ref(52),weekContainer:ref(container),isMobile:ref(false)};
 const f=registerMainViewNavigationFeature({refs,services:{storageService:{setItem:(...args)=>writes.push(args)}},actions:{getWindow:()=>({innerWidth:1920})}});
 f.cycleDayWidth();
 assert.ok(refs.dayColWidth.value>260,'expanded columns must be wider than their current fitted width');
 assert.equal(f.widthIcon.value,'fa-compress');
 f.cycleDayWidth();
 assert.equal(refs.dayColWidth.value,52);
 assert.equal(f.widthIcon.value,'fa-expand');
 assert.equal(writes.length,2);
});

test('slider zoom preserves the visible center time across rapid updates and shares wheel scale', async () => {
 const container={scrollTop:300,clientHeight:600,firstElementChild:{offsetHeight:56},contains:()=>true,getBoundingClientRect:()=>({top:0})};
 const refs={currentView:ref('week'),slotHeight:ref(40),weekContainer:ref(container),isMobile:ref(false),isResizingMobile:ref(false),resizing:ref(null)};
 const f=registerMainViewNavigationFeature({refs});
 const offset=56+(600-56)/2;
 const anchor=(300+offset-56)/40;
 f.setWeekZoom('60'); f.setWeekZoom('80');
 await nextTick();
 assert.equal(refs.slotHeight.value,80);
 assert.ok(Math.abs((refs.weekContainer.value.scrollTop+offset-56)/80-anchor)<0.001);
 f.onMainWheel({metaKey:true,deltaY:-20,deltaX:0,deltaMode:0,clientY:offset,target:{},preventDefault(){}});
 await nextTick();
 assert.ok(refs.slotHeight.value>80);
 assert.ok(Math.abs((refs.weekContainer.value.scrollTop+offset-56)/refs.slotHeight.value-anchor)<0.001);
});

test('slider clamps scale and ignores invalid input, other views, and resizing', async () => {
 const refs={currentView:ref('week'),slotHeight:ref(40),weekContainer:ref({scrollTop:300,clientHeight:600,firstElementChild:{offsetHeight:56}}),isMobile:ref(false),isResizingMobile:ref(false),resizing:ref(null)};
 const f=registerMainViewNavigationFeature({refs});
 f.setWeekZoom(999); assert.equal(refs.slotHeight.value,120);
 f.setWeekZoom(0); assert.equal(refs.slotHeight.value,16);
 f.setWeekZoom('bad'); assert.equal(refs.slotHeight.value,16);
 refs.resizing.value={}; f.setWeekZoom(80); assert.equal(refs.slotHeight.value,16);
 refs.resizing.value=null; refs.currentView.value='month'; f.setWeekZoom(80); assert.equal(refs.slotHeight.value,16);
 await nextTick();
});
test('command wheel scales week time axis and preserves pointer time',async()=>{
 const container={scrollTop:300,clientHeight:600,firstElementChild:{offsetHeight:56},contains:()=>true,getBoundingClientRect:()=>({top:0})};
 const refs={currentView:ref('week'),monthViewMode:ref('grid'),viewDate:ref(new Date()),dayColWidth:ref(80),slotHeight:ref(40),weekContainer:ref(container),isMobile:ref(false),isResizingMobile:ref(false),currentSessionId:ref('S'),sidebarTab:ref('musician'),flashingTaskId:ref(null),isContextSwitching:ref(false)};
 const f=registerMainViewNavigationFeature({refs,services:{storageService:{getItem(){},setItem(){}}}});
 let prevented=0;const event={metaKey:true,deltaY:-100,deltaX:0,deltaMode:0,clientY:200,target:{},preventDefault:()=>prevented++};
 const anchor=(300+200-56)/40;
 f.onMainWheel(event);await nextTick();
 assert.ok(refs.slotHeight.value>40);assert.equal(prevented,1);
 assert.ok(Math.abs((refs.weekContainer.value.scrollTop+200-56)/refs.slotHeight.value-anchor)<0.001);
 // Trackpads may deliver another event before Vue applies the previous layout.
 f.onMainWheel(event);
 f.onMainWheel(event);
 await nextTick();
 assert.ok(Math.abs((refs.weekContainer.value.scrollTop+200-56)/refs.slotHeight.value-anchor)<0.001, 'batched wheel events must preserve the original pointer time');
 const height=refs.slotHeight.value;
 f.onMainWheel({...event,metaKey:false});assert.equal(refs.slotHeight.value,height);
 refs.currentView.value='month';f.onMainWheel(event);assert.equal(refs.slotHeight.value,height);
});

test('Command wheel does not change the time scale during a task resize', async () => {
 const container={scrollTop:100,clientHeight:600,firstElementChild:{offsetHeight:56},contains:()=>true,getBoundingClientRect:()=>({top:0})};
 const refs={currentView:ref('week'),monthViewMode:ref('grid'),viewDate:ref(new Date()),slotHeight:ref(40),weekContainer:ref(container),isMobile:ref(false),isResizingMobile:ref(false),resizing:ref({task:{}})};
 const f=registerMainViewNavigationFeature({refs});
 f.onMainWheel({metaKey:true,deltaY:-100,deltaX:0,deltaMode:0,clientY:200,target:{},preventDefault(){}});
 await nextTick();
 assert.equal(refs.slotHeight.value,40);
 assert.equal(refs.weekContainer.value.scrollTop,100);
});

test('high-frequency zoom input renders once per frame and cancels on view change', async () => {
 const frames = new Map(); let id = 0;
 const container = { scrollTop:300, clientHeight:600, firstElementChild:{offsetHeight:56}, contains:()=>true, getBoundingClientRect:()=>({top:0}) };
 const refs = {currentView:ref('week'),slotHeight:ref(40),weekContainer:ref(container),isMobile:ref(false),isResizingMobile:ref(false)};
 const f = registerMainViewNavigationFeature({refs,actions:{requestFrame:cb=>{frames.set(++id,cb);return id;},cancelFrame:id=>frames.delete(id)}});
 const event = {metaKey:true,deltaY:-10,deltaX:0,deltaMode:0,clientY:200,target:{},preventDefault(){}};
 for(let i=0;i<5;i++) f.onMainWheel(event);
 assert.equal(frames.size,1);
 assert.equal(refs.slotHeight.value,40);
 const callback = [...frames.values()][0]; frames.clear(); callback();
 await nextTick();
 assert.ok(Math.abs(refs.slotHeight.value - 40*Math.exp(.15))<1e-8);
 assert.ok(Math.abs((refs.weekContainer.value.scrollTop+200-56)/refs.slotHeight.value-(300+200-56)/40)<1e-8);
 f.setWeekZoom(100);
 refs.currentView.value='month';
 assert.equal(frames.size,0);
});

test('horizontal navigation groups inertia and accepts prompt reversal and new gestures', () => {
 let time = 0; const changes = [];
 const refs = {currentView:ref('month'),isMobile:ref(false)};
 const f = registerMainViewNavigationFeature({refs,actions:{now:()=>time,changeDate:dir=>changes.push(dir)}});
 const wheel = deltaX => {time += 16; f.onMainWheel({deltaX,deltaY:0,preventDefault(){}});};
 wheel(12); wheel(16); wheel(18);
 assert.deepEqual(changes,[1]);
 wheel(60); wheel(20); wheel(4);
 assert.deepEqual(changes,[1], 'momentum must not turn another page');
 wheel(-45);
 assert.deepEqual(changes,[1,-1], 'reversal must not wait for a fixed lock');
 time += 170; wheel(-45);
 assert.deepEqual(changes,[1,-1,-1]);
});
