import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, copyFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), 'assets');
mkdirSync(out,{recursive:true});
const browser = await chromium.launch({headless:true});
const extras=process.argv.includes('--extras');
const manifest=extras&&existsSync(join(out,'manifest.json'))?JSON.parse(readFileSync(join(out,'manifest.json'),'utf8')):{source:'Real local Musche application at http://127.0.0.1:5173; original DOM, CSS, icons and wordmark. Fictional sample recording data only.',viewport:{width:1920,height:1080},pixelRatio:2,assets:[],features:['Week and month calendar views','Drag tasks from pool into time slots','Drag task edges to adjust duration','Musician / project / instrument task grouping','Recording track lists with duration, split and section controls','MIDI / CSV import controls']};

for (const theme of ['light','dark']) {
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:2,colorScheme:theme});
  await context.addInitScript(({theme})=>{
    const now=new Date(); const sunday=new Date(now); sunday.setDate(now.getDate()-now.getDay());
    const date=n=>{const d=new Date(sunday);d.setDate(sunday.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
    const musicians=[
      {id:'M_STR',name:'弦乐组',defaultRatio:20,color:'#a855f7',roles:['musician']},
      {id:'M_PNO',name:'钢琴',defaultRatio:20,color:'#a855f7',roles:['musician']},
      {id:'M_WND',name:'木管组',defaultRatio:20,color:'#a855f7',roles:['musician']},
      {id:'M_ENS',name:'室内乐',defaultRatio:20,color:'#a855f7',roles:['musician']},
      {id:'M_CEL',name:'大提琴',defaultRatio:20,color:'#a855f7',roles:['musician']},
      {id:'M_VLN',name:'独奏小提琴',defaultRatio:20,color:'#a855f7',roles:['musician']},
    ];
    const projects=[{id:'P_FILM',name:'电影配乐',color:'#eab308'},{id:'P_CONCERT',name:'秋日协奏曲',color:'#eab308'},{id:'P_QUARTET',name:'弦乐四重奏',color:'#eab308'}];
    const instruments=[{id:'I_VLN',name:'小提琴',color:'#60a5fa'},{id:'I_PNO',name:'钢琴',color:'#60a5fa'},{id:'I_CEL',name:'大提琴',color:'#60a5fa'},{id:'I_FLT',name:'长笛',color:'#60a5fa'}];
    const rows=[
      ['T1','序曲 · 第一主题','M_STR','P_FILM','I_VLN',4,3,1,'10:00','01:30:00'],
      ['T2','钢琴独奏 · 第二乐章','M_PNO','P_CONCERT','I_PNO',1,4,2,'11:30','02:00:00'],
      ['T3','晨光 · 木管段落','M_WND','P_FILM','I_FLT',3,3,3,'09:00','01:30:00'],
      ['T4','秋日四重奏','M_ENS','P_QUARTET','I_CEL',4,6,4,'13:00','02:00:00'],
      ['T5','大提琴独奏 · 尾声','M_CEL','P_FILM','I_CEL',1,3,5,'10:30','01:30:00'],
      ['T6','独奏小提琴 · 主旋律','M_VLN','P_FILM','I_VLN',1,3,6,'14:00','01:30:00'],
      ['T7','终章 · 弦乐重奏','M_STR','P_FILM','I_VLN',6,4,3,'14:00','02:00:00'],
      ['T8','夜色 · 弦乐铺底','M_STR','P_FILM','I_VLN',4,2,2,'','00:40:00'],
      ['T9','月光 · 弦乐拨奏','M_STR','P_FILM','I_VLN',4,2,4,'','00:40:00'],
      ['T10','片尾 · 弦乐合奏','M_STR','P_FILM','I_VLN',4,2,5,'','00:40:00'],
    ];
    const pool=rows.map(([id,name,musicianId,projectId,instrumentId,trackCount,minutes])=>({id,name,sessionId:'S_DEFAULT',musicianId,projectId,instrumentId,musicDuration:`0${minutes}:00`,estDuration:`00:${String(minutes*20).padStart(2,'0')}:00`,ratio:20,trackCount,records:{musician:{},project:{},instrument:{}}}));
    const tasks=rows.filter(r=>r[8]).map(([id,name,musicianId,projectId,instrumentId,trackCount,minutes,day,startTime,estDuration])=>({scheduleId:`S-${id}`,templateId:id,sessionId:'S_DEFAULT',stage:'rec',musicianId,projectId,instrumentId,date:date(day),startTime,estDuration,trackCount,ratio:20,musicDuration:`0${minutes}:00`}));
    const settings={startHour:8,endHour:20,sessions:[{id:'S_DEFAULT',name:'秋日 · 电影配乐'}],musicians,projects,instruments,studios:[],engineers:[],operators:[],assistants:[],lastSessionId:'S_DEFAULT'};
    localStorage.setItem('v10_data',JSON.stringify({schemaVersion:10,pool,tasks,settings}));
    localStorage.setItem('musche_sidebar_open','true');localStorage.setItem('theme_mode',theme);localStorage.setItem('musche_tour_seen','true');
  },{theme});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.locator('#main-content').waitFor({state:'visible'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(1200);
  const capture=async(name,selector,{isolated=false,hide=[],style='',scale=1}={})=>{
    const loc=page.locator(selector).first();
    await loc.waitFor({state:'visible'});
    const box=await loc.boundingBox();
    const filename=`${theme}-${name}.png`;
    if(hide.length)await page.evaluate(hide=>hide.forEach(s=>document.querySelectorAll(s).forEach(el=>el.style.opacity='0')),hide);
    if(isolated){
      const snap=await loc.evaluate((el,{style,scale,hide})=>{
        const b=el.getBoundingClientRect();
        const clone=el.cloneNode(true), originals=[el,...el.querySelectorAll('*')], clones=[clone,...clone.querySelectorAll('*')];
        for(let i=0;i<originals.length;i++){const cs=getComputedStyle(originals[i]);let text='';for(const key of cs)text+=key+':'+cs.getPropertyValue(key)+';';clones[i].style.cssText=text;}
        for(const s of hide)for(const n of clone.querySelectorAll(s)){n.style.opacity='0';n.style.transition='none';}
        clone.style.cssText+=`;position:relative;left:0;right:auto;top:0;bottom:auto;margin:0;transform:scale(${scale});transform-origin:0 0;animation:none;transition:none;width:${b.width}px;height:${b.height}px;${style}`;
        const css=[...document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.href);
        const inline=[...document.querySelectorAll('style')].map(e=>e.textContent);
        return{html:clone.outerHTML,width:Math.ceil(b.width*scale),height:Math.ceil(b.height*scale),css,inline};
      },{style,scale,hide});
      const stage=await context.newPage();
      await stage.setViewportSize({width:Math.max(1,snap.width),height:Math.max(1,snap.height)});
      await stage.setContent(`<!doctype html><html class="${theme==='dark'?'dark':''}"><head>${snap.css.map(url=>`<link rel="stylesheet" href="${url}">`).join('')}<style>${snap.inline.join('\n')}html,body{margin:0!important;padding:0!important;background:transparent!important;width:100%!important;height:100%!important;overflow:hidden!important}</style></head><body>${snap.html}</body></html>`);
      await stage.evaluate(()=>document.fonts.ready);await stage.waitForTimeout(100);
      await stage.screenshot({path:join(out,filename),omitBackground:true});await stage.close();
    }else{
      await loc.screenshot({path:join(out,filename),animations:'disabled'});
    }
    if(hide.length)await page.evaluate(hide=>hide.forEach(s=>document.querySelectorAll(s).forEach(el=>el.style.opacity='')),hide);
    manifest.assets=manifest.assets.filter(a=>a.name!==`${theme}-${name}`);
    manifest.assets.push({name:`${theme}-${name}`,file:filename,theme,sourceSelector:selector,transparent:isolated,bounds:box,pixels:{width:Math.ceil(box.width*scale)*2,height:Math.ceil(box.height*scale)*2}});
    writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2));
    console.log(filename,Math.round(box.width),Math.round(box.height));
  };
  if(extras){
    await capture('wordmark-large','header h1',{isolated:true,scale:6});
    await capture('view-switch','#tour-view-switch',{isolated:true,scale:4});
    await capture('new-task','#sidebar button',{isolated:true,scale:2});
    await page.locator('#tour-view-switch').click();
    await page.locator('.calendar-week-view').waitFor({state:'visible'});await page.waitForTimeout(650);
    await page.locator('.calendar-week-view .task-block').filter({hasText:'弦乐组'}).first().dblclick();
    await page.locator('.modal-window').waitFor({state:'visible'});await page.waitForTimeout(300);
    await capture('tracks-empty','.modal-window',{isolated:true,hide:['.track-card']});
    await context.close();continue;
  }
  await capture('month-full','#app');
  await capture('month-calendar','#main-content');
  await capture('wordmark','header h1',{isolated:true});
  await capture('header','header');
  await page.locator('#tour-view-switch').click();
  await page.locator('.calendar-week-view').waitFor({state:'visible'});
  await page.waitForTimeout(650);
  await page.locator('.calendar-week-view').evaluate(el=>el.scrollTop=0);
  await capture('week-full','#app');
  await capture('week-calendar','#main-content');
  await capture('week-background','#main-content',{hide:['.task-block']});
  await capture('week-grid','.calendar-week-view',{hide:['.task-block']});
  await capture('toolbar','#main-content > div:first-child',{isolated:true});
  await capture('sidebar','#sidebar');
  const count=await page.locator('.calendar-week-view .task-block').count();
  for(let i=0;i<count;i++)await capture(`task-${i}`,`.calendar-week-view .task-block >> nth=${i}`,{isolated:true});
  for(const id of ['M_STR','M_PNO','M_WND','M_ENS','M_CEL','M_VLN'])await capture(`stat-${id}`,`[data-stat-id="${id}"]`,{isolated:true});
  await page.locator('[data-stat-id="M_STR"]').click();await page.waitForTimeout(250);
  await capture('pool-expanded','[data-stat-id="M_STR"]',{isolated:true});
  const pending=page.getByText('夜色 · 弦乐铺底',{exact:true});
  if(await pending.count()){
    const parent=pending.locator('xpath=ancestor::*[@draggable="true"][1]');await parent.evaluate(el=>el.setAttribute('data-capture-pool','true'));
    await capture('pool-card','[data-capture-pool]',{isolated:true});
  }
  await page.locator('.calendar-week-view .task-block').filter({hasText:'弦乐组'}).first().dblclick();
  await page.locator('.modal-window').waitFor({state:'visible'});await page.waitForTimeout(300);
  await capture('tracks-modal','.modal-window',{isolated:true});
  await capture('tracks-empty','.modal-window',{hide:['.track-card']});
  const tracks=await page.locator('.track-card').count();
  for(let i=0;i<tracks;i++)await capture(`track-${i}`,`.track-card >> nth=${i}`,{isolated:true});
  await context.close();
}
copyFileSync(join(dirname(out),'../../icon/icon.png'),join(out,'musche-icon.png'));
for(const asset of manifest.assets){const b=readFileSync(join(out,asset.file));asset.pixels={width:b.readUInt32BE(16),height:b.readUInt32BE(20)};}
manifest.icon={file:'musche-icon.png',pixels:{width:1024,height:1024},source:'icon/icon.png'};
writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2));
await browser.close();
console.log('Wrote '+manifest.assets.length+' product assets.');
