import {assistWings} from './CanyonSystem.js';
import {ScrollData} from './ScrollData.js';
import {bossData} from './BossBattleSystem.js';
import {relation} from './AffinitySystem.js';
import {heroMaxHP} from './BattleContext.js';
import {livingEnemies,syncEncounter} from './EncounterData.js';
import {bossDamage,pressureBoss} from './BossBattleSystem.js';
import {mineAttackDamage} from './HeatSystem.js';
const awakened=(data,m)=>relation(data.progress,m.id).awakenedSkillUnlocked;
export function skillValue(data,m,event,state){
 const effect=m.effect==='adaptive'?(event.kind==='defense'?'shield':'damage'):m.effect;
 const base=effect==='shield'&&m.effect==='adaptive'?m.defenseValue:m.effectValue;
 const r=relation(data.progress,m.id);if(r.affinityLevel===1)return base;
 if(!r.awakenedSkillUnlocked)return base+1;
 const s=event.action?.targetGrade==='S';
 switch(m.id){
 case 'rowen':return s?7:6;
 case 'bram':return s?8:7;
 case 'sera':return 15;
 case 'luna':return base+({damage:2,weaken:2,heal:3,protect:3}[ScrollData[event.type||event.action?.scrollEffect]?.role]||1);
 case 'kain':return 13+(livingEnemies(state).find(e=>e.id===event.enemyId)?.boss?.breakTurns||livingEnemies(state).find(e=>e.id===event.enemyId)?.elite?.breakTurns?4:0);
 case 'elia':return effect==='shield'?13:11;
 default:return base;
 }
}
export function incomingCompanionDamage(data,run,state,damage){
 const k=run.skillState;if(state.battleContext?.mode!=='rpg'||!k?.guardReady||k.guardTurn!==state.turn||damage<12)return damage;
 k.guardReady=false;return Math.max(1,damage-3);
}
export function emergencySupport(data,run,m,event,state,ledger=null){
 if(state.battleContext?.mode!=='rpg'||m.id!=='sera'||!awakened(data,m)||!['attack','defense'].includes(event.kind)||state.hero.hp<=0||state.hero.hp>heroMaxHP(state)*.2)return null;
 const k=run.skillState??={};if(k.seraEmergencyUsed)return null;
 const c=ledger||data.progress.mercenaryContractState,id=run.id+':sera-emergency';if(c.eventIds.includes(id))return null;
 const value=Math.min(6,heroMaxHP(state)-state.hero.hp);state.hero.hp+=value;k.seraEmergencyUsed=true;c.eventIds.push(id);data.progress.mercenaryStats.supports++;
 return {id,kind:'mercenary',mercenaryId:m.id,grade:m.grade,effect:'heal',value,compact:true,text:`세라 · 생명의 기도! 긴급 회복 +${value} (모험당 1회)`};
}
export function skillExtras(data,run,m,event,state,result,{damageBudget=Infinity}={}){
 if(!awakened(data,m))return result;
 if(m.id==='bram'&&event.action?.targetGrade==='S'){const k=run.skillState??={};k.guardReady=true;k.guardTurn=state.turn;result.text+=' · 이번 턴 강한 일반 반격 -3';}
 if(m.id==='rowen'&&event.action?.targetGrade==='S'){
  const others=livingEnemies(state).filter(e=>e.id!==result.enemyId),second=others[0];
  if(second){const value=Math.min(second.hp,damageBudget,bossDamage(second,mineAttackDamage(state,second,null,3).amount));second.hp-=value;state.totalDamage+=value;syncEncounter(state);result.secondary={enemyId:second.id,value};result.text+=` · 관통 피해 +${value}`;}
  else {const boss=livingEnemies(state).find(e=>e.boss);if(boss){const broke=boss.type==='dragonGuardian'?(assistWings(boss,.25),false):pressureBoss(boss,'B');if(broke){event.bossBreak=true;if(event.action)event.action.bossBreak=true;}result.text+=' · 보스 BREAK 압박 +0.25';}}
 }
 if(m.id==='elia'){const boss=livingEnemies(state).find(e=>e.boss);if(boss)result.text+=' · '+bossData(boss).phases[boss.boss.phase-1].hint;}
 return result;
}
