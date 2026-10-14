/* 57.6 seconds / 100 BPM / 24 bars. A complete, authentic Musche workflow. */
'use strict';
const W=1920,H=1080,D=57.6,cv=document.querySelector('#film'),c=cv.getContext('2d',{alpha:false});
const C={paper:'#f4f2ed',ink:'#292b27',muted:'#84877f',line:'#d6d9d1',blue:'#007aff',purple:'#a855f7',green:'#32b46b'};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,p)=>a+(b-a)*p;
const ease=p=>{p=clamp(p);return p*p*p*(p*(p*6-15)+10)},out=p=>1-Math.pow(1-clamp(p),4);
const E=(t,a,b)=>ease((t-a)/(b-a)),O=(t,a,b)=>out((t-a)/(b-a));
const spring=p=>p<=0?0:p>=1?1:1-Math.exp(-7.6*p)*(Math.cos(10.5*p)+.5*Math.sin(10.5*p));
const S=(t,a,b)=>spring(clamp((t-a)/(b-a)));
const I={},M={},font='"PingFang SC", "Helvetica Neue", Arial, sans-serif',mono='"SF Mono", Menlo, monospace';
function save(fn){c.save();fn();c.restore()}
function fade(a,fn){if(a<=0)return;save(()=>{c.globalAlpha*=clamp(a);fn()})}
function rr(x,y,w,h,r=20){c.beginPath();c.roundRect(x,y,Math.max(.01,w),Math.max(.01,h),Math.max(0,Math.min(r,w/2,h/2)))}
function box(x,y,w,h,r=20,color='#fff',shadow=0){save(()=>{if(shadow){c.shadowColor=`rgba(38,43,33,${shadow})`;c.shadowOffsetY=20;c.shadowBlur=48}rr(x,y,w,h,r);c.fillStyle=color;c.fill()})}
function line(x,y,x2,y2,color=C.line,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function text(str,x,y,size=30,weight=500,color=C.ink,align='left',family=font){c.font=`${weight} ${size}px ${family}`;c.textBaseline='alphabetic';c.textAlign=align;c.fillStyle=color;c.fillText(str,x,y)}
function label(str,x,y,color=C.muted){save(()=>{c.letterSpacing='2.5px';text(str,x,y,17,500,color)})}
function move(x,y,s,r,fn){save(()=>{c.translate(x,y);c.rotate(r*Math.PI/180);c.scale(s,s);fn()})}
function bounds(name){return M[name]?.bounds??{x:0,y:0,width:I[name]?.width??100,height:I[name]?.height??100}}
function image(name,x,y,w,h){const im=I[name];if(!im)return;h=h??w*im.height/im.width;c.drawImage(im,x,y,w,h)}
function card(name,x,y,w,{h=null,angle=0,alpha=1,shadow=.12,r=18,scale=1}={}){if(!I[name])return;h=h??w*I[name].height/I[name].width;fade(alpha,()=>move(x+w/2,y+h/2,scale,angle,()=>{box(-w/2,-h/2,w,h,r,'#fff',shadow);rr(-w/2,-h/2,w,h,r);c.clip();image(name,-w/2,-h/2,w,h)}))}
function fitted(name,x,y,w,h,o={}){if(!I[name])return;let k=Math.min(w/I[name].width,h/I[name].height);let aw=I[name].width*k,ah=I[name].height*k;card(name,x+(w-aw)/2,y+(h-ah)/2,aw,{...o,h:ah});return {x:x+(w-aw)/2,y:y+(h-ah)/2,w:aw,h:ah}}
function crop(name,s,x,y,w,h,r=16,shadow=.1){const im=I[name],b=bounds(name);if(!im)return;box(x,y,w,h,r,'white',shadow);save(()=>{rr(x,y,w,h,r);c.clip();c.drawImage(im,(s.x-b.x)*im.width/b.width,(s.y-b.y)*im.height/b.height,s.width*im.width/b.width,s.height*im.height/b.height,x,y,w,h)})}
function slicedCard(name,x,y,w,h){const im=I[name];if(!im)return;box(x,y,w,h,8,'#fafafa',.05);save(()=>{rr(x,y,w,h,8);c.clip();const k=w/im.width,top=im.height*.31,bottom=im.height*.43;c.drawImage(im,0,0,im.width,top,x,y,w,top*k);c.drawImage(im,0,top,im.width,im.height-top-bottom,x,y+top*k,w,Math.max(1,h-(top+bottom)*k));c.drawImage(im,0,im.height-bottom,im.width,bottom,x,y+h-bottom*k,w,bottom*k);});}
function blend(a,b,p,x,y,w,o={}){card(a,x,y,w,o);fade(p,()=>card(b,x,y,w,{...o,shadow:0}))}
function pill(str,x,y,w,color='#fff',ink=C.ink){box(x,y,w,48,24,color,.04);text(str,x+w/2,y+31,22,500,ink,'center')}
function dot(x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()}
function pointer(x,y,s=1,press=0){move(x,y,s*(1-.13*press),-9,()=>{c.shadowColor='#20302022';c.shadowBlur=12;c.shadowOffsetY=7;c.beginPath();c.moveTo(0,0);c.lineTo(4,37);c.lineTo(14,27);c.lineTo(24,45);c.lineTo(31,41);c.lineTo(21,23);c.lineTo(35,20);c.closePath();c.fillStyle='white';c.fill();c.shadowColor='transparent';c.lineWidth=2.2;c.strokeStyle=C.ink;c.stroke()})}
function resizePointer(x,y,s=1){move(x,y,s,0,()=>{c.strokeStyle=C.ink;c.fillStyle='white';c.lineWidth=3;c.beginPath();c.moveTo(0,-20);c.lineTo(-8,-11);c.lineTo(-3,-11);c.lineTo(-3,11);c.lineTo(-8,11);c.lineTo(0,20);c.lineTo(8,11);c.lineTo(3,11);c.lineTo(3,-11);c.lineTo(8,-11);c.closePath();c.fill();c.stroke()})}
function ring(x,y,t,color=C.blue){if(t<0||t>1)return;fade(1-t,()=>{c.beginPath();c.arc(x,y,12+70*out(t),0,2*Math.PI);c.lineWidth=2;c.strokeStyle=color;c.stroke()})}
function reveal(str,x,y,size,t,a,width=1560){save(()=>{c.beginPath();c.rect(x-5,y-size-15,width,size+30);c.clip();text(str,x,y+(1-S(t,a,a+.85))*size*1.25,size,550)})}
function heading(n,title,sub,t,len){fade(O(t,0,.5)*(1-E(t,len-.65,len)),()=>{label(n+' / MUSCHE',112,85);reveal(title,112,164,55,t,.06);fade(O(t,.35,.9),()=>text(sub,115,211,23,400,C.muted))})}
function wave(x,y,w,t,amp=22){c.beginPath();for(let i=0;i<=w;i+=4){let u=i/w,yy=y+Math.pow(Math.sin(u*Math.PI),2)*amp*Math.sin(u*35-t*3)*Math.sin(u*10+t);i?c.lineTo(x+i,yy):c.moveTo(x+i,yy)}c.strokeStyle=C.blue;c.lineWidth=2;c.stroke()}
function logo(x,y,w){image('light-wordmark-large',x,y,w)}
function bg(t){c.fillStyle=C.paper;c.fillRect(0,0,W,H);let g=c.createRadialGradient(900+100*Math.sin(t*.13),350,0,960,540,1100);g.addColorStop(0,'#ffffff60');g.addColorStop(1,'#cccec315');c.fillStyle=g;c.fillRect(0,0,W,H)}
function arcPoint(a,b,p,lift=100){return{x:mix(a.x,b.x,p),y:mix(a.y,b.y,p)-Math.sin(Math.PI*p)*lift}}
function get(...names){return names.find(n=>I[n])??names[0]}
function control(name,label){return M[name]?.controls?.find(a=>a.label===label)?.bounds}
function numeral(value,x,y,size=100,decimals=1,color=C.ink,prefix='×'){
 const scaled=Math.max(0,value)*10**decimals,integer=Math.floor(scaled+1e-7),count=Math.max(2,decimals+1,String(integer).length),cw=size*.602,dy=size*.94;
 text(prefix,x,y,size,550,color,'left',mono);x+=prefix.length*cw;
 for(let i=count-1;i>=0;i--){
  const factor=10**i,digit=Math.floor(scaled/factor)%10,rest=scaled%factor;
  const p=i===0?scaled-Math.floor(scaled):clamp(rest-factor+1);
  save(()=>{c.beginPath();c.rect(x,y-size*.83,cw,size*1.08);c.clip();text(String(digit),x,y-p*dy,size,550,color,'left',mono);if(p>0)text(String((digit+1)%10),x,y+(1-p)*dy,size,550,color,'left',mono)});
  x+=cw;if(i===decimals&&decimals){text('.',x,y,size,550,color,'left',mono);x+=cw;}
 }
}
function progress(t){const names=['Library','Task','Schedule','Ratio','EDIT','Session','Credits'];const starts=[4.8,14.4,21.6,28.8,36,40.8,45.6];if(t<4.8||t>=52.8)return;const cur=starts.findLastIndex(x=>t>=x);fade(.62,()=>{for(let i=0;i<7;i++){let x=115+i*146;line(x,1037,x+112,1037,i<=cur?C.ink:C.line,i===cur?3:1);text(names[i],x,1023,13,i===cur?650:400,i<=cur?C.ink:C.muted)}})}

// The symbolic opening uses the product's actual creation controls.
function opening(t){
 const p=E(t,3.6,4.8);fade(1-p,()=>{label('YOUR COMPLETE MUSIC WORKFLOW',118,110);logo(1570,69,229);reveal('从创作，',278,434,124,t,.1);reveal('到最后一个署名。',492,596,108,t,.65);fade(O(t,1.4,2),()=>text('Your music. Your time.',282,694,28,400,C.muted));wave(135,842,1650,t,35)});
 ['project','instrument','player'].forEach((k,i)=>{const n='lib-'+k+'-header',q=control(n,['项目','乐器','人员'][i]);let z=S(t,3+i*.12,4.45+i*.12);if(q)fade(z,()=>crop(n,q,mix(i%2?-450:2100,230+i*535,z),mix(1180,450+i*27,z),395,136,22,.12));});
}

// Three genuinely created Library records; every form and entry is the real UI.
function library(t){
 heading('01','搭好你的创作阵容。','Project → Instrument → Player',t,9.6);
 const kinds=['project','instrument','player'],caps=['PROJECTS','INSTRUMENTS','PLAYERS'];
 for(let i=0;i<3;i++){
  const a=i*3,enter=S(t,a,a+.65),filled=E(t,a+.45,a+.9),created=E(t,a+1.05,a+1.35),second=E(t,a+2.2,a+2.65);
  const x=140+i*555,y=295+(1-enter)*650,w=525;
  const k=kinds[i],hdr=get('lib-'+k+'-header'),form=get('lib-'+k+'-A-form-crop','lib-'+k+'-A-form'),rows=get('lib-'+k+'-AB-list','lib-'+k+'-AB-created');
  fade(enter,()=>{
   box(x,y,w,615,26,'#fff',.11);label(caps[i],x+28,y+43);
   if(I[hdr])crop(hdr,{...bounds(hdr),height:104},x+18,y+68,w-36,(w-36)*104/320,10,0);
   const fy=y+244,fw=w-44,fh=I[form]?fw*I[form].height/I[form].width:240;
   fade(1-second,()=>{blend('lib-'+k+'-form-empty',form,filled,x+22,fy,fw,{shadow:0});fade(E(t,a+1.45,a+1.8),()=>card('lib-'+k+'-B-form',x+22,fy,fw,{shadow:0}));});
   fade(second,()=>{card(rows,x+22,fy+15,fw,{shadow:0});});
   const add=control(form,'添加'),fb=bounds(form),ax=x+22+(add?add.x-fb.x+add.width/2:fb.width-28)*fw/fb.width,ay=fy+(add?add.y-fb.y+add.height/2:fb.height-20)*fw/fb.width;
   if(t>a+.45&&t<a+2.6)pointer(ax,ay,1.04,Math.sin(E(t,a+1,a+1.3)*Math.PI));
   fade(second,()=>{pill(i===0?'Project A / Project B':i===1?'Instrument A / Instrument B':'Player A / Player B',x+32,y+536,w-64,'#eff2eb',C.ink);});
   ring(ax,ay,(t-a-1.1)/.6);ring(ax,ay,(t-a-2.2)/.6);
  });
 }
 fade(O(t,8.6,9.0)*(1-E(t,9.3,9.6)),()=>{text('资料准备就绪。',960,975,28,500,C.muted,'center')});
}

// New Task: select the actual entities, set music duration, then save into the pool.
function createTask(t){
 heading('02','把想法，变成任务。','选择项目、乐器和人员，设置曲目时长。',t,7.2);
 const inP=S(t,0,.9),fillP=E(t,1.2,2.2),saveP=E(t,4.6,5.3),depart=E(t,5.6,7.2);
 const x=1190,y=280,w=390;
 const empty=get('lib-task-empty'),filled=get('lib-task-filled');
 move(0,70*(1-inP),1,0,()=>{fade(inP*(1-saveP),()=>{card(empty,x,y,w,{shadow:.13});for(const [n,a] of [['task-project-selected',.6],['task-instrument-selected',1.3],['task-musician-selected',2],['task-editor-selected',2.7],['task-filled',3.4]])fade(E(t,a,a+.3),()=>card('lib-'+n,x,y,w,{shadow:0}));});});
 const labels=[['Project A',.3],['Instrument A',1.0],['Player A · REC',1.7],['Player B · EDIT',2.4],['03:00',3.1]];
 labels.forEach(([s,a],i)=>{let p=S(t,a,a+.75);fade(p*(1-depart),()=>{label(i===4?'MUSIC DURATION':String(i+1).padStart(2,'0'),142,332+i*105);text(s,142+40*(1-p),384+i*105,i===4?60:38,500);if(i<4)line(141,410+i*105,601,410+i*105);});});
 fade(O(t,3.9,4.35)*(1-saveP),()=>pointer(x+w*.81,y+600,1.2,E(t,4.3,4.5)*(1-E(t,4.5,4.7))));
 fade(saveP,()=>{const n=get('lib-task-pool-expanded','flow-pool-before');fitted(n,mix(990,115,depart),mix(300,298,depart),mix(650,485,depart),630,{shadow:.13});});
 fade(O(t,5.1,5.6)*(1-depart),()=>pill('任务已创建',1135,900,355,'#e9f1e5',C.ink));
}

function scheduleScene(t){
 heading('03','从任务池，拖入日程。','拿起任务，选择时间，松手即安排。',t,7.2);
 const base=get('flow-week-empty'),pool=get('flow-pool-before'),source=get('flow-pool-card'),block=get('flow-block-60');
 const x=115,y=298,pw=485,bx=660,by=294,bw=1150;
 const bp=bounds(base),b=bounds(block),s=bw/bp.width;
 const dest={x:bx+(b.x-bp.x)*s,y:by+(b.y-bp.y)*s},destW=b.width*s;
 const drag=E(t,2.2,4.8),land=S(t,4.8,5.35);
 card(base,bx,by+65*(1-S(t,0,.85)),bw,{shadow:.12});
 fitted(pool,x,y,pw,630,{shadow:.11});
 const pb=bounds(pool),sb=bounds(source);const fitScale=Math.min(pw/pb.width,630/pb.height);
 const poolX=x+(pw-pb.width*fitScale)/2,poolY=y+(630-pb.height*fitScale)/2;
 const src={x:poolX+(sb.x-pb.x)*fitScale,y:poolY+(sb.y-pb.y)*fitScale},srcW=sb.width*fitScale;
 const pos=arcPoint(src,dest,drag,120),width=mix(srcW,destW,drag);
 // Actual source card remains visible until picked up, then follows the pointer continuously.
 if(t>1.8){
   fade(O(t,1.8,2.15),()=>{
     const cp=E(t,3.6,4.8);card(source,pos.x,pos.y,width,{alpha:1-cp,angle:-5*Math.sin(drag*Math.PI),scale:1+.06*Math.sin(Math.PI*drag),shadow:.18*(1-drag)});
     card(block,pos.x,pos.y,width,{alpha:cp,angle:-5*Math.sin(drag*Math.PI),scale:1+.018*Math.sin(land*Math.PI),shadow:.15*(1-drag),r:mix(12,5,drag)});
   });
 }
 const approach=E(t,.7,1.8),pt=arcPoint({x:640,y:910},{x:src.x+srcW*.65,y:src.y+20},approach,55);
 fade(O(t,.7,1.15)*(1-E(t,5.5,6.0)),()=>pointer(t<2.2?pt.x:pos.x+width*.65,t<2.2?pt.y:pos.y+22,1.1,t>1.85&&t<4.85?.8:0));
 ring(dest.x+destW/2,dest.y+30,(t-4.8)/.8);
 fade(O(t,5.0,5.6),()=>{pill('10:00 — 11:00',1010,906,400,'#e9eef8');});
 // Source and resulting scheduled ratio get a clear before / after state.
 fade(E(t,4.8,5.1),()=>{fitted(get('flow-pool-60','flow-stat-60'),x,y,pw,630,{shadow:0});});
}

function ratio(t){
 heading('04','时间一变，倍率同步。','3 分钟曲目。更充裕的时间，即刻可见。',t,7.2);
 const ramp=E(t,1.2,5.4),minutes=60+ramp*30,ratioValue=minutes/3;
 const block60=get('flow-block-60'),block90=get('flow-block-90');
 const camera=E(t,0,.95),b=bounds(block60),k=460/b.width;
 // Zoomed genuine calendar region keeps the time markings next to the changing block.
 const base=get('flow-week-empty'),bb=bounds(base),targetRegion={x:b.x-86,y:b.y-55,width:b.width+184,height:b.height*1.7+122};
 const region={x:mix(bb.x,targetRegion.x,camera),y:mix(bb.y,targetRegion.y,camera),width:mix(bb.width,targetRegion.width,camera),height:mix(bb.height,targetRegion.height,camera)};
 const panel={x:mix(660,140,camera),y:mix(294,300,camera),w:mix(1150,targetRegion.width*k,camera),h:mix(1150*bb.height/bb.width,targetRegion.height*k,camera)};
 crop(base,region,panel.x,panel.y,panel.w,panel.h,23,.12);
 const x=panel.x+(b.x-region.x)*panel.w/region.width,y=panel.y+(b.y-region.y)*panel.h/region.height,w=b.width*panel.w/region.width,h0=b.height*panel.h/region.height,h=h0*minutes/60;
 // Nine-slice preserves the captured card's type and border while its body grows.
 slicedCard(block60,x,y,w,h);
 // Enlarged ratio is an editorial loupe of the authentic sidebar badge.
 const stat=get('flow-stat-60'),sb=bounds(stat),sx=1080,sy=300,sw=690,sk=sw/sb.width;
 fade(camera,()=>{card(stat,sx,sy,sw,{shadow:.09});
 const rb=bounds('flow-rec-60-ratio'),rx=sx+(rb.x-sb.x)*sk,ry=sy+(rb.y-sb.y)*sk;
 box(rx,ry,rb.width*sk,rb.height*sk,6*sk,'#eeeeee');dot(rx+9*sk,ry+12*sk,3*sk,'#9ca3af');numeral(ratioValue,rx+16*sk,ry+16*sk,12*sk,1);
 // Only live values are composited over their real fields; the original card chrome stays intact.
 box(sx+63*sk,sy+49*sk,108*sk,23*sk,6*sk,'#f6f6f6');text('已排',sx+69*sk,sy+66*sk,12*sk,500,'#929292','left',mono);
 const totalSeconds=minutes*60,m=Math.floor(totalSeconds/60)%60,ss=Math.floor(totalSeconds)%60;
 text(`01:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`,sx+100*sk,sy+66*sk,12*sk,550,'#929292','left',mono);
 box(1080,686,690,281,27,'#fff',.1);label('安排倍率',1122,737);numeral(ratioValue,1123,865,115,1);text('安排时长 / 曲目时长',1127,922,25,400,C.muted);});
 fade(O(t,.75,1.15)*(1-E(t,5.6,6.2)),()=>resizePointer(x+w*.6,y+h,1.25));
 fade(camera,()=>{line(x+w+18,y+h,1032,y+h,'#9caeb6',1.5);dot(x+w+18,y+h,5,C.blue);});
 // Schedule duration and close-up always use the same animation state.
 const total=minutes*60,m2=Math.floor(total/60)%60,s2=Math.floor(total)%60;
 fade(camera,()=>{box(x+22,y+h-37,w-44,32,4,'#fafafa');text(`01:${String(m2).padStart(2,'0')}:${String(s2).padStart(2,'0')}`,x+25,y+h-12,24,550,C.ink,'left',mono);
 const endMins=minutes-60;box(278,868,568,82,24,'#e9eef8');text('10:00 — 11:',315,922,32,500,C.ink,'left',mono);numeral(endMins,315+32*.602*11,922,32,0,C.ink,'');});
 ring(x+w*.6,y+h,(t-5.4)/.8);
}

function edit(t){
 heading('05','录音之后，接力剪辑。','切换 EDIT，继续安排剪辑任务。',t,4.8);
 const p=E(t,1.2,1.8),name=get('flow-edit-full');
 fitted('flow-rec-90-full',400,265,1400,730,{shadow:.13});fade(p,()=>fitted(name,400,265,1400,730,{shadow:0}));
 blend('flow-rec-tabs','flow-edit-tabs',p,116,326,510,{shadow:.1});
 fade(O(t,.3,.7)*(1-E(t,2.1,2.55)),()=>pointer(mix(238,476,E(t,.3,1.1)),367,1.2,E(t,1.1,1.25)*(1-E(t,1.3,1.55))));
 const part=get('flow-edit-stat','flow-edit-pool');card(part,116,512,575,{alpha:O(t,1.6,2.25),angle:-2*(1-E(t,2,2.5)),shadow:.13});
 fade(O(t,2.4,2.9),()=>{label('PLAYER B',131,850);text('从 REC 到 EDIT',127,918,36,500)});
}

function sessions(t){
 heading('06','不同 Session，随时切换。','从 Session A，到 Session B。',t,4.8);
 const p=E(t,1.65,2.65),a=get('flow-session-A-full','flow-edit-full'),b=get('flow-session-B-full');
 card(a,115-1750*p,300,1410,{angle:-3*p,shadow:.12,alpha:1-p});
 card(b,115+1700*(1-p),300,1410,{angle:4*(1-p),shadow:.13,alpha:p});
 const menu=get('flow-session-dropdown');card(menu,1190,278,535,{alpha:O(t,.15,.7)*(1-E(t,2.1,2.65)),shadow:.18});
 fade(O(t,.75,1.1)*(1-E(t,2.4,2.8)),()=>pointer(1450,462,1.15,E(t,1.4,1.6)*(1-E(t,1.65,1.85))));
 fade(O(t,2.8,3.3),()=>{pill('Session B',1310,864,380,'#eef1e8');});
}

function credits(t){
 heading('07','每一份参与，都值得署名。','Project Credits · 生成名单，复制输出。',t,7.2);
 const manager=get('flow-credits-entry-button','flow-credit-entry'),credit=get('flow-credits-modal'),copied=get('flow-credits-copied');
 const p=E(t,1.0,1.8),q=E(t,4.6,5.1);
 fade(1-p,()=>{label('EXPORT',1070,462);fitted(manager,1030,496,640,150,{shadow:.13});pointer(1430,578,1.15,E(t,.7,.9)*(1-E(t,1,1.2)));});
 fade(p,()=>{fitted(credit,847,245,880,755,{shadow:.15});});
 if(I[copied])fade(q,()=>{fitted(copied,847,245,880,755,{shadow:0});});
 fade(O(t,.45,1),()=>{label('PROJECT A',127,405);reveal('Project Credits',125,491,54,t,.5);text('Instrument A',129,622,37,500);text('Player A',129,684,37,500);line(128,737,680,737);text('EDIT · Player B',129,805,29,450,C.muted);wave(127,924,520,t,20);});
 const cb=bounds(credit),copy=bounds('flow-credits-copy-button'),scale=Math.min(880/cb.width,755/cb.height),cx=847+(880-cb.width*scale)/2+(copy.x-cb.x+copy.width/2)*scale,cy=245+(755-cb.height*scale)/2+(copy.y-cb.y+copy.height/2)*scale;
 fade(O(t,3.8,4.2)*(1-E(t,5.2,5.7)),()=>pointer(cx,cy,1.1,E(t,4.4,4.6)*(1-E(t,4.65,4.8))));
 fade(O(t,5.1,5.6),()=>pill('✓  已复制 Credits',1080,918,460,'#e5efdf'));
}

function ending(t){
 const p=S(t,0,.9);fade(O(t,0,.45),()=>{logo(640,270+30*(1-p),640);reveal('把时间，留给音乐。',527,613,78,t,.25);fade(O(t,.95,1.5),()=>text('Your music. Your time.',960,686,30,400,C.muted,'center'));let q=S(t,1.3,2.1);box(960-150*q,797,300*q,62,31,C.ink);fade(O(t,1.6,2.15),()=>text('musche.cn',960,837,25,500,'#fff','center'));});
 fade(O(t,1.1,1.7),()=>wave(230,950,1460,t,16*(1-E(t,2.4,4.8))));
}

const cuts=[0,4.8,14.4,21.6,28.8,36,40.8,45.6,52.8,57.6],scenes=[opening,library,createTask,scheduleScene,ratio,edit,sessions,credits,ending];
window.renderFrame=t=>{t=clamp(t,0,D-.00001);c.resetTransform();c.scale(cv.width/W,cv.height/H);c.globalAlpha=1;bg(t);let k=0;while(k<scenes.length-1&&t>=cuts[k+1])k++;scenes[k](t-cuts[k]);progress(t)};
window.ready=(async()=>{const data=window.MUSCHE_FILM_DATA;if(!data)throw Error('Missing prepared product assets');const cached=new Map();for(const a of data.assets){M[a.name]=a;if(cached.has(a.src)){I[a.name]=cached.get(a.src);continue}const im=new Image();im.src=a.src;try{await im.decode()}catch(e){throw Error('Cannot decode '+a.src+': '+e.message)}I[a.name]=im;cached.set(a.src,im)}await document.fonts.ready;window.renderFrame(0);return{duration:D,assets:Object.keys(I).length,width:W,height:H};})();
const audio=document.querySelector('#music'),seek=document.querySelector('#seek'),play=document.querySelector('#play');let playing=false,start=0,base=0;
function tick(){if(!playing)return;let t=base+(performance.now()-start)/1000;if(t>=D){playing=false;t=D-.001;audio.pause();play.textContent='播放'}window.renderFrame(t);seek.value=t;document.querySelector('#time').textContent=`${t.toFixed(1)} / 57.6 s`;requestAnimationFrame(tick)}
play.onclick=async()=>{await window.ready;playing=!playing;if(playing){base=Number(seek.value);if(base>D-.1)base=0;start=performance.now();audio.currentTime=base;await audio.play().catch(()=>{});play.textContent='暂停';tick()}else{audio.pause();play.textContent='播放'}};
seek.oninput=async()=>{await window.ready;base=Number(seek.value);start=performance.now();audio.currentTime=base;window.renderFrame(base)};
