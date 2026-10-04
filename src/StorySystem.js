import {RPGConfig,nextLevelExp} from './RPGConfig.js';
import {QuestData} from './QuestData.js';
import {questStatus} from './QuestSystem.js';
import {EquipmentData,equipmentById} from './EquipmentData.js';

// Story is a view of existing achievements, never a second reward ledger.
export function storyFlags(p){return p.story??{openingSeen:true,guildVisited:!!(p.activeQuests.length+p.completedQuests.length+p.rewardedQuests.length+p.clearedDungeons.length)};}
export function mainStory(p){
 const cleared=id=>p.clearedDungeons.includes(id),forest=p.unlockedDungeons.includes('cursed-forest');
 const steps=[
  {id:'arrival',name:'낯선 세계',goal:'모험가 길드를 방문하여 이 세계의 이야기를 들어보세요.',done:storyFlags(p).guildVisited,action:'rpg-guild',art:'guild'},
  {id:'trial',name:'첫 번째 시험',goal:'오래된 지하감옥을 클리어하고 모험가로서 실력을 증명하세요.',done:cleared('old-prison'),action:'rpg-dungeon',art:'prison'},
  {id:'forest-road',name:'숲의 이상 현상',goal:'길드의 「숲으로 가는 길」을 완료 보고하여 저주받은 숲을 여세요.',done:forest,action:'rpg-guild',art:'forest'},
  {id:'guardian',name:'저주받은 숲의 수호자',goal:'저주받은 숲을 클리어하고 나무 수호자를 물리치세요.',done:cleared('cursed-forest'),action:'rpg-dungeon',art:'forest'},
  {id:'future',name:'???',goal:'새로운 지역과 마왕의 성은 다음 업데이트에서 이어집니다.',done:false,action:null,art:'town'}
 ];
 const current=steps.findIndex(s=>!s.done);
 return steps.map((s,i)=>({...s,status:s.done?'complete':i===current?'current':'locked'}));
}
export function forestChecklist(p){return [
 ['지하감옥 클리어',p.clearedDungeons.includes('old-prison')],
 ['「첫 번째 모험」 완료 보고',p.rewardedQuests.includes('first-adventure')],
 ['「숲으로 가는 길」 수락',[...p.activeQuests,...p.completedQuests,...p.rewardedQuests].includes('forest-road')],
 ['수락 후 지하감옥에서 두루마리 사용',(p.questProgress['forest-road']?.count??0)>=1],
 ['「숲으로 가는 길」 완료 보고',p.rewardedQuests.includes('forest-road')]
 ];}
export function guildBadge(p){if(p.completedQuests.length)return {mark:'✓',text:`${p.completedQuests.length}개 완료 보고 가능`};const available=QuestData.some(q=>questStatus(p,q.id)==='AVAILABLE'&&!q.prerequisites?.some(id=>!p.rewardedQuests.includes(id)));return available?{mark:'!',text:'새로운 의뢰가 있어요'}:{mark:'',text:'진행 중 의뢰 확인'};}
export function nextGoal(data){
 const p=data.progress,c=data.character,main=mainStory(p).find(s=>s.status==='current');
 if(p.run)return {title:p.run.pendingLoot?'전리품을 받아 모험을 이어가세요':'중단한 모험을 이어가세요',text:'현재 HP와 사용한 두루마리는 유지됩니다.',action:'rpg-dungeon',label:'모험 이어가기'};
 if(p.completedQuests.length)return {title:'완료한 의뢰를 보고하세요',text:`길드에서 ${p.completedQuests.length}개의 보상을 받을 수 있어요.`,action:'rpg-guild',label:'길드에서 보고하기'};
 if(!storyFlags(p).guildVisited)return {title:'먼저 모험가 길드를 방문하세요',text:'이 세계의 안내를 듣고 첫 번째 의뢰를 받아보세요.',action:'rpg-guild',label:'길드로 가기'};
 if(!Object.values(c.equipment).some(Boolean)&&c.inventory.items.length)return {title:'가방 속 장비를 장착하세요',text:'구매하거나 획득한 장비는 인벤토리에서 장착해야 능력치에 적용돼요.',action:'rpg-inventory',label:'장비 장착하기'};
 if(!Object.values(c.equipment).some(Boolean)&&EquipmentData.some(e=>e.buyPrice<=c.gold))return {title:'첫 장비로 더 강해지세요',text:`현재 ${c.gold}G로 장비를 살 수 있어요. 구매 후 인벤토리에서 장착하세요.`,action:'rpg-shop-weapon',label:'무기점 둘러보기'};
 if(p.activeQuests.length){const q=QuestData.find(q=>q.id===p.activeQuests[0]);return {title:q.name,text:`${q.description} · ${p.questProgress[q.id]?.count??0}/${q.target}`,action:'rpg-dungeon',label:'던전 준비하기'};}
 if(main.id==='future')return {title:'현재 공개된 두 지역을 돌파했어요!',text:'마왕의 성을 향한 이야기는 다음 업데이트에서 이어집니다. 남은 의뢰와 장비 수집에 도전하세요.',action:'rpg-guild',label:'남은 의뢰 확인'};
 if(!p.activeQuests.length&&main.id!=='guardian')return {title:'다음 모험의 의뢰를 받아보세요',text:main.goal,action:'rpg-guild',label:'길드로 가기'};
 if(p.unlockedDungeons.includes('cursed-forest')&&!p.activeMercenary)return {title:'저주받은 숲이 열렸어요 · 동료와 준비하세요',text:'독과 행동 방해에 대비해 장비와 두루마리를 준비하세요. 용병은 선택 사항이에요.',action:'rpg-mercenaries',label:'용병 길드 둘러보기'};
 return {title:main.name,text:main.goal,action:main.action,label:'다음 모험 준비하기'};
}
export function growthGoal(c){const required=nextLevelExp(c.level);return {max:c.level>=RPGConfig.maxLevel,remaining:Math.max(0,required-c.exp),next:c.level+1,growth:RPGConfig.growth};}
export function equipmentComparison(c,item){const current=equipmentById(c.equipment?.[item.type]);return {current,deltas:Object.fromEntries(['attack','maxHP','defense'].map(k=>[k,(item.statModifiers[k]??0)-(current?.statModifiers[k]??0)]))};}
export function effectText(item){const e=item.specialEffects;if(!e.effectType)return '조건 없이 기본 능력치에 적용';if(e.effectType==='SCROLL_POWER_BONUS')return `${e.trigger} 등급 공격 후 두루마리 피해·회복·방어막 +${e.value} · 운석은 주 대상에 적용`;return `${Array.isArray(e.trigger)?e.trigger.join('/') : e.trigger} 등급 ${e.effectType==='ATTACK_GRADE_BONUS'?'공격 성공 시 추가 피해':'방어 성공 시 방어막 추가'} +${e.value}`;}
