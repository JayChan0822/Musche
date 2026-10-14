import {chromium} from 'playwright';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const out=join(dirname(fileURLToPath(import.meta.url)),'assets-v2/library');
mkdirSync(out,{recursive:true});
const manifest={source:'Actual Musche UI, real Library creation and New Task interactions, isolated fictional local data.',viewport:{width:1920,height:1080},pixelRatio:2,assets:[],actions:[]};
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:manifest.viewport,deviceScaleFactor:2,colorScheme:'light'});
await context.addInitScript(()=>{
  const settings={startHour:8,endHour:20,sessions:[{id:'S_A',name:'Session A'},{id:'S_B',name:'Session B'}],musicians:[],projects:[],instruments:[],studios:[],engineers:[],operators:[],assistants:[],lastSessionId:'S_A'};
  localStorage.setItem('v10_data',JSON.stringify({schemaVersion:10,pool:[],tasks:[],settings}));
  localStorage.setItem('musche_sidebar_open','true');localStorage.setItem('theme_mode','light');localStorage.setItem('musche_tour_seen','true');
});
const page=await context.newPage();
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await page.locator('#main-content').waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);

async function capture(name,locator,{isolated=true,scale=1}={}){
  const loc=typeof locator==='string'?page.locator(locator).first():locator;
  await loc.waitFor({state:'visible'});const bounds=await loc.boundingBox();
  const controls=await loc.evaluate(el=>[...el.querySelectorAll('button,input,select')].map(n=>{const b=n.getBoundingClientRect();return{tag:n.tagName,label:n.getAttribute('aria-label')||n.getAttribute('placeholder')||n.textContent.trim(),value:n.value||null,bounds:{x:b.x,y:b.y,width:b.width,height:b.height}}}).filter(n=>n.bounds.width&&n.bounds.height));
  if(isolated){
    const snap=await loc.evaluate((el,scale)=>{
      const b=el.getBoundingClientRect(),clone=el.cloneNode(true),source=[el,...el.querySelectorAll('*')],dest=[clone,...clone.querySelectorAll('*')];
      source.forEach((s,i)=>{const d=dest[i],cs=getComputedStyle(s);let css='';for(const k of cs)css+=k+':'+cs.getPropertyValue(k)+';';d.style.cssText=css;d.style.animation='none';d.style.transition='none';
        if(s.tagName==='INPUT'){d.setAttribute('value',s.value);if(s.checked)d.setAttribute('checked','');}
        if(s.tagName==='SELECT'){for(let j=0;j<s.options.length;j++){if(s.options[j].selected)d.options[j].setAttribute('selected','');else d.options[j].removeAttribute('selected');}}
      });
      clone.style.cssText+=`;position:relative;left:0;right:auto;top:0;bottom:auto;margin:0;transform:scale(${scale});transform-origin:0 0;animation:none;transition:none;width:${b.width}px;height:${b.height}px;`;
      return{html:clone.outerHTML,width:Math.ceil(b.width*scale),height:Math.ceil(b.height*scale),css:[...document.querySelectorAll('link[rel="stylesheet"]')].map(e=>e.href),inline:[...document.querySelectorAll('style')].map(e=>e.textContent).join('\n')};
    },scale);
    const stage=await context.newPage();await stage.setViewportSize({width:snap.width,height:snap.height});
    await stage.setContent(`<!doctype html><html><head>${snap.css.map(url=>`<link rel="stylesheet" href="${url}">`).join('')}<style>${snap.inline}html,body{margin:0!important;padding:0!important;background:transparent!important;width:100%!important;height:100%!important;overflow:hidden!important}</style></head><body>${snap.html}</body></html>`);
    await stage.evaluate(()=>document.fonts.ready);await stage.waitForTimeout(70);await stage.screenshot({path:join(out,name+'.png'),omitBackground:true});await stage.close();
  }else await loc.screenshot({path:join(out,name+'.png'),animations:'disabled'});
  const b=readFileSync(join(out,name+'.png'));
  manifest.assets.push({name,file:name+'.png',transparent:isolated,bounds,pixels:{width:b.readUInt32BE(16),height:b.readUInt32BE(20)},controls});
  writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2));console.log(name,Math.round(bounds.width),Math.round(bounds.height));
}

