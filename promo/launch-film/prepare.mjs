import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const assets=[];
for(const [folder,prefix] of [['assets','brand'],['assets-v2/library','lib'],['assets-v2/workflow','flow']]){
 const m=JSON.parse(await readFile(resolve(root,folder,'manifest.json'),'utf8'));
 for(const a of m.assets){
  if(prefix==='brand'&&!['light-wordmark-large','light-new-task','light-view-switch'].includes(a.name))continue;
  assets.push({...a,name:prefix==='brand'?a.name:`${prefix}-${a.name}`,src:folder+'/'+a.file.split('/').pop()});
 }
}
const aliases={
 'lib-player-header':'lib-musician-header','lib-player-A-form':'lib-musician-A-form','lib-player-B-form':'lib-musician-B-form','lib-player-form-empty':'lib-musician-form-empty','lib-player-AB-created':'lib-musician-AB-created',
 'flow-week-empty':'flow-rec-calendar-clean','flow-pool-before':'flow-pool-expanded','flow-pool-card':'flow-pool-task',
 'flow-block-60':'flow-rec-60-block','flow-block-90':'flow-rec-90-block','flow-stat-60':'flow-rec-60-stat','flow-stat-75':'flow-rec-75-stat','flow-stat-90':'flow-rec-90-stat','flow-pool-60':'flow-rec-60-stat',
 'flow-edit-full':'flow-edit-after-full','flow-edit-stat':'flow-edit-after-stat','flow-session-A-full':'flow-rec-90-full','flow-session-B-full':'flow-session-b-full',
 'flow-credit-entry':'flow-export-menu','flow-credits-copied':'flow-credits-copied-modal',
};
for(const [name,source] of Object.entries(aliases)){const a=assets.find(a=>a.name===source);if(a)assets.push({...a,name});}
await writeFile(resolve(root,'film-data.js'),'window.MUSCHE_FILM_DATA='+JSON.stringify({duration:57.6,assets})+';\n');
console.log('Prepared '+assets.length+' authentic product components.');
