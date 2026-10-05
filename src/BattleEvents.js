// Adapter for committed events. Identity survives reload and encounter retries.
export function battleEvents(event,state,run){
 const prefix=`${run.id}:${state.encounterIndex}`,base={dungeonId:run.dungeonId,...(run.personalQuestId?{personalQuestId:run.personalQuestId,mercenaryId:run.companionId}:{})},events=[];
 const add=(suffix,type,extra={})=>events.push({...base,id:`${prefix}:${suffix}`,type,...extra});
 const action=event.action;if(event.kind==='attack')add(`${state.turn}:attack:${action.playerId}`,'ATTACK_SUCCESS',{grade:action.targetGrade});
 if(event.kind==='defense')add(`${state.turn}:defense:${action.playerId}`,'DEFENSE_SUCCESS',{grade:action.targetGrade});
 if(event.kind==='magic')add(`${state.turn}:scroll:${action.playerId}`,'SCROLL_USED',{scroll:event.type});
 if(event.kind==='block'&&event.special!=='none'&&!state.scrollStop)add(`${state.turn}:block:${event.enemyId}`,'SPECIAL_BLOCKED',{source:'defense'});
 if(['attack','magic','victory'].includes(event.kind))for(const enemy of state.enemies.filter(e=>e.hp===0))add(`kill:${enemy.id}`,'MONSTER_DEFEATED',{monster:enemy.type});
 if(event.bossBreak||event.action?.bossBreak)add(`${state.turn}:break:${action?.playerId??0}`,'BOSS_BREAK');
 return events;
}
