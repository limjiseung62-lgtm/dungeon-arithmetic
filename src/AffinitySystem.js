import {MercenaryData} from './MercenaryData.js';
import {AffinityConfig,RelationshipNames,CompanionStories,CompanionLines,CompanionSupportLines,personalQuestById} from './AffinityData.js';
export const blankRelation=()=>({affinityLevel:1,affinityProgress:0,completedDungeonsTogether:0,dungeonCounts:{},personalQuestUnlocked:false,personalQuestCompleted:false,awakenedSkillUnlocked:false,unlockedDialogues:[1],claimIds:[]});
export const blankRelationships=()=>Object.fromEntries(MercenaryData.map(m=>[m.id,blankRelation()]));
export function relation(p,id){p.mercenaryRelations??=blankRelationships();return p.mercenaryRelations[id];}
export function relationshipLabel(p,id){const r=relation(p,id);return '★'.repeat(r.affinityLevel)+'☆'.repeat(3-r.affinityLevel)+' · '+RelationshipNames[r.affinityLevel-1];}
export function companionAbilityText(p,id){const r=relation(p,id),m=MercenaryData.find(m=>m.id===id);if(!m)return '';if(!m.isCoreMercenary)return m.description;return r.awakenedSkillUnlocked?CompanionStories[id].skill+' · '+CompanionStories[id].skillText:`${m.role} · ${m.trigger==='victory'?'승리':m.trigger==='magic'?'S 두루마리':m.trigger==='defense'?'방어 A/S':m.trigger==='dual'?'공격/방어 S':'공격 '+m.grades.join('/')} 지원 +${m.supportValue}${m.effect==='adaptive'?' · 방어 S +4':''} · 전투당 ${m.maxPerEncounter}회`+(r.affinityLevel===2?' · 신뢰 보너스 +1':'');}
export function rewardAffinityClear(data,run,state,memberId=data.progress.activeMercenary){
 const p=data.progress,id=memberId,c=run.partyState?{status:'active',runId:run.id,successfulEncounters:run.partyState.members.includes(id)?run.partyState.successfulEncounters:[]}:p.mercenaryContractState,r=id&&relation(p,id),claim=run.id+':affinity-clear';
 if(!r||run.personalQuestId||run.status!=='clear'||r.claimIds.includes(claim)||c?.status!=='active'||c.runId!==run.id||!run.completed.length||!run.completed.every(i=>c.successfulEncounters.includes(i)))return null;
 const previous=r.dungeonCounts[run.dungeonId]||0,base=previous===0?AffinityConfig.clearPoints[run.dungeonId]:previous===1?AffinityConfig.repeatPoints:0;
 const firstBoss=state.enemies.find(e=>e.boss&&e.hp===0&&e.type&&!r.claimIds.includes('first-boss:'+e.type));
 const boss=firstBoss?AffinityConfig.bossBonus:0,points=base+boss,before=r.affinityLevel;
 if(firstBoss)r.claimIds.push('first-boss:'+firstBoss.type);
 r.claimIds.push(claim);r.completedDungeonsTogether++;r.dungeonCounts[run.dungeonId]=previous+1;r.affinityProgress=Math.min(AffinityConfig.progressCap,r.affinityProgress+points);
 if(r.affinityProgress>=AffinityConfig.trustedAt){r.affinityLevel=Math.max(2,r.affinityLevel);r.personalQuestUnlocked=!!MercenaryData.find(m=>m.id===id)?.isCoreMercenary;if(!r.unlockedDialogues.includes(2))r.unlockedDialogues.push(2);}
 return {mercenaryId:id,points,before,level:r.affinityLevel,text:r.affinityLevel>before?'믿을 수 있는 동료 · 새로운 이야기와 개인 퀘스트가 열렸어요!':points?'함께한 모험이 신뢰가 되었어요.':'함께한 기록이 남았어요. 새로운 지역에서도 모험해 봐요.'};
}
export function rewardAffinityPartyClear(data,run,state){return (run.partyState?.members||[data.progress.activeMercenary].filter(Boolean)).map(id=>rewardAffinityClear(data,run,state,id)).filter(Boolean);}
export function awakenCompanion(p,id,questId){
 const q=personalQuestById(questId),r=relation(p,id),claim='personal-report:'+questId;
 if(!q||q.mercenaryId!==id||!r.personalQuestUnlocked||!p.rewardedQuests.includes(questId)||r.claimIds.includes(claim))return null;
 r.claimIds.push(claim);r.affinityLevel=3;r.affinityProgress=AffinityConfig.progressCap;r.personalQuestCompleted=true;r.awakenedSkillUnlocked=true;r.unlockedDialogues=[1,2,3];
 return {mercenaryId:id,skill:CompanionStories[id].skill,text:'진정한 동료 · '+CompanionStories[id].skill+' 해금!'};
}
export function departureLine(p,id,dungeonId){const r=relation(p,id),m=MercenaryData.find(m=>m.id===id);if(!m?.isCoreMercenary)return m?.dialogue||'';if(dungeonId==='black-fortress'&&r.affinityLevel>=2)return ({rowen:'지휘관의 움직임을 읽을게. 함께 사기를 꺾자!',bram:'성채의 검격은 무겁다. 네가 판단하는 동안 방패로 버티겠다.',sera:'어둠의 축복에 흔들리지 말아요. 당신 곁의 빛을 지킬게요.',luna:'저 사제의 마력부터 끊자. 성채의 봉인도 함께 읽어 볼게.',kain:'이 성채… 나를 쓰러뜨렸던 어둠의 기사가 기다리고 있다. 이번엔 함께 간다.',elia:'혼돈의 그림자가 성채 너머에 있구나. 먼저 어둠의 봉인을 넘어가렴.'})[id];const special=CompanionLines.region[id]?.[dungeonId];return special||CompanionStories[id].departures[r.affinityLevel-1];}
export function situationalLine(p,run,event,state){
 const id=p.activeMercenary;if(!id||state.battleContext?.mode!=='rpg'||!p.mercenaryContractState)return null;
 if(!MercenaryData.find(m=>m.id===id)?.isCoreMercenary)return (event.supports||[event.support].filter(Boolean)).some(v=>v.mercenaryId===id)?{mercenaryId:id,text:MercenaryData.find(m=>m.id===id).dialogues[state.turn%2]}:null;
 if(run.personalQuestId==='personal-rowen'&&event.kind==='attack'&&event.action?.targetGrade==='S'&&!run.rowenDecisiveSeen&&state.enemies.some(e=>e.boss&&e.hp<=e.maxHP*.5)){
  run.rowenDecisiveSeen=true;run.lastCompanionLineTurn=state.turn;
  const matching=(event.supports||[event.support].filter(Boolean)).find(v=>v.mercenaryId===id);
  if(matching)matching.text='로웬 · 단 한 발의 기회! '+matching.text;
  else {const cosmetic={id:run.id+':decisive-arrow',kind:'mercenary',mercenaryId:id,grade:'B',effect:'damage',value:0,enemyId:event.enemyId,compact:false,cosmetic:true,text:'로웬 · 결정적 화살! 함께 만든 기회를 놓치지 않을게!'};event.supports??=[event.support].filter(Boolean);event.supports.push(cosmetic);event.support??=cosmetic;}
  return {mercenaryId:id,text:'이번엔 놓치지 않아. 우리가 만든 한 발이야!'};
 }
 if(state.turn-(run.lastCompanionLineTurn??-4)<4)return null;
 let key=(event.bossBreak||event.action?.bossBreak)?'break':state.hero.hp>0&&state.hero.hp<=state.battleContext.heroMaxHP*.3?'low':event.kind==='attack'&&event.action?.targetGrade==='S'?'perfect':null;
 const boss=state.enemies.find(e=>e.boss),special=CompanionLines.region[id]?.[boss?.type];if(special&&!run.bossCompanionHintSeen){run.bossCompanionHintSeen=true;key='region';}
 if(!key&&event.support&&relation(p,id).affinityLevel>=2)key='support';
 if(!key)return null;const eventId=run.id+':line:'+state.encounterIndex+':'+state.turn+':'+key;
 run.companionLineIds??=[];if(run.companionLineIds.includes(eventId))return null;run.companionLineIds.push(eventId);run.lastCompanionLineTurn=state.turn;
 const variation=(run.companionLineVariation||0)%2;run.companionLineVariation=(run.companionLineVariation||0)+1;
 return {mercenaryId:id,text:key==='region'?special:key==='support'?CompanionSupportLines[id][relation(p,id).affinityLevel-2]:CompanionLines[key][variation]};
}
export function validateRelationships(p){
 const values=p.mercenaryRelations;if(!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).length!==MercenaryData.length)return false;
 const n=v=>Number.isSafeInteger(v)&&v>=0&&v<=1e9;
 for(const m of MercenaryData){const r=values[m.id];if(!r||![1,2,3].includes(r.affinityLevel)||!n(r.affinityProgress)||r.affinityProgress>AffinityConfig.progressCap||!n(r.completedDungeonsTogether)||!r.dungeonCounts||typeof r.dungeonCounts!=='object'||Array.isArray(r.dungeonCounts)||Object.entries(r.dungeonCounts).some(([id,v])=>!Object.keys(AffinityConfig.clearPoints).includes(id)||!n(v))||Object.values(r.dungeonCounts).reduce((a,b)=>a+b,0)!==r.completedDungeonsTogether)return false;
  for(const key of ['personalQuestUnlocked','personalQuestCompleted','awakenedSkillUnlocked'])if(typeof r[key]!=='boolean')return false;
  if(m.isCoreMercenary?(r.personalQuestUnlocked!==(r.affinityLevel>=2)||r.personalQuestCompleted!==(r.affinityLevel===3)||r.awakenedSkillUnlocked!==r.personalQuestCompleted||r.affinityLevel===3&&!p.rewardedQuests.includes('personal-'+m.id)):(r.affinityLevel>2||r.personalQuestUnlocked||r.personalQuestCompleted||r.awakenedSkillUnlocked))return false;
  if(r.affinityLevel===1&&r.affinityProgress>=AffinityConfig.trustedAt||r.affinityLevel>=2&&r.affinityProgress<AffinityConfig.trustedAt)return false;
  if(!Array.isArray(r.unlockedDialogues)||JSON.stringify(r.unlockedDialogues)!==JSON.stringify(Array.from({length:r.affinityLevel},(_,i)=>i+1))||!Array.isArray(r.claimIds)||new Set(r.claimIds).size!==r.claimIds.length||r.claimIds.some(id=>typeof id!=='string'||id.length>250))return false;
 }
 return true;
}
