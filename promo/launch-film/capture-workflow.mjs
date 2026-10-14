import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Product capture only. Every browser context is isolated and has no signed-in account.
// Changes are made to fictional local sample data; application source is never changed.
const out=join(dirname(fileURLToPath(import.meta.url)),'assets-v2/workflow');
mkdirSync(out,{recursive:true});
const date='2026-10-06';
const finishOnly=process.argv.includes('--finish');
const settings={startHour:8,endHour:20,lastSessionId:'S_A',sessions:[{id:'S_A',name:'Session A'},{id:'S_B',name:'Session B'}],
 musicians:[{id:'M_A',name:'Player A',color:'#a855f7',defaultRatio:20,roles:['musician']},{id:'M_B',name:'Player B',color:'#eab308',defaultRatio:20,roles:['musician','editor']}],
 projects:[{id:'P_A',name:'Project A',title:'Project A',composer:'Composer A',arranger:'Arranger A',mixingEngineer:'Engineer B',mixingStudio:'Studio B',producer:'Producer A',color:'#eab308'},{id:'P_B',name:'Project B',title:'Project B',color:'#eab308'}],
 instruments:[{id:'I_A',name:'Instrument A',color:'#60a5fa'},{id:'I_B',name:'Instrument B',color:'#60a5fa'}],studios:[{id:'ST_A',name:'Studio A'}],engineers:[{id:'EN_A',name:'Engineer A'}],operators:[{id:'OP_A',name:'Operator A'}],assistants:[{id:'AS_A',name:'Assistant A'}]};
const makeTask=(id,sessionId,musicianId,projectId,instrumentId,musicDuration,estDuration)=>({id,name:instrumentId==='I_A'?'Instrument A':'Instrument B',sessionId,musicianId,editorId:'M_B',projectId,instrumentId,musicDuration,estDuration,ratio:20,ratios:{musician:20,project:20,instrument:null},trackCount:1,sectionIndex:0,records:{musician:{},project:{},instrument:{}}});
const seed={schemaVersion:10,settings,pool:[makeTask('T_A','S_A','M_A','P_A','I_A','03:00','01:00:00'),makeTask('T_B','S_B','M_B','P_B','I_B','02:00','00:40:00')],tasks:[{scheduleId:'REC_B',templateId:'T_B',sessionId:'S_B',stage:'rec',musicianId:'M_B',projectId:'P_B',instrumentId:'I_B',musicDuration:'02:00',estDuration:'00:40:00',ratio:20,date:'2026-10-08',startTime:'13:00'}]};
if(finishOnly)seed.tasks.push({scheduleId:'REC_A',templateId:'T_A',sessionId:'S_A',stage:'rec',musicianId:'M_A',assigneeId:'M_A',projectId:'P_A',instrumentId:'I_A',date,startTime:'10:00',estDuration:'01:30:00',musicDuration:'03:00',ratio:30});
const manifest=finishOnly?JSON.parse(readFileSync(join(out,'manifest.json'),'utf8')):{source:'Actual Musche local application; original rendered UI and actual drag/resize/session/credits interactions. Fictional A/B sample data in an isolated browser context.',viewport:{width:1920,height:1080},pixelRatio:2,assets:[],states:[],notes:[]};
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:manifest.viewport,deviceScaleFactor:2,colorScheme:'light',permissions:['clipboard-read','clipboard-write']});
await context.addInitScript(seed=>{localStorage.setItem('v10_data',JSON.stringify(seed));localStorage.setItem('theme_mode','light');localStorage.setItem('musche_sidebar_open','true');localStorage.setItem('musche_tour_seen','true');},seed);
const page=await context.newPage();
page.on('pageerror',error=>console.log('PAGE_ERROR',error.message));
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await page.locator('#main-content').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);

