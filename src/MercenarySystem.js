import {bossDamage} from './BossBattleSystem.js';
import {mineAttackDamage} from './HeatSystem.js';
import {mercenaryById} from './MercenaryData.js';
import {heroMaxHP} from './BattleContext.js';
import {syncEncounter,livingEnemies} from './EncounterData.js';
export const blankMercenaries=()=>({activeMercenary:null,mercenaryContractState:null,mercenaryStats:{hires:0,supports:0,ended:0}});
export function hireMercenary(data,id,{confirm=false,token=id}={}){
 const p=data.progress,m=mercenaryById(id);
 if(!m||p.run)return {ok:false,message:'던전을 마친 뒤 고용할 수 있어요.'};
 if(p.mercenaryContractState?.purchaseToken===token||p.activeMercenary===id)return {ok:false,message:'이미 이 용병과 계약 중입니다.'};
 if(data.character.gold<m.hireCost)return {ok:false,message:'골드가 부족합니다.'};
 if(p.activeMercenary&&!confirm)return {ok:false,needsConfirmation:true,message:`현재 ${mercenaryById(p.activeMercenary).name}과 계약 중입니다. 환불 없이 계약을 해제하고 ${m.name}을 고용할까요?`};
 data.character.gold-=m.hireCost;p.activeMercenary=id;
 p.mercenaryContractState={id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,purchaseToken:token,status:'waiting',runId:null,counts:{},eventIds:[],successfulEncounters:[]};
 p.mercenaryStats.hires++;return {ok:true,message:`${m.name}과 던전 1회 계약! 고용비 ${m.hireCost}G를 지불했습니다.`};
}
export function bindContract(p,run){const c=p.mercenaryContractState;if(c&&p.activeMercenary&&c.status==='waiting'){c.status='active';c.runId=run.id;}}
export function endContract(p,run){const c=p.mercenaryContractState;if(!c||c.status!=='active'||c.runId!==run.id)return false;p.activeMercenary=null;p.mercenaryContractState=null;p.mercenaryStats.ended++;return true;}
export class MercenarySystem{
 constructor(data,run){this.data=data;this.run=run;}
 get member(){const p=this.data.progress,c=p.mercenaryContractState;return c?.status==='active'&&c.runId===this.run.id?mercenaryById(p.activeMercenary):null;}
 eligible(event,state){
  const m=this.member,c=this.data.progress.mercenaryContractState;if(!m||state.battleContext?.mode!=='rpg')return false;
  const grade=event.action?.targetGrade,kind=event.kind;
  if(kind==='victory')return m.trigger==='victory'&&c.successfulEncounters.includes(state.encounterIndex)&&!this.run.completed.includes(state.encounterIndex);
  if(m.trigger==='dual')return ['attack','defense'].includes(kind)&&grade==='S';
  if(kind!==m.trigger)return false;
  if(kind==='magic')return grade==='S'&&!!event.type;
  return m.grades.includes(grade);
 }
 identity(event,state){return `${this.run.id}:${state.encounterIndex}:mercenary:${event.kind==='victory'?'win':state.turn+':'+event.kind+':'+(event.action?.playerId??0)}`;}
 available(event,state){const c=this.data.progress.mercenaryContractState,m=this.member;return this.eligible(event,state)&&!c.eventIds.includes(this.identity(event,state))&&(c.counts[state.encounterIndex]||0)<m.maxPerEncounter;}
 scrollModifier(action,state){return this.available({kind:'magic',type:action.scrollEffect,action},state)?this.member.effectValue:0;}
 support(event,state){
  const c=this.data.progress.mercenaryContractState,m=this.member;if(!m)return null;
  if(['attack','defense'].includes(event.kind)&&!c.successfulEncounters.includes(state.encounterIndex))c.successfulEncounters.push(state.encounterIndex);
  if(!this.available(event,state))return null;
  let effect=m.effect==='adaptive'?(event.kind==='defense'?'shield':'damage'):m.effect,value=m.effect==='adaptive'&&effect==='shield'?m.defenseValue:m.effectValue,actual=0,enemyId=null;
  if(effect==='damage'){const enemy=livingEnemies(state).find(e=>e.id===event.enemyId)||livingEnemies(state)[0];if(!enemy)return null;actual=Math.min(enemy.hp,bossDamage(enemy,mineAttackDamage(state,enemy,null,value).amount));enemy.hp-=actual;enemyId=enemy.id;syncEncounter(state);state.totalDamage+=actual;}
  else if(effect==='shield'){actual=value;state.hero.shield+=actual;}
  else if(effect==='heal'){actual=Math.min(value,heroMaxHP(state)-state.hero.hp);state.hero.hp+=actual;}
  else if(effect==='scroll'){if(!event.mercenaryBoost)return null;actual=event.mercenaryBoost;}
  const id=this.identity(event,state);c.eventIds.push(id);c.counts[state.encounterIndex]=(c.counts[state.encounterIndex]||0)+1;this.data.progress.mercenaryStats.supports++;
  const result={id,kind:'mercenary',mercenaryId:m.id,grade:m.grade,effect,value:actual,enemyId,compact:c.counts[state.encounterIndex]>1,text:`${m.name} 지원! ${effect==='damage'?'추가 피해':effect==='shield'?'방어막':effect==='heal'?'HP 회복':'두루마리 강화'} +${actual}`};
  return result;
 }
}
