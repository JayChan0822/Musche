/* Musche / 48 seconds / 100 BPM. All product imagery is captured from the actual app.
   Deterministic, frame-addressable animation: renderFrame(timeInSeconds). */
'use strict';
const W=1920,H=1080,canvas=document.querySelector('#film'),c=canvas.getContext('2d',{alpha:false});
const C={paper:'#f4f2ed',ink:'#272823',muted:'#858780',line:'#d7d8d1',blue:'#007aff',lav:'#dedff0',sage:'#dce4d9'};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*t*(t*(6*t-15)+10)};
const out=t=>1-Math.pow(1-clamp(t),4);
const E=(t,a,b)=>ease((t-a)/(b-a));
const O=(t,a,b)=>out((t-a)/(b-a));
function spring(t){if(t<=0)return 0;if(t>=1)return 1;return 1-Math.exp(-7.4*t)*(Math.cos(10.5*t)+.5*Math.sin(10.5*t));}
const S=(t,a,b)=>spring(clamp((t-a)/(b-a)));
const I={},M={};let manifest;
const font='"PingFang SC", "Helvetica Neue", Arial, sans-serif';
function rr(x,y,w,h,r=20){c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));}
function box(x,y,w,h,r=20,fill='white',shadow=0){c.save();if(shadow){c.shadowColor=`rgba(35,39,32,${shadow})`;c.shadowBlur=50;c.shadowOffsetY=25}rr(x,y,w,h,r);c.fillStyle=fill;c.fill();c.restore();}
function line(x1,y1,x2,y2,col=C.line,width=1){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineWidth=width;c.strokeStyle=col;c.stroke();}
function text(s,x,y,size=32,weight=500,col=C.ink,align='left'){c.font=`${weight} ${size}px ${font}`;c.fillStyle=col;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y);}
function label(s,x,y,col=C.muted){c.save();c.letterSpacing='3px';text(s,x,y,16,500,col);c.restore();}
function fade(alpha,fn){if(alpha<=0)return;c.save();c.globalAlpha*=clamp(alpha);fn();c.restore();}
function transform(x,y,scale,angle,fn){c.save();c.translate(x,y);c.rotate(angle*Math.PI/180);c.scale(scale,scale);fn();c.restore();}
function image(name,x,y,w,h){let im=I[name];if(!im)return;h=h??w*im.height/im.width;c.drawImage(im,x,y,w,h);}
function card(name,x,y,w,{angle=0,scale=1,alpha=1,shadow=.15,r=18,h=null}={}){let im=I[name];if(!im)return;h=h??w*im.height/im.width;fade(alpha,()=>transform(x+w/2,y+h/2,scale,angle,()=>{box(-w/2,-h/2,w,h,r,'#fff',shadow);rr(-w/2,-h/2,w,h,r);c.clip();image(name,-w/2,-h/2,w,h)}));}
function pill(s,x,y,w,{fill='#ffffff',col=C.ink,size=21}={}){box(x,y,w,48,24,fill,.035);text(s,x+w/2,y+31,size,550,col,'center');}
function dot(x,y,r,col){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=col;c.fill();}
function cursor(x,y,scale=1,press=0){transform(x,y,scale*(1-.12*press),-8,()=>{c.shadowColor='#161e3733';c.shadowBlur=12;c.shadowOffsetY=6;c.beginPath();c.moveTo(0,0);c.lineTo(4,37);c.lineTo(14,27);c.lineTo(24,45);c.lineTo(31,41);c.lineTo(21,23);c.lineTo(35,20);c.closePath();c.fillStyle='#fff';c.fill();c.shadowColor='transparent';c.strokeStyle=C.ink;c.lineWidth=2.3;c.stroke();});}
function ring(x,y,t,col=C.blue){if(t<0||t>1)return;fade(1-t,()=>{c.beginPath();c.arc(x,y,20+80*out(t),0,Math.PI*2);c.strokeStyle=col;c.lineWidth=2*(1-t);c.stroke();});}
function reveal(s,x,y,size,t,start,width=1100){let p=S(t,start,start+.95);c.save();c.beginPath();c.rect(x-10,y-size-20,width,size+45);c.clip();text(s,x,y+(1-p)*size*1.3,size,550);c.restore();}
function section(number,title,sub,t){let a=O(t,0,.6)*(1-E(t,8.5,9.4));fade(a,()=>{label(number+' / MUSCHE',116,93);reveal(title,116,183,56,t,.05);fade(O(t,.35,.95),()=>text(sub,119,229,21,400,C.muted));});}
function bg(t,dark=0){c.fillStyle=C.paper;c.fillRect(0,0,W,H);const g=c.createRadialGradient(960+Math.sin(t*.17)*280,400,0,960,540,1100);g.addColorStop(0,'#ffffff55');g.addColorStop(1,'#c9c9bb10');c.fillStyle=g;c.fillRect(0,0,W,H);if(dark){c.fillStyle=`rgba(17,25,35,${dark})`;c.fillRect(0,0,W,H);}}
function realLogo(x,y,w,alpha=1){fade(alpha,()=>{if(I['light-wordmark-large'])image('light-wordmark-large',x,y,w);else text('Musche',x,y+65,80,800);});}
function grain(){c.save();c.globalAlpha=.025;c.fillStyle=noisePattern;c.fillRect(0,0,W,H);c.restore();}
const noise=document.createElement('canvas');noise.width=noise.height=128;const nc=noise.getContext('2d'),nd=nc.createImageData(128,128);let seed=113;for(let i=0;i<nd.data.length;i+=4){seed=(seed*16807)%2147483647;nd.data[i]=nd.data[i+1]=nd.data[i+2]=seed%256;nd.data[i+3]=255;}nc.putImageData(nd,0,0);const noisePattern=c.createPattern(noise,'repeat');
function bounds(name){return M[name]?.bounds??{x:0,y:0,width:I[name]?.width??100,height:I[name]?.height??100}}
const tasks=()=>Object.keys(I).filter(k=>/^light-task-\d+$/.test(k)).sort();
const rows=()=>Object.keys(I).filter(k=>/^light-track-\d+$/.test(k)).sort();
function overlayComponents(base,pieces,x,y,w,progress=1,scatter=0){const b=bounds(base),k=w/b.width;pieces.forEach((name,i)=>{const q=bounds(name),p=typeof progress==='function'?progress(i):progress;const dx=x+(q.x-b.x)*k,dy=y+(q.y-b.y)*k;card(name,dx+scatter*(1-p)*(i%2?1:-1),dy+(1-p)*90,q.width*k,{alpha:clamp(p),scale:1+.05*(1-p),shadow:.04*(1-p),r:5});});}
function calendar(x,y,w,t=10,{empty=false,stagger=false,shadow=.13,angle=0,skipHero=false}={}){const b=bounds('light-week-background'),h=w*b.height/b.width;transform(x+w/2,y+h/2,1,angle,()=>{box(-w/2,-h/2,w,h,22,'#fafbfc',shadow);c.save();rr(-w/2,-h/2,w,h,22);c.clip();image('light-week-background',-w/2,-h/2,w,h);if(!empty)overlayComponents('light-week-background',tasks().filter((_,i)=>!skipHero||i!==0),-w/2,-h/2,w,stagger?(i)=>S(t,i*.14,i*.14+.8):1,300);c.restore();});return {x,y,w,h};}
function taskAt(i,x,y,w,o={}){const list=tasks();card(list[i%list.length],x,y,w,o);}
function wave(x,y,w,t,amp=30,alpha=1){fade(alpha,()=>{c.beginPath();for(let i=0;i<=w;i+=4){const u=i/w;const a=Math.pow(Math.sin(u*Math.PI),1.8)*amp;const yy=y+Math.sin(u*42-t*4)*a*Math.sin(u*11+t);i?c.lineTo(x+i,yy):c.moveTo(x+i,yy)}c.lineWidth=2;c.strokeStyle=C.blue;c.stroke();});}