const save=()=>writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2));
const capture=async(name,selector,{isolated=false,hide=[],scale=1,description=''}={})=>{
 const loc=page.locator(selector).first();await loc.waitFor({state:'visible'});const b=await loc.boundingBox();
 const file=`${name}.png`;
 if(isolated){
  const snap=await loc.evaluate((el,{hide,scale})=>{
   const b=el.getBoundingClientRect(),clone=el.cloneNode(true),originals=[el,...el.querySelectorAll('*')],clones=[clone,...clone.querySelectorAll('*')];
   for(let i=0;i<originals.length;i++){const cs=getComputedStyle(originals[i]);let text='';for(const key of cs)text+=key+':'+cs.getPropertyValue(key)+';';clones[i].style.cssText=text;clones[i].style.animation='none';clones[i].style.transition='none';if(originals[i].tagName==='INPUT')clones[i].setAttribute('value',originals[i].value);if(originals[i].tagName==='TEXTAREA')clones[i].textContent=originals[i].value;if(originals[i].tagName==='SELECT')for(let j=0;j<originals[i].options.length;j++){if(originals[i].options[j].selected)clones[i].options[j].setAttribute('selected','');else clones[i].options[j].removeAttribute('selected');}}
   for(const s of hide)for(const n of clone.querySelectorAll(s))n.style.opacity='0';
   clone.style.cssText+=`;position:relative;left:0;right:auto;top:0;bottom:auto;margin:0;transform:scale(${scale});transform-origin:0 0;animation:none;transition:none;opacity:1;visibility:visible;width:${b.width}px;height:${b.height}px;`;
   return{html:clone.outerHTML,width:Math.ceil(b.width*scale),height:Math.ceil(b.height*scale),css:[...document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.href),inline:[...document.querySelectorAll('style')].map(e=>e.textContent)};
  },{hide,scale});
  const stage=await context.newPage();await stage.setViewportSize({width:Math.max(1,snap.width),height:Math.max(1,snap.height)});
  await stage.setContent(`<!doctype html><html><head>${snap.css.map(url=>`<link rel="stylesheet" href="${url}">`).join('')}<style>${snap.inline.join('\n')}html,body{margin:0!important;padding:0!important;background:transparent!important;width:100%!important;height:100%!important;overflow:hidden!important}</style></head><body>${snap.html}</body></html>`);
  await stage.evaluate(()=>document.fonts.ready);await stage.waitForTimeout(50);await stage.screenshot({path:join(out,file),omitBackground:true});await stage.close();
 }else{
  if(hide.length)await page.evaluate(hide=>hide.forEach(s=>document.querySelectorAll(s).forEach(el=>el.style.opacity='0')),hide);
  await loc.screenshot({path:join(out,file),animations:'disabled'});
  if(hide.length){await page.evaluate(hide=>hide.forEach(s=>document.querySelectorAll(s).forEach(el=>el.style.opacity='')),hide);await page.waitForTimeout(400);}
 }
 const bytes=readFileSync(join(out,file));
 manifest.assets=manifest.assets.filter(a=>a.name!==name);manifest.assets.push({name,file,sourceSelector:selector,description,transparent:isolated,bounds:b,scale,pixels:{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}});save();console.log('CAPTURE',name,Math.round(b.width),Math.round(b.height));
};
const state=async(name)=>{
 const state=await page.evaluate(()=>{const p=document.querySelector('#app').__vue_app__._instance.proxy;const s=p.appRootShell.appSidebar;return{sidebarTab:s.sidebarTab,stats:s.filteredSidebarList.map(s=>({id:s.id,name:s.name,ratioComparison:s.ratioComparison,scheduledSeconds:s.scheduledSeconds,totalDuration:s.totalDuration})),session:p.appRootShell.appHeader.currentSessionName};});
 manifest.states.push({name,...state});save();console.log('STATE',name,JSON.stringify(state));
};
if(process.argv.includes('--probe')){console.log(await page.evaluate(()=>{const p=document.querySelector('#app').__vue_app__._instance.proxy;return{root:Object.keys(p.appRootShell),main:Object.keys(p.appRootShell.appMainContent),overlays:Object.keys(p.appRootOverlaysShell),text:document.body.innerText.slice(0,2500)};}));await browser.close();process.exit(0);}

