import {bossDamage} from './BossBattleSystem.js';
import {mineAttackDamage} from './HeatSystem.js';
import {heroMaxHP} from './BattleContext.js';
import {livingEnemies,syncEncounter} from './EncounterData.js';
import {cleanseStatuses} from './StatusEffectSystem.js';
import {ScrollData,ScrollConfig} from './ScrollData.js';
import {GameConfig as config} from './GameConfig.js';
export function applyScrollEffect(state,data,targetId=null,powerModifier=0){
 const before={hp:state.hero.hp,shield:state.hero.shield,monsterHP:state.monsterHP};
 const alive=livingEnemies(state),primary=alive.find(e=>e.id===targetId)||alive[0],impacts=[];
 if(state.enemies){
  let targets=primary?[primary]:[];
  if(data.targetType==='ALL_ENEMIES')targets=alive;
  if(data.targetType==='RANDOM_ENEMIES')targets=primary?[primary,...alive.filter(e=>e!==primary)].slice(0,3):[];
  targets.forEach((e,i)=>{const boost=(state.battleContext?.scrollPowerBonus?.('S')||0)+powerModifier;const amount=data.effect==='lightning'?[26,18,12][i]+boost:data.effect==='meteor'?(e===primary?48+boost:12+powerModifier):data.damage?data.damage+boost:0;const damage=Math.min(e.hp,bossDamage(e,mineAttackDamage(state,e,null,amount).amount));e.hp-=damage;if(data.weaken)e.weaken=Math.max(e.weaken||0,data.weaken);if(damage)impacts.push({enemyId:e.id,damage,killed:e.hp===0});});
  syncEncounter(state);
 }else{if(data.damage)state.monsterHP=Math.max(0,state.monsterHP-data.damage-(state.battleContext?.scrollPowerBonus?.('S')||0)-powerModifier);if(data.weaken)state.scrollWeaken=Math.max(state.scrollWeaken||0,data.weaken);}
 const scrollBoost=(state.battleContext?.scrollPowerBonus?.('S')||0)+powerModifier;
 if(data.heal)state.hero.hp=Math.min(heroMaxHP(state),state.hero.hp+data.heal+scrollBoost);
 if(data.shield)state.hero.shield+=data.shield+scrollBoost;
 if(powerModifier&&!data.damage&&!data.heal&&!data.shield)state.hero.shield+=powerModifier;
 if(data.stop)state.scrollStop=true;
 if(data.cleanse)cleanseStatuses(state);
 return {damage:before.monsterHP-state.monsterHP,heal:state.hero.hp-before.hp,shield:state.hero.shield-before.shield,impacts};
}
export function useScroll(state,reservedSlot=null,targetId=null,powerModifier=0){
 const index=reservedSlot?state.scrolls.indexOf(reservedSlot):Math.min(state.scrollIndex,state.scrolls.length-1);
 const slot=state.scrolls[index];if(!slot||slot.uses<=0)return null;
 const data=ScrollData[slot.type];if(!data)return null;
 slot.uses--;state.stats.scrolls++;const result=applyScrollEffect(state,data,targetId,powerModifier);
 if(slot.uses===0)state.scrolls.splice(index,1);
 state.scrollIndex=Math.max(0,Math.min(index,state.scrolls.length-1));
 return {...data,...result,type:slot.type};
}
export function rewardScroll(state,type){const data=ScrollData[type];if(!data)return false;const found=state.scrolls.find(s=>s.type===type);if(found)found.uses=Math.min(ScrollConfig.maxUses,found.uses+data.uses);else state.scrolls.push({type,uses:data.uses});return true;}
export function generateLoot(state,rng=Math.random,forcedRarity=null){
 const candidates=[],pool=Object.entries(ScrollData);
 for(let n=0;n<ScrollConfig.candidateCount;n++){
  const remaining=pool.filter(([id])=>!candidates.includes(id));
  const rarityPool=Object.entries(ScrollConfig.rarityWeights).map(([r,w])=>[r,w*(r==='rare'||r==='heroic'?(state.encounter?.rewardModifier||1):1)]).filter(([r])=>remaining.some(([,d])=>d.rarity===r));
  let rarity=forcedRarity;if(!rarity||!remaining.some(([,d])=>d.rarity===rarity)){
   let roll=rng()*rarityPool.reduce((sum,[,w])=>sum+w,0);rarity=rarityPool.at(-1)[0];for(const [r,w]of rarityPool){roll-=w;if(roll<0){rarity=r;break;}}
  }
  const choices=remaining.filter(([,d])=>d.rarity===rarity);
  const usedRoles=new Set(candidates.map(id=>ScrollData[id].role));const diverse=choices.filter(([,d])=>!usedRoles.has(d.role));
  const options=diverse.length?diverse:choices;
  candidates.push(options[Math.min(options.length-1,Math.floor(rng()*options.length))][0]);
 }
 return candidates;
}