// 01 / An acoustic gesture becomes a timeline and then a real task.
function opening(t){
  const enter=O(t,0,.8),exit=E(t,3.45,4.8);
  fade(enter*(1-exit),()=>{label('MADE FOR YOUR MUSIC',119,105);realLogo(1570,65,226);});
  transform(0,-150*exit,1+.06*exit,0,()=>{fade(1-exit,()=>{reveal('让音乐，',290,434,122,t,.1);reveal('自有节奏。',680,590,122,t,.6);fade(O(t,1.3,2),()=>text('Your music. Your time.',294,685,28,400,C.muted));});});
  wave(120,826,1680,t,45*(1-E(t,2.4,4)),enter*(1-exit));
  const p=S(t,2.7,4.25),q=O(t,3.5,4.8);
  if(p>0){taskAt(0,mix(2120,1060,p)-160*q,mix(950,690,p)-310*q,mix(320,550,q),{angle:mix(-13,0,q),alpha:p,shadow:.15});taskAt(2,mix(-520,155,p),mix(1080,865,p)-80*q,360,{angle:mix(10,-4,q),alpha:p});taskAt(4,mix(2100,1550,p),mix(-430,315,p),320,{angle:-9*(1-q),alpha:p});}
  fade(O(t,4.15,4.75),()=>pill('灵感，从这里开始',120,330,330));
}

