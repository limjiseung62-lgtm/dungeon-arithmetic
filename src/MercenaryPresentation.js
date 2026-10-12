import {mercenaryAttackProfile} from './MercenaryAttackProfiles.js';
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
export function showMercenarySupport(event,host,audio,{reduced=false,scale=1,fast=false,detail='normal',awakened=false,onImpact=()=>{}}={}){
 const m=mercenaryById(event.mercenaryId);if(!m||!host)return 0;

 clearSupportNodes();const profile=mercenaryAttackProfile(m.id,event.level||1),duration=(reduced?180:fast?260:detail==='simple'?420:710)*scale,contact=duration*.46;if(reduced||fast||detail==='simple')profile.count=Math.min(2,profile.count);
 const layer=document.createElement('div');layer.className='mercenary-support direct-support support-'+m.id+' effect-'+event.effect;layer.dataset.motion=profile.motion;layer.dataset.level=String(profile.level);layer.dataset.limited=String(reduced||fast||detail==='simple');layer.dataset.phase='prepare';layer.style.setProperty('--merc-time',duration+'ms');
 layer.innerHTML='<div class="mercenary-actor">'+image(m,'battle')+'</div><div class="mercenary-strikes">'+Array.from({length:profile.count},(_,i)=>'<i style="--strike:'+i+'"></i>').join('')+'</div><div class="mercenary-impact"></div><div class="mercenary-support-copy" role="status"><strong></strong><small></small><b class="mercenary-damage"></b></div>';
 layer.querySelector('strong').textContent=event.cosmetic?event.text:m.name+' · Lv.'+profile.level+' · '+profile.name;layer.querySelector('small').textContent=event.dialogue||m.dialogue;host.append(layer);
 const target=event.enemyId&&host.querySelector('[data-enemy-id="'+event.enemyId+'"] .enemy-body');
 const stage=host.getBoundingClientRect(),box=target?.getBoundingClientRect();layer.style.setProperty('--support-x',box?Math.max(25,Math.min(75,(box.left+box.width/2-stage.left)/stage.width*100))+'%':'55%');
 supportLater(()=>{layer.dataset.phase='approach';},duration*.2);
 supportLater(()=>{layer.dataset.phase='hit';onImpact(event);layer.querySelector('.mercenary-damage').textContent=event.cosmetic?'함께 만든 기회!':(event.effect==='damage'?'피해 ':event.effect==='shield'?'방어막 +':event.effect==='heal'?'회복 +':event.effect==='pressure'?'BREAK +':'강화 +')+event.value+(event.secondary?' · 관통 '+event.secondary.value:'');if(['arrows','cleave','fists'].includes(profile.motion)&&audio?.playMonsterCue)audio.playMonsterCue('impact',{sound:profile.motion==='arrows'?'arrow':'rock',material:'metal'});else audio?.play(event.effect==='shield'?'guard':event.effect==='damage'?'attack':'magic',{grade:m.grade,type:event.effect==='heal'?'heal':event.effect==='scroll'?'fire':'shield'});if(target){target.classList.add('mercenary-hit');supportTargets.add(target);}},contact);
 supportLater(()=>{layer.dataset.phase='reaction';},contact+Math.min(100,duration*.12));
 supportLater(()=>{layer.dataset.phase='recovery';if(target){target.classList.remove('mercenary-hit');supportTargets.delete(target);}},duration*.8);
 supportLater(()=>layer.remove(),duration+40);return duration;
}

export async function playSupportQueue(events,host,audio,{wait,valid=()=>true,scale=1,reduced=false,fast=false,detail='normal',afterSupport=()=>{},onImpact=()=>{}}={}){clearMercenaryPresentation();const token=supportQueueToken,list=(events||[]).filter(Boolean),awakened=list.filter(e=>e.awakened),representative=awakened.find(e=>e.mercenaryId==='kain')||awakened[0]||list.find(e=>e.cosmetic&&e.mercenaryId==='rowen');for(const event of list){if(token!==supportQueueToken||!valid())return false;const full=event===representative&&!fast&&!reduced&&detail!=='simple',duration=showMercenarySupport({...event,representative:full,compact:!full},host,audio,{reduced,scale,fast,detail,awakened:!!event.awakened,onImpact});await wait(duration/Math.max(.01,scale));if(token!==supportQueueToken||!valid())return false;afterSupport(event);}if(token===supportQueueToken)clearSupportNodes();return true;}
