import {GameConfig as config} from './GameConfig.js';
import {MonsterData} from './MonsterData.js';
import {ScrollData} from './ScrollData.js';
export function reserveAction(state,target,expression,playerId){
  const base={playerId,targetGrade:target.grade,targetValue:target.value,targetId:target.id,expression:expression.expression};
  const add=(actionType,properties={})=>state.actionQueue.push({...base,actionType,...properties,order:state.actionQueue.length,status:'pending'});
  if(target.side==='attack'){
    add('attack',{baseDamage:Math.max(1,config.attack[target.grade]-MonsterData[state.monsterIndex].armor)});
    if(target.grade==='S'){
      const slot=state.scrolls[state.scrollIndex];
      if(slot){const reservations=state.actionQueue.filter(a=>a.actionType==='scroll'&&a.scrollSlot===slot).length;
        if(slot.uses>reservations)add('scroll',{scrollSlot:slot,scrollEffect:slot.type,...ScrollData[slot.type]});}
    }
  }else{
    add('defense',{shieldGain:config.defense[target.grade]});
    if(target.grade==='S'){state.blockReserved=true;add('block',{specialBlock:true});}
  }
}
export function actionLabel(action){
  if(action.actionType==='attack')return `⚔ 검 공격 +${action.baseDamage}`;
  if(action.actionType==='defense')return `🛡 ${action.targetGrade==='S'?'강력한 ':''}방어막 +${action.shieldGain}`;
  if(action.actionType==='block')return '✨ 특수 공격 방어';
  return action.skipped?'📜 이번에는 아껴두기':`${action.icon} ${action.name} · 사용할 때 선택`;
}