// 02 / Actual resource cards and task-pool card, choreographed separately.
function pool(t){
  const end=E(t,3.65,4.8);
  fade(1-end,()=>{label('01 / COLLECT',118,92);reveal('先收好，每一个灵感。',118,196,64,t,0);text('任务池 · 音乐人 · 项目 · 乐器',121,246,23,400,C.muted);});
  let stats=['light-stat-M_STR','light-stat-M_PNO','light-stat-M_ENS'].filter(k=>I[k]);
  stats.forEach((name,i)=>{const p=S(t,i*.25,.9+i*.25);card(name,mix(-650,140,p)-700*end,360+i*170,510,{angle:mix(-5,0,p),alpha:p,shadow:.075});});
  const cx=mix(900,1060,end),cy=mix(380,300,end);
  taskAt(0,cx,cy,550,{angle:-2.5*(1-end),shadow:.17});
  taskAt(2,mix(2210,1130,S(t,.2,1.4)),mix(525,510,end),430,{angle:5*(1-end),shadow:.12,alpha:1-end*.4});
  taskAt(4,mix(2080,1260,S(t,.5,1.7)),710,380,{angle:-5,alpha:1-end});
  if(I['light-pool-card']){const p=S(t,.75,1.8);card('light-pool-card',mix(2160,740,p),700,460,{angle:-4,alpha:p*(1-end)});}
  fade(O(t,1.35,2)*(1-end),()=>{line(677,417,816,417,C.line,2);dot(677,417,5,C.blue);text('未安排 → 已安排',840,950,25,450,C.muted);});
  for(let i=0;i<3;i++){const a=clamp(Math.sin((t-i*.3)*Math.PI/1.2)*.35);fade(a*(1-end),()=>ring(758+i*23,410,(t*.8+i*.2)%1));}
}

