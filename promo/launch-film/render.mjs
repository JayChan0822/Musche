import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const root=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2),stills=args.includes('--stills'),fourk=args.includes('--4k');
const fps=Number(args.find(a=>a.startsWith('--fps='))?.split('=')[1]??60);
const renderWidth=fourk?3840:1920,renderHeight=fourk?2160:1080;
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.wav':'audio/wav'};
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+decodeURIComponent(req.url==='/'?'/film.html':req.url.split('?')[0]));if(!p.startsWith(root+'/'))throw new Error('Bad path');const b=await readFile(p);res.writeHead(200,{'Content-Type':types[extname(p)]??'application/octet-stream'});res.end(b)}catch{res.writeHead(404);res.end('Not found')}});
server.listen(0,'127.0.0.1');await once(server,'listening');
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:renderWidth,height:renderHeight},deviceScaleFactor:1});
page.on('pageerror',e=>console.error('PAGE ERROR',e));
await page.goto(`http://127.0.0.1:${port}/film.html`);console.log(await page.evaluate(()=>window.ready));
await page.evaluate(({w,h})=>{document.querySelector('#transport').remove();const cv=document.querySelector('canvas');cv.width=w;cv.height=h;},{w:renderWidth,h:renderHeight});
await mkdir(resolve(root,'stills'),{recursive:true});
try{
 if(stills){
   for(const t of [1.8,3.5,5.8,8,10.8,13.8,15.6,18.8,20.5,23.4,26,29.5,33.6,36,39.5,41.8,44.8,47]){
    await page.evaluate(t=>window.renderFrame(t),t);await page.screenshot({path:resolve(root,`stills/${t.toFixed(1).padStart(4,'0')}.jpg`),type:'jpeg',quality:92});
   }console.log('Storyboard frames exported.');
 }else{
   const output=resolve(root,fourk?'Musche-Launch-Film-4K.mp4':'Musche-Launch-Film-1080p60.mp4');
   const ff=spawn('ffmpeg',['-hide_banner','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-i',resolve(root,'audio/musche-score-master.wav'),'-map','0:v:0','-map','1:a:0','-t','48','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-r',String(fps),'-c:a','aac','-b:a','320k','-ar','48000','-movflags','+faststart','-metadata','title=Musche — Your music. Your time.','-metadata','comment=Original 48-second product film. Actual Musche UI components. Original score at 100 BPM.',output],{stdio:['pipe','ignore','pipe']});
   let error='';ff.stderr.on('data',b=>{error+=b.toString();if(error.length>6000)error=error.slice(-6000)});
   ff.stdin.on('error',()=>{});
   const start=Date.now(),n=48*fps;
   for(let i=0;i<n;i++){
     const jpeg=await page.evaluate(t=>{window.renderFrame(t);return document.querySelector('canvas').toDataURL('image/jpeg',.965).split(',')[1]},i/fps);
     if(!ff.stdin.write(Buffer.from(jpeg,'base64')))await once(ff.stdin,'drain');
     if(i%(fps*4)===0)console.log(`Rendered ${(i/fps).toFixed(0)} / 48 s · ${((Date.now()-start)/1000).toFixed(1)} s elapsed`);
   }
   ff.stdin.end();const [code]=await once(ff,'close');if(code!==0)throw new Error(error);console.log(`Completed ${output}`);
 }
}finally{await browser.close();server.close()}