try{
  await capture('app-empty','#app',{isolated:false});
  await capture('library-toggle','#library-toggle',{scale:3});
  await page.locator('#library-toggle').click();await page.locator('#resource-library').waitFor({state:'visible'});await page.waitForTimeout(400);
  const groups=[['project','Project','项目'],['instrument','Instrument','乐器'],['musician','Player','人员']];
  for(const [type,prefix,label] of groups){
    await page.locator('#library-tab-'+type).click();await page.waitForTimeout(150);
    await capture(type+'-empty','#resource-library');
    await capture(type+'-header','#resource-library .resource-sidebar-content > div:first-child');
    for(const suffix of ['A','B']){
      await page.getByRole('button',{name:'新增'+label,exact:true}).last().click();
      const form=page.locator('#resource-library form');
      if(suffix==='A')await capture(type+'-form-empty',form);
      if(type==='musician')await page.getByLabel('新人员角色',{exact:true}).selectOption('both');
      await page.getByLabel('新'+label+'名称',{exact:true}).fill(prefix+' '+suffix);
      await capture(type+'-'+suffix+'-form',form,{scale:2});
      await form.getByRole('button',{name:'添加',exact:true}).click();
      await page.getByLabel('查看'+prefix+' '+suffix+'详情',{exact:true}).waitFor({state:'visible'});
      await page.waitForTimeout(150);
      const row=page.getByLabel('查看'+prefix+' '+suffix+'详情',{exact:true}).locator('xpath=../..');
      await capture(type+'-'+suffix+'-row',row,{scale:2});
      await capture(type+'-'+suffix+'-created','#library-panel > section');
      manifest.actions.push({kind:'create-library-resource',type,name:prefix+' '+suffix,via:'Actual Library add form'});
    }
    await capture(type+'-AB-created','#library-panel > section');
    await capture(type+'-AB-library','#resource-library');
  }
  await page.getByRole('button',{name:'收起资料库',exact:true}).click();
  await page.locator('#tour-new-task').click();
  const modal=page.locator('.modal-window').filter({hasText:'添加新任务'});
  await modal.waitFor({state:'visible'});await page.waitForTimeout(350);
  await capture('task-empty',modal,{scale:2});
  const choices=[['project','Project A','搜索项目...'],['instrument','Instrument A','搜索乐器...'],['musician','Player A','搜索人员...'],['editor','Player B','搜索人员...']];
  for(let i=0;i<choices.length;i++){
    const [type,name,placeholder]=choices[i];
    await modal.locator('.mobile-input-group > button').nth(i).click();
    await modal.getByPlaceholder(placeholder,{exact:true}).fill(name);
    await modal.locator('.custom-dropdown-menu').getByText(name,{exact:true}).first().waitFor({state:'visible'});
    await capture('task-'+type+'-dropdown',modal,{scale:2});
    await modal.locator('.custom-dropdown-menu').getByText(name,{exact:true}).first().click();
    await page.waitForTimeout(100);
    await capture('task-'+type+'-selected',modal,{scale:2});
  }
  await modal.getByPlaceholder('00:00',{exact:true}).fill('03:00');
  await capture('task-filled',modal,{scale:2});
  await capture('task-project-field',modal.locator('.mobile-input-group').nth(0),{scale:3});
  await capture('task-instrument-field',modal.locator('.mobile-input-group').nth(1),{scale:3});
  await capture('task-musician-field',modal.locator('.mobile-input-group').nth(2),{scale:3});
  await capture('task-editor-field',modal.locator('.mobile-input-group').nth(3),{scale:3});
  await capture('task-duration-field',modal.getByPlaceholder('00:00',{exact:true}).locator('xpath=..'),{scale:3});
  await modal.locator('button').filter({has:page.locator('.fa-plus')}).click();
  await modal.waitFor({state:'hidden'});await page.waitForTimeout(300);
  const stat=page.locator('#sidebar [data-stat-id]').filter({hasText:'Player A'}).first();
  await stat.waitFor({state:'visible'});await capture('task-pool-created',stat,{scale:2});
  await stat.click();await page.waitForTimeout(150);
  const pool=stat.getByText('Instrument A',{exact:true}).locator('xpath=ancestor::*[@draggable="true"][1]');
  await capture('task-pool-card',pool,{scale:3});
  await capture('task-pool-expanded',stat,{scale:2});
  await capture('app-task-created','#app',{isolated:false});
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('v10_data')));
  writeFileSync(join(out,'state-created.json'),JSON.stringify(state,null,2));
  manifest.actions.push({kind:'create-task',project:'Project A',instrument:'Instrument A',musician:'Player A',editor:'Player B',musicDuration:'03:00',name:'Instrument A',via:'Actual New Task modal'});
  writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2));
}catch(e){await page.screenshot({path:join(out,'debug.png')});writeFileSync(join(out,'debug.txt'),await page.locator('body').innerText());throw e;}
await context.close();await browser.close();console.log('Library and task assets complete.');
