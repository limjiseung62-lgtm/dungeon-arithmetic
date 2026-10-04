import {createState} from './GameState.js';
import {storyFlags} from './StorySystem.js';
import {CombatSystem} from './CombatSystem.js';
import {createCharacter,addExperience,addGold} from './CharacterSystem.js';
import {RPGConfig,RPGRewardData,createRPGContext} from './RPGConfig.js';
import {SaveSystem} from './SaveSystem.js';
import {syncEncounter} from './EncounterData.js';
import {normalizeEquipment,finalStats,equipItem,unequipItem,sellItem} from './EquipmentSystem.js';
import {buyItem} from './ShopSystem.js';
import {blankQuests,acceptQuest,progressQuests,reportQuest} from './QuestSystem.js';
import {dungeonById} from './DungeonData.js';
import {canEnterDungeon,unlockDungeon} from './DungeonSystem.js';
import {rollLoot,grantLoot} from './LootSystem.js';
import {battleEvents} from './BattleEvents.js';
import {equipmentById} from './EquipmentData.js';
import {ScrollData} from './ScrollData.js';
import {blankMercenaries,hireMercenary,bindContract,endContract,MercenarySystem} from './MercenarySystem.js';
const blankStats=()=>({turns:0,attack:{S:0,A:0,B:0,C:0},defense:{S:0,A:0,B:0,C:0},blocks:0,scrolls:0});
const runId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export class RPGMode{
 constructor(storage=null,rng=Math.random){this.saves=new SaveSystem(storage);this.lootRng=rng;this.questNotice='';this.data=null;this.loadInfo={status:'empty',message:''};this.saveInfo={ok:true,message:''};this.receipt=null;}
 load(){if(this.data&&!this.saveInfo.ok){this.loadInfo={status:'ready',data:this.data,message:'저장되지 않은 현재 창의 모험을 이어갑니다.'};return this.loadInfo;}this.loadInfo=this.saves.load();this.data=this.loadInfo.data;this.receipt=this.data?.progress.run?.pendingLoot?.receipt||null;return this.loadInfo;}
 get character(){return this.data?.character;}
 get run(){return this.data?.progress.run;}
 get openingSeen(){return !!this.data&&storyFlags(this.data.progress).openingSeen;}
 finishOpening(){this.data.progress.story={...storyFlags(this.data.progress),openingSeen:true};return this.save();}
 visitGuild(){this.data.progress.story={...storyFlags(this.data.progress),guildVisited:true};return this.save();}
 create(name){const character=createCharacter(name);this.data={saveVersion:RPGConfig.saveVersion,character,progress:{story:{openingSeen:false,guildVisited:false},...blankQuests(),...blankMercenaries(),unlockedDungeons:['old-prison'],dungeonClearHistory:[],lootHistory:[],clearedDungeons:[],run:null,completedRuns:0,stats:blankStats()},meta:{createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}};this.receipt=null;this.loadInfo={status:'ready',data:this.data,message:''};this.save();return character;}
 hire(id,options){const result=hireMercenary(this.data,id,options);if(result.ok)this.save();return result;}
 buy(id){const result=buyItem(this.character,id);if(result.ok)this.save();return result;}
 equip(id){const result=equipItem(this.character,id);if(result.ok)this.save();return result;}
 unequip(slot){const result=unequipItem(this.character,slot);if(result.ok)this.save();return result;}
 sell(id){const result=sellItem(this.character,id);if(result.ok)this.save();return result;}
 stats(){normalizeEquipment(this.character);return finalStats(this.character);}
 save(){if(!this.data)return false;this.data.meta.updatedAt=new Date().toISOString();this.saveInfo=this.saves.save(this.data);return this.saveInfo.ok;}
 investigateMine(){const p=this.data.progress;if(this.run||!p.clearedDungeons.includes('old-prison')||!p.clearedDungeons.includes('cursed-forest'))return {ok:false,message:'두 지역을 클리어하고 마을로 돌아와 주세요.'};if(p.unlockedDungeons.includes('burning-mine'))return {ok:false,message:'이미 광산이 열려 있어요.'};p.story={...storyFlags(p),mineInvestigated:true};unlockDungeon(p,'burning-mine');this.save();return {ok:true,message:'새로운 지역이 열렸습니다! 🌋 불타는 광산 · 붉은 마력의 흔적을 조사하세요.'};}
 get dungeon(){return dungeonById(this.run?.dungeonId||'old-prison');}
 acceptQuest(id){if(this.run)return {ok:false,message:'던전을 마친 뒤 의뢰를 수락해 주세요.'};const result=acceptQuest(this.data.progress,id);if(result.ok)this.save();return result;}
 reportQuest(id){
  if(this.run)return {ok:false,message:'마을 귀환 후 완료 보고해 주세요.'};
  const reward=reportQuest(this.data.progress,id);if(!reward)return {ok:false,message:'이미 보고했거나 아직 목표가 남아 있어요.'};
  const levelUp=addExperience(this.character,reward.exp||0);addGold(this.character,reward.gold||0);
  grantLoot(this.character,{scrolls:reward.scroll?[reward.scroll]:[],equipment:reward.equipment?[reward.equipment]:[]});
  if(reward.unlock)unlockDungeon(this.data.progress,reward.unlock);
  this.save();return {ok:true,reward,levelUp,message:`완료 보고! 경험치 +${reward.exp||0} · ${reward.gold||0}G${reward.scroll?' · '+ScrollData[reward.scroll].name+' 획득':''}${reward.equipment?' · '+equipmentById(reward.equipment).name+' 획득':''}${reward.unlock?' · 저주받은 숲 해금!':''}`};
 }
 dispatchEvent(event){const changes=progressQuests(this.data.progress,event);if(changes.length)this.questNotice='📜 퀘스트 진행 +1 · 길드에서 진행도를 확인하세요';return changes;}
 enterDungeon(id='old-prison'){if(!this.character)throw new Error('먼저 용사를 만들어 주세요.');if(this.run||!canEnterDungeon(this.data.progress,id))return false;this.data.progress.run={id:runId(),dungeonId:id,nextEncounter:0,status:'active',completed:[],clearBonusGranted:false,pendingLoot:null,stats:blankStats(),poison:0};bindContract(this.data.progress,this.run);this.receipt=null;this.save();return true;}
 createBattle(){
  const run=this.run;if(!run)throw new Error('던전에 입장해 주세요.');const pending=run.pendingLoot,index=pending?.encounterIndex??run.nextEncounter;
  if(index>=this.dungeon.encounters.length)throw new Error('마을로 귀환해 주세요.');
  const state=createState(1,'sequential',createRPGContext(this.character,this.dungeon));state.hero.hp=this.character.hp;state.hero.poison=Math.min(3,run.poison||0);state.hero.burn=Math.min(2,run.burn||0);state.scrolls=structuredClone(this.character.scrolls);state.stats=structuredClone(run.stats||blankStats());state.turn=state.stats.turns;
  const combat=new CombatSystem(state),mercenaries=new MercenarySystem(this.data,run);combat.supportHook=(event,s)=>mercenaries.support(event,s);combat.scrollModifier=(action,s)=>mercenaries.scrollModifier(action,s);combat.configureEncounter(index);if(run.dungeonId==='burning-mine')state.heatPoints=run.heatPoints||0;combat.startTurn();
  if(pending){state.stats=structuredClone(run.stats||blankStats());state.turn=state.stats.turns;state.enemies.forEach(e=>e.hp=0);syncEncounter(state);state.phase=run.status==='clear'?'clear':'reward';state.lootCandidates=[...pending.candidates];state.lootChosen=pending.chosen;state.lootAcquired=pending.type;this.receipt=pending.receipt;}
  return {state,combat,pending:!!pending};
 }
 captureBattle(state){if(!this.character||state?.battleContext?.mode!=='rpg'||!this.run)return false;this.character.hp=Math.max(0,Math.min(this.character.maxHP,state.hero.hp));this.character.scrolls=structuredClone(state.scrolls);if(this.character.hp===0&&this.run.status==='active')this.run.status='defeat';this.run.poison=state.hero.poison;if(this.run.dungeonId==='burning-mine'){this.run.burn=state.hero.burn||0;this.run.heatPoints=state.heatPoints||0;}this.run.stats=structuredClone(state.stats);return true;}
 awardBattle(state){
  if(!['reward','clear'].includes(state?.phase)||state.enemies?.some(e=>e.hp>0)||!this.captureBattle(state))return false;const run=this.run,index=state.encounterIndex;if(run.completed.includes(index))return false;
  const reward=state.enemies.reduce((sum,e)=>{const r=RPGRewardData[e.type]||{exp:0,gold:0};return {exp:sum.exp+r.exp,gold:sum.gold+r.gold};},{exp:0,gold:0});
  const hpRatio=state.hero.hp/state.battleContext.heroMaxHP;const drops=rollLoot(state.enemies,reward.gold,this.lootRng);grantLoot(this.character,drops);state.scrolls=structuredClone(this.character.scrolls);
  const final=index===this.dungeon.encounters.length-1,bonus=final&&!run.clearBonusGranted?this.dungeon.clearReward:{exp:0,gold:0};const levelUp=addExperience(this.character,reward.exp+bonus.exp);addGold(this.character,reward.gold+bonus.gold);
  run.completed.push(index);run.nextEncounter=index+1;if(final){run.status='clear';run.clearBonusGranted=true;if(!this.data.progress.clearedDungeons.includes(run.dungeonId))this.data.progress.clearedDungeons.push(run.dungeonId);}
  this.data.progress.lootHistory.push({id:`${run.id}:${index}`,dungeonId:run.dungeonId,loot:drops});
  if(final){const clear={id:`${run.id}:clear`,dungeonId:run.dungeonId,hpRatio,defeated:false,mercenaryId:this.data.progress.activeMercenary};this.data.progress.dungeonClearHistory.push(clear);this.dispatchEvent({...clear,type:'DUNGEON_CLEARED'});}
  this.receipt={reward,bonus,levelUp,final,drops,enemyNames:state.enemies.map(e=>e.name)};run.pendingLoot={encounterIndex:index,candidates:[...state.lootCandidates],chosen:!!state.lootChosen,type:state.lootAcquired||null,receipt:this.receipt};this.applyCharacter(state);this.save();return this.receipt;
 }
 applyCharacter(state){state.battleContext=createRPGContext(this.character,this.dungeon);state.hero.hp=this.character.hp;}
 recordLoot(state,type){const pending=this.run?.pendingLoot;if(!pending||pending.chosen)return false;if(!pending.candidates.includes(type))return false;this.captureBattle(state);pending.chosen=true;pending.type=type;this.save();return true;}
 advanceBattle(state,combat){if(!this.run?.pendingLoot?.chosen||this.run.status!=='active')return false;this.captureBattle(state);this.run.pendingLoot=null;this.receipt=null;this.applyCharacter(state);combat.nextMonster();this.captureBattle(state);this.save();return true;}
 onBattleEvent(event,state){if(!event||state?.battleContext?.mode!=='rpg'||!this.run)return;for(const mapped of battleEvents(event,state,this.run))this.dispatchEvent(mapped);if(event.support)this.dispatchEvent({...event.support,type:'MERCENARY_SUPPORT',dungeonId:this.run.dungeonId});if(event.kind==='victory')this.awardBattle(state);else if(event.kind==='gameover'){this.captureBattle(state);this.run.status='defeat';this.save();}else if(['attack','defense','block','magic','burn','heatSpark','magmaArmor','turn-end'].includes(event.kind)){this.captureBattle(state);this.save();}}
 returnToTown(){
  if(!this.run)return false;const result=this.run.status;if(!['clear','defeat'].includes(result))return false;
  if(result==='clear'&&!this.run.pendingLoot?.chosen)return false;
  if(result==='clear'&&RPGConfig.restoreOnClear||result==='defeat'&&RPGConfig.restoreOnDefeat)this.character.hp=this.character.maxHP;
  const totals=this.data.progress.stats||blankStats(),current=this.run.stats||blankStats();for(const key of ['turns','blocks','scrolls'])totals[key]=(totals[key]||0)+(current[key]||0);for(const side of ['attack','defense'])for(const grade of ['S','A','B','C'])totals[side][grade]=(totals[side][grade]||0)+(current[side][grade]||0);
  this.data.progress.stats=totals;if(result==='clear')this.data.progress.completedRuns=(this.data.progress.completedRuns||0)+1;endContract(this.data.progress,this.run);this.data.progress.run=null;this.receipt=null;this.save();return result;
 }
}