// 03 / Empty authentic grid + independently moving captured task components.
function schedule(t){
  section('02','拖入日程，即刻有序。','从任务池到周历，让安排一气呵成。',t);
  const boardIn=S(t,0,1.2),focus=E(t,3.6,4.5)*(1-E(t,7.3,8.6)),end=E(t,8.4,9.6);
  const bx=mix(650,390,boardIn)-170*focus,by=mix(720,302,boardIn)-45*focus,bw=mix(950,1440,boardIn)+300*focus;
  fade(boardIn,()=>calendar(bx,by,bw,t-1.05,{stagger:true,empty:false,angle:0,skipHero:true}));
  const p=S(t,.55,1.35);fade(p*(1-focus*.8)*(1-end),()=>{pill('任务池',115,374,190);card(I['light-pool-card']?'light-pool-card':tasks()[0],114,446,350,{shadow:.12});});
  const drag=E(t,3.6,6.0),snap=S(t,6.0,6.55),fly=E(t,8.1,9.6);
  const q=bounds('light-task-0'),b=bounds('light-week-background'),k=bw/b.width;
  const targetX=bx+(q.x-b.x)*k,targetY=by+(q.y-b.y)*k;
  const tx=mix(1060,targetX,drag)+Math.sin(drag*Math.PI)*85,ty=mix(300,targetY,drag)-Math.sin(drag*Math.PI)*125;
  const cardW=mix(550,q.width*k,drag);
  const heroX=mix(tx,930,fly),heroY=mix(ty,332,fly),heroW=mix(cardW,690,fly);
  fade(1,()=>{taskAt(0,heroX,heroY,heroW,{angle:-5*Math.sin(drag*Math.PI),scale:1+.045*Math.sin(Math.PI*drag)+.022*Math.sin(snap*Math.PI),shadow:mix(.16,.015,drag),r:mix(16,5,drag)});
    fade(O(t,2.4,3)*(1-E(t,6.6,7.05))*(1-fly),()=>cursor(tx+cardW*.79,ty+78,1.12,Math.sin(snap*Math.PI)));
  });
  if(t>=6&&t<6.9)ring(tx+cardW/2,ty+80,(t-6)/.9);
  fade(O(t,6.3,6.75)*(1-E(t,7.7,8.2)),()=>pill('✓  时间就位',tx+cardW+35,ty+52,237,{fill:'#e1eadf',col:'#4b6650'}));
  fade(end,()=>{box(0,0,1920,1080,0,C.paper);taskAt(0,heroX,heroY,heroW,{shadow:.18});});
}

// 04 / The selected task grows into the genuine track-list window.
function tracks(t){
  section('03','每一轨，都在掌握。','轨道列表，让录音的细节清晰可见。',t);
  const p=S(t,0,1.2),spread=E(t,2.35,3.6)*(1-E(t,6.7,8.1)),end=E(t,8.45,9.6);
  const nm=I['light-tracks-empty']?'light-tracks-empty':'light-tracks-modal',b=bounds(nm);
  let mw=mix(690,640,p),mh=mw*b.height/b.width;
  let mx=mix(930,1070,p),my=mix(332,270,p);
  fade(1-O(t,.1,.75),()=>taskAt(0,930,332,690));
  fade(O(t,.1,.8)*(1-end),()=>{box(mx,my,mw,mh,23,'#fff',.14);c.save();rr(mx,my,mw,mh,23);c.clip();image(nm,mx,my,mw,mh);c.restore();});
  const list=rows();
  list.forEach((name,i)=>{const q=bounds(name),k=mw/b.width,pr=S(t,.5+i*.22,1.4+i*.22);
    const px=mx+(q.x-b.x)*k,py=my+(q.y-b.y)*k;
    card(name,mix(px,i%2?890:730,spread),mix(py,i%2?735:440,spread)+(1-pr)*80,q.width*k*(1+.42*spread),{angle:(i%2?1:-1)*spread*1.5,alpha:pr*(1-end),shadow:.13*spread,r:10});
  });
  const stat=I['light-stat-M_STR']?'light-stat-M_STR':tasks()[0];
  card(stat,120-560*end,350,480,{alpha:O(t,.5,1.3),angle:-3*spread,shadow:.08});
  fade(O(t,1,1.6)*(1-end),()=>{label('RECORDING SESSION',142,710);text('弦乐主题',139,777,56,550);text('从整体，到每一个细节。',143,834,24,400,C.muted);wave(143,938,405,t,19);});
  fade(O(t,4.1,4.6)*(1-E(t,6.5,7.2)),()=>{const yy=my+Math.min(mh-80,195);pill('Track list',mx+mw-215,yy,190,{fill:'#e8edf7',col:'#486083'});});
  // Parallel sliding strips act as the match transition into calendar columns.
  for(let i=0;i<7;i++){const z=E(t,8.2+i*.045,9.4+i*.03);if(z>0){box(70+i*267,mix(1200,292,z),253,730,16,'#fdfdfb',.05);line(96+i*267,mix(1275,367,z),297+i*267,mix(1275,367,z));}}
}

