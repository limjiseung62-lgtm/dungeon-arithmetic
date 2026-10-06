import {finalStats} from './EquipmentSystem.js';
import {campaign} from './ActTwoSystem.js';
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
  {id:'mine-trace',name:'붉은 마력의 흔적',goal:'숲 아래의 붉은 마력을 따라 북쪽 불타는 광산을 조사하세요. 길드에서 단서를 확인하면 광산이 열립니다.',done:p.story?.mineInvestigated===true,action:'rpg-guild',art:'mine'},
  {id:'mine-giant',name:'꺼지지 않는 불길',goal:'불타는 광산의 화염 거인을 물리치고 마왕군의 단서를 찾으세요.',done:cleared('burning-mine'),action:'rpg-dungeon',art:'mine'},
  {id:'war-declared',name:'마왕군의 선전포고',goal:'광산을 돌파하고 마을에서 마왕군의 움직임을 확인하세요.',done:campaign(p).openingSeen,action:'rpg-town',art:'fortress'},
  {id:'fortress-road',name:'검은 성채',goal:'길드에서 마왕군의 전초기지를 조사하고 성채로 향하세요.',done:campaign(p).fortressInvestigated,action:'rpg-guild',art:'fortress'},
  {id:'dark-seal',name:'첫 번째 봉인',goal:'검은 성채의 어둠의 기사를 쓰러뜨리고 봉인을 파괴하세요.',done:campaign(p).seals.darkness,action:'rpg-dungeon',art:'fortress'},
  {id:'twisted-space',name:'뒤틀린 공간',goal:'마을 사람들의 기억을 뒤튼 혼돈의 마력의 근원을 길드에서 조사하세요.',done:campaign(p).towerInvestigated,action:'rpg-guild',art:'tower'},
  {id:'chaos-seal',name:'두 번째 봉인',goal:'혼돈의 마탑에서 마법진의 문양을 관찰하고 혼돈의 마법사를 쓰러뜨리세요.',done:campaign(p).seals.chaos,action:'rpg-dungeon',art:'tower'},
  {id:'last-seal',name:'마지막 봉인',goal:'길드에서 용의 수호자가 향한 천공의 용암 협곡을 조사하세요.',done:campaign(p).canyonInvestigated,action:'rpg-guild',art:'canyon'},
 {id:'dragon-seal',name:'용의 수호자',goal:'협곡에서 용을 추격하고 날개 BREAK와 브레스 예고를 판단하여 마지막 봉인을 파괴하세요.',done:campaign(p).seals.dragon,action:'rpg-dungeon',art:'dragonNest'},
 {id:'castle-road',name:'제3막 · 마왕의 성',goal:'마을에서 길드 마스터의 마지막 당부를 듣고 마왕의 성으로 출발하세요.',done:campaign(p).actThreeSeen,action:'rpg-town',art:'castleGate'},
 {id:'elia-truth',name:'말하지 못한 진실',goal:'마력 용광로를 돌파하고 봉인의 방에서 엘리아의 기억을 확인하세요.',done:campaign(p).eliaTruthSeen,action:'rpg-dungeon',art:'sealChamber'},
 {id:'throne-road',name:'왕좌로 향하라',goal:'용의 전당과 최종 정예전을 넘어 왕좌의 문에 도달하세요.',done:campaign(p).throneReached,action:'rpg-dungeon',art:'throneDoor'},
 {id:'future',name:'마왕과 마지막 질문',goal:'마왕의 네 시험과 마지막 수식을 넘어 소환의 진실을 듣고 현실로 돌아가세요.',done:p.storyCompleted===true,action:campaign(p).throneReached?'rpg-final-intro':null,art:'kingAwakens'}
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
 if(p.storyCompleted&&!p.run)return {title:'모험 완료!',text:'기존 던전·도감·장비·용병·퀘스트를 계속 탐험하거나 엔딩을 다시 볼 수 있어요.',action:'rpg-final-record',label:'나의 모험 기록'};
 if(p.run)return {title:p.run.pendingLoot?'전리품을 받아 모험을 이어가세요':'중단한 모험을 이어가세요',text:'현재 HP와 사용한 두루마리는 유지됩니다.',action:'rpg-dungeon',label:'모험 이어가기'};
 if(p.completedQuests.length)return {title:'완료한 의뢰를 보고하세요',text:`길드에서 ${p.completedQuests.length}개의 보상을 받을 수 있어요.`,action:'rpg-guild',label:'길드에서 보고하기'};
 if(!storyFlags(p).guildVisited)return {title:'먼저 모험가 길드를 방문하세요',text:'이 세계의 안내를 듣고 첫 번째 의뢰를 받아보세요.',action:'rpg-guild',label:'길드로 가기'};
 if(!Object.values(c.equipment).some(Boolean)&&c.inventory.items.length)return {title:'가방 속 장비를 장착하세요',text:'구매하거나 획득한 장비는 인벤토리에서 장착해야 능력치에 적용돼요.',action:'rpg-inventory',label:'장비 장착하기'};
 if(!Object.values(c.equipment).some(Boolean)&&EquipmentData.some(e=>!e.bossOnly&&e.buyPrice<=c.gold))return {title:'첫 장비로 더 강해지세요',text:`현재 ${c.gold}G로 장비를 살 수 있어요. 구매 후 인벤토리에서 장착하세요.`,action:'rpg-shop-weapon',label:'무기점 둘러보기'};
 if(['castle-road','elia-truth','throne-road'].includes(main.id))return {title:main.name,text:main.goal,action:main.action,label:'제3막 목표 확인'};
 if(['war-declared','fortress-road','dark-seal','twisted-space','chaos-seal','last-seal','dragon-seal'].includes(main.id))return {title:main.name,text:main.goal,action:main.action,label:'제2막 목표 확인'};
 if(main.id==='mine-giant')return {title:'불타는 광산을 조사하세요',text:'열기는 전투마다 초기화돼요. 장비·동료·치유와 정화 두루마리를 준비하고 공격과 방어를 판단하세요.',action:'rpg-dungeon',label:'광산 준비하기'};
 if(main.id==='mine-trace')return {title:'숲 아래에서 붉은 마력이 발견됐어요',text:'길드 마스터가 북쪽 광산의 단서를 기다립니다. 「붉은 마력의 흔적」을 확인하세요.',action:'rpg-guild',label:'광산 단서 확인'};
 if(p.activeQuests.length){const q=QuestData.find(q=>q.id===p.activeQuests[0]);return {title:q.name,text:`${q.description} · ${p.questProgress[q.id]?.count??0}/${q.target}`,action:'rpg-dungeon',label:'던전 준비하기'};}
 if(main.id==='future')return {title:'왕좌 도달 · 마지막 질문',text:main.goal,action:'rpg-final-intro',label:'마왕의 마지막 시험'};
 if(!p.activeQuests.length&&main.id!=='guardian')return {title:'다음 모험의 의뢰를 받아보세요',text:main.goal,action:'rpg-guild',label:'길드로 가기'};
 if(p.unlockedDungeons.includes('cursed-forest')&&!p.activeMercenary)return {title:'저주받은 숲이 열렸어요 · 동료와 준비하세요',text:'독과 행동 방해에 대비해 장비와 두루마리를 준비하세요. 용병은 선택 사항이에요.',action:'rpg-mercenaries',label:'용병 길드 둘러보기'};
 return {title:main.name,text:main.goal,action:main.action,label:'다음 모험 준비하기'};
}
export function growthGoal(c){const required=nextLevelExp(c.level);return {max:c.level>=RPGConfig.maxLevel,remaining:Math.max(0,required-c.exp),next:c.level+1,growth:RPGConfig.growth};}
export function equipmentComparison(c,item){const current=equipmentById(c.equipment?.[item.type]);const before=finalStats(c),copy=structuredClone(c);copy.equipment[item.type]=item.id;const after=finalStats(copy);return {current,before,after,deltas:Object.fromEntries(['attack','maxHP','defense'].map(k=>[k,(item.statModifiers[k]??0)-(current?.statModifiers[k]??0)]))};}
export function effectText(item){const e=item.specialEffects;if(Array.isArray(e))return e.map(value=>effectText({...item,specialEffects:value})).join(' · ');if(e.effectType==='CHAOS_REVEAL')return '목표 숫자 일시 가림 지속 −2초 · 주사위와 정답 판정 유지';if(e.effectType==='BOSS_BREAK_BONUS')return '보스 BREAK 중 공격 A/S 피해 +'+e.value;if(e.effectType==='VICTORY_HEAL')return '전투 승리 후 HP +'+e.value+' · 최대 HP까지';if(!e.effectType)return '조건 없이 기본 능력치에 적용';if(e.effectType==='SCROLL_POWER_BONUS')return `${e.trigger} 등급 공격 후 두루마리 피해·회복·방어막 +${e.value} · 운석은 주 대상에 적용`;return `${Array.isArray(e.trigger)?e.trigger.join('/') : e.trigger} 등급 ${e.effectType==='ATTACK_GRADE_BONUS'?'공격 성공 시 추가 피해':'방어 성공 시 방어막 추가'} +${e.value}`;}
