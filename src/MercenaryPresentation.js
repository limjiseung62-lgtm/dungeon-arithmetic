import {relationSummary} from './CompanionView.js';
import {departureLine,companionAbilityText} from './AffinitySystem.js';
import {artHTML} from './AssetManifest.js';
import {MercenaryData,mercenaryById} from './MercenaryData.js';
import {dungeonById} from './DungeonData.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image=(m,kind='portrait')=>`<img class="mercenary-art" src="${kind==='portrait'?m.portraitAsset:m.battleAsset}" alt="${m.name} · ${m.role}" loading="${kind==='portrait'?'lazy':'eager'}" decoding="async" width="480" height="720">`;
export {mercenaryGuildHTML,mercenaryDetailHTML,replacementHTML,partyHTML,companionHTML} from './MercenaryRosterView.js';
const supportHandles=new Set(),supportTargets=new Set();
let supportQueueToken=0;
export function clearMercenaryPresentation(){supportQueueToken++;clearSupportNodes();}
function clearSupportNodes(){for(const id of supportHandles)clearTimeout(id);supportHandles.clear();for(const target of supportTargets)target.classList.remove('mercenary-hit');supportTargets.clear();document.querySelectorAll('.mercenary-support').forEach(n=>n.remove());}
function supportLater(fn,ms){const id=setTimeout(()=>{supportHandles.delete(id);fn();},ms);supportHandles.add(id);}
export function showMercenarySupport(event,host,audio,{reduced=false,scale=1,fast=false,detail='normal',awakened=false}={}){
 const m=mercenaryById(event.mercenaryId);if(!m||!host)return 0;
 const cell=m.id==='rowen'||m.id==='faye'?0:m.id==='aiden'?1:m.id==='nox'?2:event.effect==='shield'?3:null,projectile=cell!==null?`<svg viewBox="0 0 100 100" aria-hidden="true"><svg viewBox="${cell%2*100} ${Math.floor(cell/2)*100} 100 100" width="100" height="100"><image href="assets/combat-v35/supportAtlas.webp" width="200" height="200" preserveAspectRatio="none"/></svg></svg>`:`<img src="${event.effect==='damage'?'assets/presentation-v35/slash.webp':'assets/presentation-v35/magic.webp'}" alt="">`;clearSupportNodes();const compact=event.compact||fast||detail==='simple'||!event.representative,duration=reduced?100:(compact?(fast?180:300):event.mercenaryId==='kain'?1100:1000)*scale;
 const layer=document.createElement('div');layer.className=`mercenary-support support-${m.id} effect-${event.effect} ${compact?'compact':''} ${awakened?'awakened':''}`;layer.style.setProperty('--merc-time',duration+'ms');layer.innerHTML=`<div class="mercenary-actor">${image(m,'battle')}</div><div class="mercenary-projectile ${cell!==null?'physical-projectile':''}">${projectile}</div><div class="mercenary-impact"></div><div class="mercenary-support-copy" role="status"><strong>${event.text}</strong><small>${esc(event.dialogue||m.dialogue)}</small></div>`;host.append(layer);audio?.play(event.effect==='shield'?'guard':event.effect==='damage'?'attack':'magic',{grade:m.grade,type:event.effect==='heal'?'heal':event.effect==='scroll'?'fire':'shield'});
 const target=event.enemyId&&host.querySelector(`[data-enemy-id="${event.enemyId}"] .enemy-body`);
 if(target){const stage=host.getBoundingClientRect(),box=target.getBoundingClientRect(),x=box.left+box.width/2-stage.left,y=box.top+box.height/2-stage.top;layer.querySelector('.mercenary-impact').style.left=(x-55)+'px';layer.querySelector('.mercenary-impact').style.top=(y-55)+'px';layer.querySelector('.mercenary-projectile').style.top=y+'px';layer.style.setProperty('--merc-distance',(x-stage.width*.28)+'px');target.classList.add('mercenary-hit');supportTargets.add(target);supportLater(()=>{target.classList.remove('mercenary-hit');supportTargets.delete(target);},duration);}
 supportLater(()=>layer.remove(),duration+80);return duration;
}

export async function playSupportQueue(events,host,audio,{wait,valid=()=>true,scale=1,reduced=false,fast=false,detail='normal',afterSupport=()=>{}}={}){clearMercenaryPresentation();const token=supportQueueToken,list=(events||[]).filter(Boolean),awakened=list.filter(e=>e.awakened),representative=awakened.find(e=>e.mercenaryId==='kain')||awakened[0]||list.find(e=>e.cosmetic&&e.mercenaryId==='rowen');for(const event of list){if(token!==supportQueueToken||!valid())return false;const full=event===representative&&!fast&&!reduced&&detail!=='simple',duration=showMercenarySupport({...event,representative:full,compact:!full},host,audio,{reduced,scale,fast,detail,awakened:!!event.awakened});await wait(duration/Math.max(.01,scale));if(token!==supportQueueToken||!valid())return false;afterSupport(event);}if(token===supportQueueToken)clearSupportNodes();return true;}