// Actual New Task flow defaults to the instrument name. Keep that identity throughout.
await page.locator('#tour-view-switch').click();await page.locator('.calendar-week-view').waitFor();await page.waitForTimeout(450);
const pxPerMin=await page.evaluate(()=>document.querySelector('#app').__vue_app__._instance.proxy.appRootShell.appMainContent.slotHeight/30);
if(!finishOnly){
await capture('rec-before-full','#app');
await capture('rec-before-calendar','#main-content');
await capture('rec-before-stat','[data-stat-id="M_A"]',{isolated:true});
await capture('rec-before-ratio','[data-stat-id="M_A"] [aria-label="查看平均与安排倍率"]',{isolated:true,scale:3});
await state('before-schedule');
await page.locator('[data-stat-id="M_A"]').click();await page.waitForTimeout(150);
const pool=page.locator('[data-stat-id="M_A"] [draggable="true"]').first();await pool.evaluate(el=>el.setAttribute('data-capture-pool','true'));
await capture('pool-expanded','[data-stat-id="M_A"]',{isolated:true});
await capture('pool-task','[data-capture-pool]',{isolated:true,scale:2});
await capture('sidebar-before','#sidebar');

// Native drag event sequence invokes Musche's existing drop handler with an actual grid point.
const grid=page.locator(`[data-date-str="${date}"] [data-week-grid]`);
const drop=grid.locator('.grid-slot').first();
const gridBox=await grid.boundingBox();
const dropPoint={x:gridBox.x+gridBox.width/2,y:gridBox.y+120*pxPerMin};
const dt=await page.evaluateHandle(()=>new DataTransfer());
await pool.dispatchEvent('dragstart',{dataTransfer:dt,clientX:180,clientY:390});
await drop.dispatchEvent('dragenter',{dataTransfer:dt,clientX:dropPoint.x,clientY:dropPoint.y});
await drop.dispatchEvent('dragover',{dataTransfer:dt,clientX:dropPoint.x,clientY:dropPoint.y});
await drop.dispatchEvent('drop',{dataTransfer:dt,clientX:dropPoint.x,clientY:dropPoint.y});
await pool.dispatchEvent('dragend',{dataTransfer:dt});
await page.locator('.calendar-week-view .task-block:not(.is-ghost)').waitFor();
await page.waitForFunction(()=>document.querySelector('[data-stat-id="M_A"] [aria-label="查看平均与安排倍率"]').textContent.includes('20.0'));
await page.waitForTimeout(450);
await page.mouse.move(1880,80);
const block='.calendar-week-view .task-block:not(.is-ghost):has-text("Player A")';
await capture('rec-60-full','#app');await capture('rec-60-calendar','#main-content');
await capture('rec-calendar-clean','#main-content',{hide:['.task-block']});
await capture('rec-60-block',block,{isolated:true});
await capture('rec-60-stat','[data-stat-id="M_A"]',{isolated:true});
await capture('rec-60-ratio','[data-stat-id="M_A"] [aria-label="查看平均与安排倍率"]',{isolated:true,scale:3});
await state('scheduled-60');
await page.locator('[data-stat-id="M_A"] [aria-label="查看平均与安排倍率"]').click();
await capture('ratio-60-popover','[aria-label="倍率详情"]',{isolated:true,scale:2});await page.keyboard.press('Escape');

// One real Meta-modified resize gesture, sampled each minute for perfectly matched
// duration / ratio animation. Musche's live computed sidebar supplies every badge.
const handle=page.locator(block+' .resize-handle');const hb=await handle.boundingBox();
await page.keyboard.down('Meta');await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await page.mouse.down();
for(let minutes=61;minutes<=90;minutes++){
 await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2+(minutes-60)*pxPerMin,{steps:2});await page.waitForTimeout(20);
 await capture(`rec-${minutes}-ratio`,'[data-stat-id="M_A"] [aria-label="查看平均与安排倍率"]',{isolated:true,scale:3});
 if([75,90].includes(minutes)){
  await capture(`rec-${minutes}-full`,'#app');await capture(`rec-${minutes}-block`,block,{isolated:true});
  await capture(`rec-${minutes}-stat`,'[data-stat-id="M_A"]',{isolated:true});await state(`resized-${minutes}`);
 }
}
await page.mouse.up();await page.keyboard.up('Meta');await page.mouse.move(1880,80);await page.waitForTimeout(150);
await page.locator('[data-stat-id="M_A"] [aria-label="查看平均与安排倍率"]').click();await capture('ratio-90-popover','[aria-label="倍率详情"]',{isolated:true,scale:2});await page.keyboard.press('Escape');
await capture('rec-90-calendar','#main-content');
}

