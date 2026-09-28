import assert from 'node:assert/strict';
import test from 'node:test';
import { registerTourFeature } from '../app/scripts/features/tour.js';

for (const width of [390, 1440]) for (const initialOpen of [false, true]) test(`tour at ${width}px restores initially ${initialOpen ? "open" : "closed"} library`, async () => {
  let open=initialOpen,index=0,config;
  const button={getAttribute:()=>String(open),click:()=>{open=!open;}};
  const driver={setConfig:c=>{config=c;},drive:()=>{},getActiveIndex:()=>index,
    moveNext:()=>index++,movePrevious:()=>index--};
  const f=registerTourFeature({refs:{isMobile:{value:width<800},isSidebarOpen:{value:true},mobileTab:{value:'schedule'},showMobileTaskInput:{value:false},sidebarScrollRef:{value:null}},
    services:{storageService:{getItem(){},setItem(){},removeItem(){}}},actions:{getWindow:()=>({innerWidth:width}),getDocument:()=>({getElementById:id=>id==='library-toggle'?button:null}),setTimeoutFn:fn=>fn(),loadDriver:async()=>c=>{config=c;return driver;}}});
  await f.startTour();
  const entry=config.steps.findIndex(step=>step.element==='#library-toggle');
  assert.ok(entry>=0);
  index=entry;
  await config.onNextClick();
  assert.equal(open,true);
  assert.equal(config.steps[index].element,'#tour-library-tabs');
  while(config.steps[index]?.libraryStep) await config.onNextClick();
  assert.equal(open,false);
  await config.onPrevClick();
  assert.equal(open,true);
  config.onDestroyed();
  assert.equal(open,initialOpen);
});

test('leaving library restores Metadata and cancelling a pending transition cannot advance the tour', async () => {
  let open = false;
  let metadata = true;
  let index = 0;
  let config;
  const pending = [];
  const driver = {
    setConfig: value => { config = value; }, drive() {},
    getActiveIndex: () => index,
    moveNext: () => index++, movePrevious: () => index--,
  };
  const feature = registerTourFeature({
    refs: { isMobile: { value: true }, isSidebarOpen: {}, mobileTab: {}, showMobileTaskInput: {}, sidebarScrollRef: {} },
    services: { storageService: { getItem() {}, setItem() {}, removeItem() {} } },
    actions: {
      getWindow: () => ({ innerWidth: 390 }),
      getDocument: () => ({ getElementById(id) {
        if (id === 'library-toggle') return { getAttribute: () => String(open), click: () => { open = !open; } };
        if (id === 'library-back' && open && metadata) return { click: () => { metadata = false; } };
        if (id === 'tour-library-metadata' && open && !metadata) return { click: () => { metadata = true; } };
        return null;
      } }),
      setTimeoutFn: callback => pending.push(callback),
      loadDriver: async () => () => driver,
    },
  });
  await feature.startTour();
  index = config.steps.findIndex(step => step.element === '#library-toggle');
  const entering = config.onNextClick();
  assert.equal(open, true);
  pending.shift()();
  await Promise.resolve();
  assert.equal(metadata, false);
  pending.shift()();
  await entering;
  assert.equal(config.steps[index].element, '#tour-library-tabs');
  index = config.steps.findIndex(step => step.element === '#tour-library-metadata');
  const leaving = config.onNextClick();
  assert.equal(metadata, true);
  assert.equal(open, false);
  pending.shift()();
  await leaving;
  const before = index;
  const returning = config.onPrevClick();
  config.onDestroyed();
  pending.shift()();
  await returning;
  assert.equal(index, before);
  assert.equal(open, false);
  assert.equal(metadata, true);
});
