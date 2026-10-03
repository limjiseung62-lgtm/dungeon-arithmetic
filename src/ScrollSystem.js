import {ScrollData} from './ScrollData.js';import {GameConfig as config} from './GameConfig.js';
export function useScroll(state,reservedSlot=null){
  if(!state.scrolls.length)return null;
  const index=reservedSlot?state.scrolls.indexOf(reservedSlot):Math.min(state.scrollIndex,state.scrolls.length-1);
  if(index<0)return null;
  const slot=state.scrolls[index],data=ScrollData[slot.type];
  state.stats.scrolls++;slot.uses--;
  if(data.damage)state.monsterHP=Math.max(0,state.monsterHP-data.damage);
  if(data.heal)state.hero.hp=Math.min(config.heroHP,state.hero.hp+data.heal);
  if(slot.uses===0)state.scrolls.splice(index,1);
  state.scrollIndex=Math.min(index,Math.max(0,state.scrolls.length-1));
  return {...data,type:slot.type};
}
export function rewardScroll(state,type){if(type)state.scrolls.push({type,uses:config.scrollUses});}