// Both stages use the same real task. EDIT is assigned to Player B.
await capture('rec-tabs','#tour-new-task + div',{isolated:true,scale:2});
await page.locator('#sidebar button').filter({hasText:/^\s*EDIT\s*$/}).click();await page.waitForTimeout(450);
await capture('edit-tabs','#tour-new-task + div',{isolated:true,scale:2});
await capture('edit-before-full','#app');await capture('edit-before-sidebar','#sidebar');
await page.locator('[data-stat-id="M_B"]').click();await page.waitForTimeout(150);
const editPool=page.locator('[data-stat-id="M_B"] [draggable="true"]').first();
const editGrid=page.locator('[data-date-str="2026-10-07"] [data-week-grid] .grid-slot').first();const eb=await page.locator('[data-date-str="2026-10-07"] [data-week-grid]').boundingBox();
const editPoint={x:eb.x+eb.width/2,y:eb.y+300*pxPerMin};const edt=await page.evaluateHandle(()=>new DataTransfer());
await editPool.dispatchEvent('dragstart',{dataTransfer:edt,clientX:180,clientY:390});await editGrid.dispatchEvent('drop',{dataTransfer:edt,clientX:editPoint.x,clientY:editPoint.y});await editPool.dispatchEvent('dragend',{dataTransfer:edt});await page.waitForTimeout(300);
await capture('edit-after-full','#app');await capture('edit-after-calendar','#main-content');await capture('edit-after-block','.calendar-week-view .task-block:not(.is-ghost):has-text("Player B")',{isolated:true});await capture('edit-after-stat','[data-stat-id="M_B"]',{isolated:true});await state('edit-scheduled');

await page.locator('#sidebar button').filter({hasText:/^\s*REC\s*$/}).click();await page.waitForTimeout(350);
await page.locator('#tour-session-select > button').click();await page.waitForTimeout(250);await capture('session-menu','#tour-session-select .custom-dropdown-menu',{isolated:true});await capture('session-dropdown','#tour-session-select .custom-dropdown-menu',{isolated:true});await capture('session-menu-full','#app');
await page.locator('#tour-session-select .custom-dropdown-menu').getByText('Session B',{exact:true}).click();await page.waitForTimeout(600);
await capture('session-b-full','#app');await capture('session-b-label','#tour-session-select',{isolated:true,scale:2});await state('session-b');
await page.locator('#tour-session-select > button').click();await page.locator('#tour-session-select .custom-dropdown-menu').getByText('Session A',{exact:true}).click();await page.waitForTimeout(500);

// Populate real production metadata in sample data via exposed Vue objects before invoking actual Credit action.
await page.evaluate(()=>{
 const p=document.querySelector('#app').__vue_app__._instance.proxy;
 const main=p.appRootShell.appMainContent;
 for(const task of Object.values(main.tasksByDateMap).flat()){if(task.stage==='rec')task.recordingInfo={studio:'Studio A',engineer:'Engineer A',operator:'Operator A',assistant:'Assistant A'};if(task.stage==='edit')task.editInfo={engineer:'Player B'};}
});
await page.locator('header button').first().click();await page.waitForTimeout(500);await capture('export-menu','.menu-shortcuts-dropdown',{isolated:true,scale:2});
const creditEntry=page.locator('.menu-shortcuts-dropdown button').filter({hasText:'导出 Credit'});await creditEntry.scrollIntoViewIfNeeded();await creditEntry.evaluate(el=>el.setAttribute('data-credit-entry','true'));await capture('credits-entry-button','[data-credit-entry]',{isolated:true,scale:4});
await page.locator('.menu-shortcuts-dropdown button').filter({hasText:'导出 Credit'}).click();await page.locator('.modal-window h3').filter({hasText:'Project Credits'}).waitFor();await page.waitForTimeout(250);
await capture('credits-full','#app');await capture('credits-modal','.modal-window',{isolated:true});
await capture('credits-copy-button','.modal-window button:has(i.fa-copy)',{isolated:true,scale:3});
const creditText=await page.locator('.modal-window textarea').inputValue();manifest.creditsText=creditText;save();
await page.locator('.modal-window button').filter({hasText:'复制全部'}).click();await page.waitForTimeout(150);
manifest.copiedText=await page.evaluate(()=>navigator.clipboard.readText());manifest.notes.push('Credits actual output is editable generated text with Copy All; no separate Credits file-export preview exists.');
await capture('credits-copied-modal','.modal-window',{isolated:true});
await page.locator('.modal-window textarea').evaluate(el=>el.scrollTop=el.scrollHeight);await capture('credits-post-production','.modal-window',{isolated:false});
save();await browser.close();console.log(`Workflow capture complete: ${manifest.assets.length} assets`);