// 05 / Seven columns compress into a month through staggered tile reveals.
function overview(t){
  section('04','周密安排。全局尽览。','周视图 / 月视图，自由切换。',t);
  const reveal=E(t,0,1.05),morph=E(t,3.0,4.35),end=E(t,8.3,9.6);
  const week='light-week-calendar',month='light-month-calendar';
  const b=bounds(week),mb=bounds(month),x=572,y=282,w=1184,h=w*mb.height/mb.width;
  const zoom=1+.028*Math.sin(t*.8);
  transform(960,650,zoom,0,()=>{
    box(x-960,y-650,w,h,24,'#fff',.12);
    c.save();rr(x-960,y-650,w,h,24);c.clip();
    if(I[week]){const im=I[week];for(let col=0;col<7;col++){const z=S(t,col*.045,.8+col*.045);c.drawImage(im,col*im.width/7,0,im.width/7,im.height,x-960+col*w/7,y-650+(1-z)*440,w/7,w*b.height/b.width);}}
    if(I[month]){
      const im=I[month],cols=7,rs=5,sh=im.height/rs,sw=im.width/cols;
      for(let row=0;row<rs;row++)for(let col=0;col<cols;col++){
        const p=S(t,3.0+col*.065+row*.04,4.3+col*.065+row*.04);if(p<=0)continue;
        c.save();c.globalAlpha=clamp(p);const dx=x-960+col*w/cols,dy=y-650+row*h/rs;
        c.translate(dx+w/cols/2,dy+h/rs/2+(1-p)*90);c.scale(1-.04*(1-p),p);
        c.drawImage(im,col*sw,row*sh,sw,sh,-w/cols/2,-h/rs/2,w/cols,h/rs);c.restore();
      }
    }
    const night=E(t,7.2,8.0);if(I['dark-month-calendar']&&night>0){c.save();c.beginPath();c.arc(x+w/2-960,y+h/2-650,Math.hypot(w,h)*night,0,Math.PI*2);c.clip();image('dark-month-calendar',x-960,y-650,w,h);c.restore();}
    c.restore();
  });
  fade(1-end,()=>{label('WEEK / MONTH',1420,204);image('light-view-switch',1675,134,102,102);});
  fade(O(t,2.15,2.5)*(1-E(t,4.7,5.2)),()=>cursor(mix(1550,1730,E(t,2.45,3)),220,1.2,E(t,3,3.15)*(1-E(t,3.15,3.4))));
  fade(O(t,.9,1.5)*(1-end),()=>{label('ZOOM OUT.',126,495);text('让创作与日程，',122,565,42,500);text('同频。',122,625,42,500);wave(126,742,325,t,20);});
  // Outgoing card sheet travels backwards to become the central gallery window.
  if(end>0){fade(end,()=>{box(0,0,1920,1080,0,C.paper);card('light-month-full',mix(120,440,end),mix(295,330,end),mix(1680,1040,end),{angle:-4*end,shadow:.12});});}
}

