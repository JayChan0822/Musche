import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const fourK = process.argv.includes('--4k');
const output = resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : join(root, fourK ? 'musche-film-60s-4k.mp4' : 'musche-film-60s.mp4'));
const width = 1920, height = 1080;
const exportWidth = fourK ? 3840 : width, exportHeight = fourK ? 2160 : height;
const filmLength = 60;
const temp = mkdtempSync(join(tmpdir(), 'musche-film-'));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: fourK ? 2 : 1,
  recordVideo: { dir: temp, size: { width: exportWidth, height: exportHeight } } });

// Sample content uses Musche's own schema and only populates the real product UI.
await context.addInitScript(() => {
  const now = new Date(); const sunday = new Date(now); sunday.setDate(now.getDate() - now.getDay());
  const date = (n) => { const d = new Date(sunday); d.setDate(sunday.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const musicians = [
    {id:'M_STR',name:'弦乐组',defaultRatio:20,color:'#a855f7',roles:['musician']},
    {id:'M_PNO',name:'钢琴',defaultRatio:20,color:'#a855f7',roles:['musician']},
    {id:'M_TEA',name:'李同学',defaultRatio:20,color:'#a855f7',roles:['musician']},
    {id:'M_ENS',name:'室内乐',defaultRatio:20,color:'#a855f7',roles:['musician']},
  ];
  const projects = [{id:'P_FILM',name:'电影配乐',color:'#eab308'},{id:'P_CHOPIN',name:'肖邦练习曲',color:'#eab308'},{id:'P_LESSON',name:'钢琴教学',color:'#eab308'},{id:'P_QUARTET',name:'弦乐四重奏',color:'#eab308'}];
  const instruments = [{id:'I_VLN',name:'小提琴',color:'#60a5fa'},{id:'I_PNO',name:'钢琴',color:'#60a5fa'},{id:'I_CEL',name:'大提琴',color:'#60a5fa'}];
  const rows = [
    ['T1','电影主题 · 弦乐录音','M_STR','P_FILM','I_VLN',3,1,'10:30','01:30:00'],
    ['T2','肖邦练习曲','M_PNO','P_CHOPIN','I_PNO',3,2,'13:00','01:00:00'],
    ['T3','学生课 · 曲目准备','M_TEA','P_LESSON','I_PNO',4,3,'16:00','01:00:00'],
    ['T4','弦乐四重奏排练','M_ENS','P_QUARTET','I_CEL',6,4,'15:00','02:00:00'],
    ['T5','钢琴录音 · 第二乐章','M_PNO','P_FILM','I_PNO',4,5,'11:00','01:30:00'],
    ['T6','电影配乐 · 补录','M_STR','P_FILM','I_VLN',3,6,'14:00','01:00:00'],
    ['T7','配器修改与试听','M_STR','P_FILM','I_VLN',5,7,'09:30','01:00:00'],
    ['T8','弦乐主题 · 待安排','M_STR','P_FILM','I_VLN',4,8,'','01:00:00'],
  ];
  const pool = rows.map(([id,name,musicianId,projectId,instrumentId,trackCount,minutes]) => ({
    id,name,sessionId:'S_DEFAULT',musicianId,projectId,instrumentId,
    musicDuration:`${String(minutes).padStart(2,'0')}:00`,estDuration:'01:00:00',ratio:20,trackCount,
    records:{musician:{},project:{},instrument:{}}
  }));
  const tasks = rows.filter(r=>r[7]).map(([id,name,musicianId,projectId,instrumentId,trackCount,minutes,startTime,estDuration],i)=>({
    scheduleId:`S-${id}`,templateId:id,sessionId:'S_DEFAULT',stage:'rec',musicianId,projectId,instrumentId,
    date:date(i+1),startTime,estDuration,trackCount,ratio:20,musicDuration:`${String(minutes).padStart(2,'0')}:00`
  }));
  const settings={startHour:8,endHour:22,sessions:[{id:'S_DEFAULT',name:'默认录音日程'}],musicians,projects,instruments,studios:[],engineers:[],operators:[],assistants:[]};
  localStorage.setItem('v10_data',JSON.stringify({schemaVersion:10,pool,tasks,settings:{...settings,lastSessionId:'S_DEFAULT'}}));
  localStorage.setItem('musche_sidebar_open','true');
  localStorage.setItem('theme_mode','light');
  localStorage.setItem('musche_tour_seen','true');
});

const page = await context.newPage();
const recorderStart = Date.now();
await page.goto('http://127.0.0.1:5173/', { waitUntil:'domcontentloaded' });
await page.locator('#main-content').waitFor({ state:'visible', timeout:30000 });
await page.locator('.calendar-month-view').waitFor({ state:'visible', timeout:30000 });
await page.waitForTimeout(2200);
await page.evaluate(() => {
  const app=document.querySelector('#app');
  const shell=document.createElement('div'); shell.id='film-shell';
  shell.style.cssText='position:fixed;inset:0;z-index:0;transform-origin:50% 50%;transform-style:preserve-3d;will-change:transform;';
  const back=document.createElement('div'); back.id='film-screen-back';
  back.style.cssText='position:absolute;inset:0;z-index:0;border-radius:20px;background:linear-gradient(145deg,#d8d8d6,#a4a4a2);border:1px solid rgba(255,255,255,.58);box-shadow:0 42px 108px rgba(0,0,0,.5);transform:translateZ(-34px);pointer-events:none;';
  app.parentNode.insertBefore(shell,app); shell.append(back,app);
  document.body.style.background='#151515'; document.body.style.overflow='hidden';
  app.style.position='relative'; app.style.zIndex='1'; app.style.transformStyle='preserve-3d';
  app.style.border='1px solid rgba(255,255,255,.48)'; app.style.borderRadius='20px';
  app.style.boxShadow='0 28px 78px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.08)';
  const addDepth=(el,z,shadow='')=>{
    if(el.dataset.filmDepth)return;
    el.dataset.filmDepth='true'; el.style.translate=`0px 0px ${z}px`;
    if(shadow)el.style.boxShadow=shadow;
    for(let p=el.parentElement;p&&p!==shell;p=p.parentElement)p.style.transformStyle='preserve-3d';
  };
  const applyLayers=()=>{
    app.querySelectorAll('.calendar-week-view .task-block').forEach(el=>addDepth(el,26,'0 11px 28px rgba(26,35,50,.18),0 1px 0 rgba(255,255,255,.4) inset'));
    app.querySelectorAll('.calendar-week-view .sticky').forEach(el=>addDepth(el,10));
    app.querySelectorAll('#sidebar [data-stat-id]').forEach(el=>addDepth(el,14,'0 8px 22px rgba(25,30,40,.11)'));
    app.querySelectorAll('#sidebar [data-stat-id] .cursor-pointer').forEach(el=>addDepth(el,19));
    app.querySelectorAll('.modal-window').forEach(el=>addDepth(el,30,'0 28px 78px rgba(0,0,0,.27)'));
    app.querySelectorAll('.track-card').forEach(el=>addDepth(el,17,'0 7px 20px rgba(25,30,40,.1)'));
  };
  applyLayers();
  new MutationObserver(applyLayers).observe(app,{childList:true,subtree:true});
});
const filmStart = Date.now();
const wait = (ms) => page.waitForTimeout(ms);
const holdUntil = async (seconds) => { const left=seconds*1000-(Date.now()-filmStart); if(left>0) await wait(left); };
const camera = { x:960, y:540, scale:1, rx:0, ry:0, blur:0 };
const cameraTo = async (target, ms=1200) => {
  const from={...camera};
  await page.evaluate(({from,to,ms}) => new Promise(resolve => {
    const app=document.querySelector('#film-shell');
    const body=document.body;
    const depth=2200;
    body.style.perspective=`${depth}px`;
    body.style.perspectiveOrigin='50% 50%';
    app.style.transformOrigin='50% 50%';
    app.style.transformStyle='preserve-3d';
    app.style.willChange='transform, filter';
    app.style.transition='none';
    const spring=t=>{
      const zeta=.82, omega=8, wd=omega*Math.sqrt(1-zeta*zeta);
      return 1-Math.exp(-zeta*omega*t)*(Math.cos(wd*t)+(zeta/Math.sqrt(1-zeta*zeta))*Math.sin(wd*t));
    };
    const start=performance.now();
    const frame=()=>{
      const raw=ms===0?1:Math.min(1,(performance.now()-start)/ms);
      const t=spring(raw);
      const mix=(a,b)=>a+(b-a)*t;
      const x=mix(from.x,to.x), y=mix(from.y,to.y), scale=mix(from.scale,to.scale);
      const rx=mix(from.rx,to.rx), ry=mix(from.ry,to.ry);
      const px=(x-960)*scale, py=(y-540)*scale;
      const ax=ry*Math.PI/180, ay=rx*Math.PI/180;
      const x1=px*Math.cos(ax), z1=-px*Math.sin(ax);
      const y1=py*Math.cos(ay)-z1*Math.sin(ay);
      const z2=py*Math.sin(ay)+z1*Math.cos(ay);
      app.style.transform=`translate3d(${-x1}px,${-y1}px,0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      app.style.filter=`blur(${Math.max(0,mix(from.blur,to.blur))}px)`;
      if(raw<1) requestAnimationFrame(frame); else resolve();
    };
    if(ms===0){
      const px=(to.x-960)*to.scale, py=(to.y-540)*to.scale;
      const ax=to.ry*Math.PI/180, ay=to.rx*Math.PI/180;
      const x1=px*Math.cos(ax), z1=-px*Math.sin(ax);
      const y1=py*Math.cos(ay)-z1*Math.sin(ay), z2=py*Math.sin(ay)+z1*Math.cos(ay);
      app.style.transform=`translate3d(${-x1}px,${-y1}px,0) rotateX(${to.rx}deg) rotateY(${to.ry}deg) scale(${to.scale})`;
      app.style.filter=`blur(${to.blur}px)`; resolve();
    } else requestAnimationFrame(frame);
  }),{from,to:target,ms});
  Object.assign(camera,target);
};
const rectOf = async locator => locator.evaluate(el=>{
  const app=document.querySelector('#film-shell');
  const transform=app.style.transform, filter=app.style.filter;
  app.style.transform='none'; app.style.filter='none';
  const r=el.getBoundingClientRect();
  app.style.transform=transform; app.style.filter=filter;
  return {x:r.x+r.width/2,y:r.y+r.height/2,left:r.left,top:r.top,width:r.width,height:r.height};
});

// A restrained pointer cue makes the real product actions legible in the film.
await page.evaluate(() => {
  const cursor=document.createElement('div'); cursor.id='film-cursor';
  cursor.innerHTML='<i></i>';
  cursor.style.cssText='position:fixed;left:0;top:0;width:24px;height:24px;border:1px solid rgba(0,122,255,.46);border-radius:50%;background:rgba(0,122,255,.08);z-index:100000;pointer-events:none;opacity:0;transform:translate3d(-60px,-60px,0);transition:opacity 260ms ease,background 180ms ease,border-color 180ms ease;';
  const dot=cursor.firstElementChild;
  dot.style.cssText='position:absolute;left:8px;top:8px;width:6px;height:6px;border-radius:50%;background:#007aff;transition:transform 220ms cubic-bezier(.2,.8,.2,1);';
  document.body.append(cursor);
  window.addEventListener('mousemove',e=>{cursor.style.transform=`translate3d(${e.clientX-12}px,${e.clientY-12}px,0)`;});
  document.addEventListener('mousedown',()=>{dot.style.transform='scale(.68)';cursor.style.background='rgba(0,122,255,.16)';},true);
  document.addEventListener('mouseup',()=>{dot.style.transform='scale(1)';cursor.style.background='rgba(0,122,255,.08)';},true);
});
let pointer={x:8,y:8};
const movePointer = async (x,y,ms=520,arc=0) => {
  const start={...pointer}, distance=Math.hypot(x-start.x,y-start.y);
  const steps=Math.max(8,Math.ceil(ms/34));
  await page.evaluate(()=>{document.querySelector('#film-cursor').style.opacity='1';});
  for(let i=1;i<=steps;i++){
    const u=i/steps, eased=1-Math.pow(1-u,3);
    const bend=Math.sin(Math.PI*u)*arc;
    const d=Math.max(1,distance), nx=-(y-start.y)/d, ny=(x-start.x)/d;
    const px=start.x+(x-start.x)*eased+nx*bend;
    const py=start.y+(y-start.y)*eased+ny*bend;
    await page.mouse.move(px,py); await wait(ms/steps);
  }
  pointer={x,y};
};
const clickAt = async (locator,ms=520) => {
  const box=await locator.boundingBox();
  if(!box) throw new Error('Cannot locate visible click target for film: '+locator);
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await movePointer(x,y,ms,Math.min(32,Math.hypot(x-pointer.x,y-pointer.y)*.035));
  await wait(120); await page.mouse.click(x,y,{delay:110}); await wait(200);
};
const dragTo = async (source,target,{duration=1500,sourceY=0,targetY=5}={}) => {
  const a=await source.boundingBox(), b=await target.boundingBox();
  if(!a||!b) throw new Error('Cannot locate visible drag source or target for film.');
  const sx=a.x+a.width/2, sy=a.y+(sourceY||a.height/2);
  const ex=b.x+b.width/2, ey=b.y+targetY;
  await movePointer(sx,sy,480,14); await wait(100); await page.mouse.down(); await wait(180);
  const start={x:sx,y:sy}, dist=Math.hypot(ex-sx,ey-sy), steps=Math.max(20,Math.ceil(duration/38));
  for(let i=1;i<=steps;i++){
    const u=i/steps, eased=1-Math.pow(1-u,2.2);
    const bend=Math.sin(Math.PI*u)*Math.min(22,dist*.035);
    const nx=-(ey-sy)/Math.max(1,dist), ny=(ex-sx)/Math.max(1,dist);
    await page.mouse.move(start.x+(ex-sx)*eased+nx*bend,start.y+(ey-sy)*eased+ny*bend);
    await wait(duration/steps);
  }
  await wait(120); await page.mouse.up(); await wait(350); pointer={x:ex,y:ey};
};
const hidePointer = () => page.evaluate(()=>{const c=document.querySelector('#film-cursor'); if(c)c.style.opacity='0';});

// Opening: reveal the real app as a dimensional screen, then drift toward its time controls.
await page.evaluate(()=>{
  const cover=document.createElement('div'); cover.id='film-blackout';
  cover.style.cssText='position:fixed;inset:0;z-index:99990;background:#171717;opacity:1;transition:opacity 1500ms cubic-bezier(.16,1,.3,1);pointer-events:none;';
  document.body.append(cover); requestAnimationFrame(()=>cover.style.opacity='0');
});
await cameraTo({x:960,y:540,scale:.86,rx:14,ry:-20,blur:.8},0);
await cameraTo({x:960,y:540,scale:.94,rx:8,ry:-13,blur:0},2600);
await holdUntil(3.5);

// The site's own month/week control opens the true weekly timeline.
await cameraTo({x:960,y:540,scale:1,rx:3,ry:-6,blur:0},750);
await clickAt(page.locator('#tour-view-switch'),520);
await page.locator('.calendar-week-view').waitFor({state:'visible',timeout:8000});
await holdUntil(7.2);

// Follow the time grid across a day, then settle on a real scheduled block.
const noonSlot=await rectOf(page.locator('.calendar-week-view [data-time="13:00"]').first());
await cameraTo({x:noonSlot.x,y:noonSlot.y,scale:1.66,rx:13,ry:16,blur:0},1600);
await holdUntil(11.4);
const firstBlock=page.locator('.calendar-week-view .task-block').first();
const firstBlockPoint=await rectOf(firstBlock);
await cameraTo({x:firstBlockPoint.x,y:firstBlockPoint.y,scale:2.05,rx:-13,ry:-18,blur:0},1700);
await holdUntil(17.2);
await cameraTo({x:960,y:540,scale:.96,rx:5,ry:-9,blur:0},1050);

// Open the real REC musician group and reveal work still waiting for a time.
const musician=page.locator('[data-stat-id="M_STR"]');
const musicianPoint=await rectOf(musician);
await cameraTo({x:musicianPoint.x,y:musicianPoint.y,scale:1.28,rx:12,ry:17,blur:0},1250);
await holdUntil(21.8);
await clickAt(musician,450);
const pending=page.getByText('弦乐主题 · 待安排',{exact:true});
await pending.waitFor({state:'visible',timeout:5000});
await holdUntil(25.0);
const pendingPoint=await rectOf(pending);
await cameraTo({x:pendingPoint.x,y:pendingPoint.y,scale:1.58,rx:-11,ry:-17,blur:0},1450);
await holdUntil(29.0);

// Drag that real pool item into Wednesday's open 13:00 slot.
await cameraTo({x:960,y:540,scale:.94,rx:10,ry:-15,blur:0},1000);
const now=new Date(), sunday=new Date(now); sunday.setDate(now.getDate()-now.getDay());
const wed=new Date(sunday); wed.setDate(sunday.getDate()+3);
const wedStr=`${wed.getFullYear()}-${String(wed.getMonth()+1).padStart(2,'0')}-${String(wed.getDate()).padStart(2,'0')}`;
const poolTask=page.getByText('弦乐主题 · 待安排',{exact:true});
const firstTarget=page.locator(`.calendar-week-view [data-date-str="${wedStr}"] [data-time="13:00"]`);
await dragTo(poolTask,firstTarget,{duration:1750,sourceY:0,targetY:6});
const newTask=page.locator(`.calendar-week-view [data-date-str="${wedStr}"] .task-block`).filter({hasText:'弦乐组'}).first();
await newTask.waitFor({state:'visible',timeout:6000});
await holdUntil(38.8);
const placedPoint=await rectOf(newTask);
await cameraTo({x:placedPoint.x,y:placedPoint.y,scale:2.08,rx:14,ry:16,blur:0},1450);
await holdUntil(42.0);

// Orbit back around the placed block to reveal the whole week in perspective.
await cameraTo({x:960,y:540,scale:.86,rx:16,ry:-22,blur:0},1850);
await holdUntil(45.0);
await cameraTo({x:960,y:540,scale:.96,rx:3,ry:-6,blur:0},650);
await holdUntil(46.0);

// Double-click the real block to open the musician's actual track list.
const finalTask=page.locator(`.calendar-week-view [data-date-str="${wedStr}"] .task-block`).filter({hasText:'弦乐组'}).first();
const taskBox=await finalTask.boundingBox();
if(!taskBox) throw new Error('The rescheduled Musche task is not visible.');
await movePointer(taskBox.x+taskBox.width/2,taskBox.y+taskBox.height/2,450,12);
await page.mouse.click(taskBox.x+taskBox.width/2,taskBox.y+taskBox.height/2,{clickCount:2,delay:130});
const modal=page.locator('.modal-window').filter({hasText:'弦乐组'}).first();
await modal.waitFor({state:'visible',timeout:6000});
await holdUntil(49.0);
const modalPoint=await rectOf(modal);
await cameraTo({x:modalPoint.x,y:modalPoint.y,scale:1.58,rx:-13,ry:16,blur:0},1250);
await holdUntil(53.0);
await hidePointer();
await cameraTo({x:960,y:540,scale:.94,rx:6,ry:-10,blur:0},1200);
const closeButton=modal.locator('button').filter({hasText:'✕'}).first();
await clickAt(closeButton,360);
await holdUntil(56.4);
await hidePointer();

// Resolve the interface back to its full page, then use the real site wordmark.
await page.evaluate(()=>{
  const cover=document.createElement('div'); cover.id='musche-end-card';
  cover.style.cssText='position:fixed;inset:0;z-index:99995;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f7f7f5;color:#1d1d1f;opacity:0;filter:blur(8px);transition:opacity 1050ms cubic-bezier(.16,1,.3,1),filter 1050ms cubic-bezier(.16,1,.3,1);pointer-events:none;';
  const logo=document.querySelector('header h1')?.cloneNode(true)||document.createElement('div');
  logo.removeAttribute('class'); logo.style.cssText='display:block;font-family:Chango,sans-serif;font-size:64px;line-height:1;letter-spacing:.1em;margin:0;';
  const tagline=document.createElement('div'); tagline.textContent='Your music. Your time.';
  tagline.style.cssText='margin-top:24px;font:400 20px/1.4 system-ui,-apple-system,sans-serif;letter-spacing:.025em;color:#666;';
  const url=document.createElement('div'); url.textContent='musche.cn';
  url.style.cssText='margin-top:52px;font:500 13px/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.16em;color:#8b8b8d;';
  cover.append(logo,tagline,url); document.body.append(cover);
  requestAnimationFrame(()=>{cover.style.opacity='1';cover.style.filter='blur(0)';});
});
await wait(1100);
await holdUntil(filmLength);
const filmDuration=(Date.now()-filmStart)/1000;
const preRoll=(filmStart-recorderStart)/1000;
const videoHandle=page.video();
await context.close(); await browser.close();
const video=await videoHandle.path();
const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',video],{encoding:'utf8'});
const recordedDuration=Number.parseFloat(probe.stdout.trim())||filmDuration;
const videoOffset=Math.max(0,recordedDuration-filmDuration);
console.log(`Capture timing: page preroll ${preRoll.toFixed(2)}s; recorded ${recordedDuration.toFixed(2)}s; film ${filmDuration.toFixed(2)}s; trim ${videoOffset.toFixed(2)}s.`);

// Original restrained sustained-tone bed and sparse interface ticks.
const sampleRate=48000,duration=filmLength,count=sampleRate*duration,pcm=Buffer.alloc(count*2);
const notes=[[.18,7.2,174.61,.052],[4.6,8.4,220,.036],[10.4,8.6,261.63,.032],[17.8,8,196,.035],[25.8,8.2,246.94,.034],[33.6,8.5,293.66,.03],[42.8,8.6,220,.036],[50.7,8.2,261.63,.034],[56.4,3.4,174.61,.036],[56.4,3.4,261.63,.026],[56.4,3.4,329.63,.02]];
const ticks=[4.2,7.3,11.8,17.5,21.8,25.2,29.4,31.2,34.8,38.1,39.9,42.4,45.2,47.8,49.1,53.2,56.7];
for(let i=0;i<count;i++){
  const t=i/sampleRate;let v=0;
  for(const [start,len,f,amp] of notes){const u=t-start;if(u>=0&&u<len){const env=Math.min(1,u/.22)*Math.min(1,(len-u)/.65)*Math.exp(-u*.28);v+=amp*env*(Math.sin(2*Math.PI*f*u)+.26*Math.sin(2*Math.PI*f*2*u)+.09*Math.sin(2*Math.PI*f*3*u));}}
  for(const tick of ticks){const u=t-tick;if(u>=0&&u<.055)v+=.018*Math.exp(-u*90)*Math.sin(2*Math.PI*(1500-7000*u)*u);}
  const fade=Math.max(0,Math.min(1,t/.8,(duration-t)/1.6));pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v*fade))*32767),i*2);
}
const header=Buffer.alloc(44);header.write('RIFF',0);header.writeUInt32LE(36+pcm.length,4);header.write('WAVE',8);header.write('fmt ',12);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(sampleRate,24);header.writeUInt32LE(sampleRate*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
const audio=join(temp,'sound.wav');writeFileSync(audio,Buffer.concat([header,pcm]));
const args=['-y','-ss',String(videoOffset),'-i',video,'-i',audio,'-vf',`fps=30,tpad=stop_mode=clone:stop_duration=${filmLength},scale=${exportWidth}:${exportHeight}:flags=lanczos,format=yuv420p`,'-af','alimiter=limit=0.85','-t',String(filmLength),'-r','30','-c:v','libx264','-preset','slow','-crf','16','-c:a','aac','-b:a','192k','-movflags','+faststart',output];
const result=spawnSync('ffmpeg',args,{stdio:'inherit'});rmSync(temp,{recursive:true,force:true});
if(result.status!==0)process.exit(result.status||1);
console.log(`Rendered actual Musche UI to ${output} (${exportWidth}x${exportHeight}, ${filmLength}s).`);
