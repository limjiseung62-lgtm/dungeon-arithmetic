import {ScrollData,ScrollConfig} from './ScrollData.js';
import {GameConfig as config} from './GameConfig.js';
export function applyScrollEffect(state,data){
 const before={hp:state.hero.hp,shield:state.hero.shield,monsterHP:state.monsterHP};
 if(data.damage)state.monsterHP=Math.max(0,state.monsterHP-data.damage);
 if(data.heal)state.hero.hp=Math.min(config.heroHP,state.hero.hp+data.heal);
 if(data.shield)state.hero.shield+=data.shield;
 if(data.weaken)state.scrollWeaken=Math.max(state.scrollWeaken||0,data.weaken);
 if(data.stop)state.scrollStop=true;
 if(data.cleanse){for(const status of ScrollConfig.cleanseable){if(status==='poison')state.hero.poison=0;else if(status==='web'||status==='stone'){if(state.blocked?.type===status)state.blocked=null;if(state.nextBlocked?.type===status)state.nextBlocked=null;}else if(status==='steal')state.stolen=false;else if(status==='shift')state.shifted=false;else state[status]=false;}}
 return {damage:before.monsterHP-state.monsterHP,heal:state.hero.hp-before.hp,shield:state.hero.shield-before.shield};
}
export function useScroll(state,reservedSlot=null){
 const index=reservedSlot?state.scrolls.indexOf(reservedSlot):Math.min(state.scrollIndex,state.scrolls.length-1);
 const slot=state.scrolls[index];if(!slot||slot.uses<=0)return null;
 const data=ScrollData[slot.type];if(!data)return null;
 slot.uses--;state.stats.scrolls++;const result=applyScrollEffect(state,data);
 if(slot.uses===0)state.scrolls.splice(index,1);
 state.scrollIndex=Math.max(0,Math.min(index,state.scrolls.length-1));
 return {...data,...result,type:slot.type};
}
export function rewardScroll(state,type){const data=ScrollData[type];if(!data)return false;const found=state.scrolls.find(s=>s.type===type);if(found)found.uses=Math.min(ScrollConfig.maxUses,found.uses+data.uses);else state.scrolls.push({type,uses:data.uses});return true;}
export function generateLoot(state,rng=Math.random,forcedRarity=null){
 const candidates=[],pool=Object.entries(ScrollData);
 for(let n=0;n<ScrollConfig.candidateCount;n++){
  const remaining=pool.filter(([id])=>!candidates.includes(id));
  const rarityPool=Object.entries(ScrollConfig.rarityWeights).filter(([r])=>remaining.some(([,d])=>d.rarity===r));
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