// 06 / A moving gallery of true product windows assembles into the hero app.
function gallery(t){
  const resolve=E(t,1.8,3.2),end=E(t,3.95,4.8);
  fade(1-end,()=>{label('ONE PLACE FOR EVERY NOTE',117,93);reveal('你的音乐工作台。',118,188,65,t,0);});
  const drift=45*Math.sin(t*.65);
  card('light-month-full',mix(380,165,resolve),mix(330,293,resolve),mix(1050,1590,resolve),{angle:-4*(1-resolve),alpha:1-resolve,shadow:.1});
  card('light-tracks-modal',mix(1400+drift,1550,resolve),mix(510,620,resolve),610,{angle:6*(1-resolve),alpha:1-resolve,shadow:.14});
  card('light-week-full',mix(-590+drift,160,resolve),mix(110,295,resolve),mix(1080,1600,resolve),{angle:5*(1-resolve),alpha:.85+.15*resolve,shadow:.18,r:19});
  card(I['light-pool-card']?'light-pool-card':tasks()[0],mix(225-drift,100,resolve),mix(787,670,resolve),470,{angle:-6*(1-resolve),alpha:1-resolve,shadow:.14});
  fade(O(t,3.05,3.65)*(1-end),()=>pill('任务池   /   周·月日程   /   录音轨道',588,940,744,{fill:'#fffffff5',size:22}));
  // A single smooth iris carries the entire workspace into the brand mark.
  if(end>0){c.save();c.fillStyle=C.paper;c.beginPath();c.rect(0,0,W,H);const rad=mix(1300,0,end);c.roundRect(960-rad,600-rad*.55,rad*2,rad*1.1,Math.min(100,rad));c.fill('evenodd');c.restore();}
}

// 07 / Original brand lockup, held long enough to read and remember.
function ending(t){
  const p=S(t,0,1.2);
  fade(O(t,0,.65),()=>{
    realLogo(640,260+38*(1-p),640);
    reveal('把时间，留给音乐。',525,612,78,t,.3);
    fade(O(t,.95,1.65),()=>text('Your music. Your time.',960,682,30,400,C.muted,'center'));
    const q=S(t,1.4,2.3);transform(960,832,1,0,()=>{box(-150*q,-31,300*q,62,31,C.ink);fade(O(t,1.65,2.15),()=>text('musche.cn',0,9,25,500,'#fff','center'));});
  });
  fade(O(t,1.2,2),()=>wave(210,950,1500,t,13*(1-E(t,2,4.8)),.38));
  // Subtle final sound-envelope glow, never a fade to black.
  fade((1-E(t,0,.7))*.07,()=>{c.fillStyle=C.blue;c.fillRect(0,0,W,H);});
}

const cuts=[0,4.8,9.6,19.2,28.8,38.4,43.2,48],scenes=[opening,pool,schedule,tracks,overview,gallery,ending];
window.renderFrame=function(t){t=clamp(t,0,47.99999);c.resetTransform();c.scale(canvas.width/W,canvas.height/H);c.globalAlpha=1;c.filter='none';bg(t);let k=0;while(k<6&&t>=cuts[k+1])k++;scenes[k](t-cuts[k]);grain();};
window.ready=(async()=>{
  manifest=await fetch('assets/manifest.json').then(r=>r.json());
  await Promise.all(manifest.assets.filter(a=>a.theme==='light').map(async a=>{const name=a.name.replace(/\.png$/,'');M[name]=a;const im=new Image();im.src='assets/'+a.file.split('/').pop();try{await im.decode();}catch(e){throw new Error('Asset failed: '+im.src+' '+e.message)}I[name]=im;}));
  await document.fonts.ready;window.renderFrame(0);return {assets:Object.keys(I),duration:48,width:W,height:H};
})();
let playing=false,base=0,start=0;const audio=document.querySelector('#music'),seek=document.querySelector('#seek'),play=document.querySelector('#play');
function tick(){if(!playing)return;let t=base+(performance.now()-start)/1000;if(t>=48){playing=false;t=47.999;play.textContent='Play';audio.pause()}window.renderFrame(t);seek.value=t;document.querySelector('#time').textContent=`0:${String(Math.floor(t)).padStart(2,'0')} / 0:48`;requestAnimationFrame(tick)}
play.onclick=async()=>{await window.ready;playing=!playing;if(playing){base=Number(seek.value);if(base>47.9)base=0;start=performance.now();audio.currentTime=base;audio.play().catch(()=>{});play.textContent='Pause';tick()}else{base=Number(seek.value);audio.pause();play.textContent='Play'}};
seek.oninput=async()=>{await window.ready;base=Number(seek.value);start=performance.now();audio.currentTime=base;window.renderFrame(base)};
