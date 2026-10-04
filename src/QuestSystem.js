import {QuestData,QuestConfig,questById} from './QuestData.js';
export const blankQuests=()=>({activeQuests:[],completedQuests:[],rewardedQuests:[],questProgress:{},questEventIds:[]});
export const questStatus=(p,id)=>p.rewardedQuests.includes(id)?'REWARDED':p.completedQuests.includes(id)?'COMPLETED':p.activeQuests.includes(id)?'ACTIVE':'AVAILABLE';
export function acceptQuest(p,id){
 const q=questById(id);if(!q||questStatus(p,id)!=='AVAILABLE')return {ok:false,message:'이미 수락한 의뢰예요.'};
 if(q.prerequisites?.some(id=>!p.rewardedQuests.includes(id)))return {ok:false,message:'먼저 첫 번째 모험을 완료 보고해 주세요.'};
 if(p.activeQuests.length>=QuestConfig.maxActive)return {ok:false,message:`의뢰는 동시에 ${QuestConfig.maxActive}개까지 수락할 수 있어요.`};
 p.activeQuests.push(id);p.questProgress[id]={count:0,scrolls:[]};return {ok:true,message:`${q.name} 의뢰를 수락했어요.`};
}
function matches(q,e){
 const f=q.filter||{};if(q.dungeon!=='any'&&e.dungeonId!==q.dungeon)return false;
 switch(q.type){
 case 'KILL_MONSTER':return e.type==='MONSTER_DEFEATED'&&(!f.monster||f.monster===e.monster);
 case 'ATTACK_GRADE_SUCCESS':return e.type==='ATTACK_SUCCESS'&&(!f.grades||f.grades.includes(e.grade));
 case 'DEFENSE_GRADE_SUCCESS':return e.type==='DEFENSE_SUCCESS'&&(!f.grades||f.grades.includes(e.grade));
 case 'BLOCK_SPECIAL':return e.type==='SPECIAL_BLOCKED'&&e.source==='defense';
 case 'USE_SCROLL':case 'USE_DIFFERENT_SCROLLS':return e.type==='SCROLL_USED';
 case 'CLEAR_DUNGEON':return e.type==='DUNGEON_CLEARED';
 case 'CLEAR_WITH_HP':return e.type==='DUNGEON_CLEARED'&&e.hpRatio>=f.hpRatio;
 case 'CLEAR_WITHOUT_DEFEAT':return e.type==='DUNGEON_CLEARED'&&!e.defeated;
 default:return false;
 }
}
export function progressQuests(p,e,catalog=QuestData){
 if(!e.id||p.questEventIds.includes(e.id))return [];
 p.questEventIds.push(e.id);const changes=[];
 for(const id of [...p.activeQuests]){const q=catalog.find(q=>q.id===id);if(!q||!matches(q,e))continue;const progress=p.questProgress[id],before=progress.count;
  if(q.type==='USE_DIFFERENT_SCROLLS'){if(!progress.scrolls.includes(e.scroll))progress.scrolls.push(e.scroll);progress.count=Math.min(q.target,progress.scrolls.length);}
  else progress.count=Math.min(q.target,progress.count+1);
  if(progress.count===before)continue;changes.push(id);
  if(progress.count>=q.target){p.activeQuests=p.activeQuests.filter(x=>x!==id);p.completedQuests.push(id);}
 }
 return changes;
}
export function reportQuest(p,id){
 const q=questById(id);if(!q||questStatus(p,id)!=='COMPLETED')return null;
 p.completedQuests=p.completedQuests.filter(x=>x!==id);p.rewardedQuests.push(id);return {...q.reward};
}
