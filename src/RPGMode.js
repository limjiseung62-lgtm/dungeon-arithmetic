import {finishCastleOpening,castleRestPending,restCastle,finishCastleTruth,reachThrone} from './CastleStory.js';
import {finishDragonOpening,investigateCanyon,finishDragonSeal} from './DragonStory.js';
import {finishChaosOpening,investigateTower,finishChaosSeal} from './ChaosStory.js';
import {blankCampaign,campaign,finishActTwo,investigateFortress,knightDefeated,finishSeal} from './ActTwoSystem.js';
import {blankRelationships,rewardAffinityClear,awakenCompanion,situationalLine} from './AffinitySystem.js';
import {personalQuestById} from './AffinityData.js';
import {incomingCompanionDamage} from './MercenarySkillResolver.js';
import {blankCollection,collection,discover,registerPossessions,recordDefeat,rollBossUnique,collectionProgress,claimCollectionReward} from './CollectionSystem.js';
import {EncounterData} from './EncounterData.js';
import {effectBonus} from './EquipmentSystem.js';
import {checkpointBoss,restoreBoss} from './BossCheckpoint.js';
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
 set collectionNotice(value){this._collectionNotice=value;this._collectionNoticeAt=Date.now();}
 get collectionNotice(){return Date.now()-(this._collectionNoticeAt||0)<4500?this._collectionNotice||'':'';}
 get character(){return this.data?.character;}
 get run(){return this.data?.progress.run;}
 get openingSeen(){return !!this.data&&storyFlags(this.data.progress).openingSeen;}
 finishOpening(){this.data.progress.story={...storyFlags(this.data.progress),openingSeen:true};return this.save();}
 visitGuild(){this.data.progress.story={...storyFlags(this.data.progress),guildVisited:true};return this.save();}
 create(name){const character=createCharacter(name);this.data={saveVersion:RPGConfig.saveVersion,character,progress:{campaign:blankCampaign(),mercenaryRelations:blankRelationships(),collection:blankCollection(),story:{openingSeen:false,guildVisited:false},...blankQuests(),...blankMercenaries(),unlockedDungeons:['old-prison'],dungeonClearHistory:[],lootHistory:[],clearedDungeons:[],run:null,completedRuns:0,stats:blankStats()},meta:{createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}};registerPossessions(this.data);this.receipt=null;this.loadInfo={status:'ready',data:this.data,message:''};this.save();return character;}
 hire(id,options){const result=hireMercenary(this.data,id,options);if(result.ok)this.save();return result;}
 buy(id){if(this.run?.dungeonId==='demon-castle')return {ok:false,message:'성 안에서는 구매할 수 없어요.'};const result=buyItem(this.character,id);if(result.ok)this.save();return result;}
 equip(id){if(this.run?.dungeonId==='demon-castle'&&!castleRestPending(this.run))return {ok:false,message:'장비 교체는 봉인의 방에서 할 수 있어요.'};const result=equipItem(this.character,id);if(result.ok)this.save();return result;}
 unequip(slot){if(this.run?.dungeonId==='demon-castle'&&!castleRestPending(this.run))return {ok:false,message:'장비 교체는 봉인의 방에서 할 수 있어요.'};const result=unequipItem(this.character,slot);if(result.ok)this.save();return result;}
 sell(id){if(this.run?.dungeonId==='demon-castle')return {ok:false,message:'성 안에서는 판매할 수 없어요.'};const result=sellItem(this.character,id);if(result.ok)this.save();return result;}
 stats(){normalizeEquipment(this.character);return finalStats(this.character);}
 save(){if(!this.data)return false;const changes=registerPossessions(this.data);if(changes.length)this.collectionNotice='새로운 기록! 도감에 등록되었습니다';const v=collectionProgress(this.data.progress);this.dispatchEvent({id:'collection:'+v.counts.monsters+':'+v.counts.equipment+':'+v.counts.scrolls,type:'COLLECTION_UPDATED',counts:v.counts});this.data.meta.updatedAt=new Date().toISOString();this.saveInfo=this.saves.save(this.data);return this.saveInfo.ok;}
 finishCastleOpening(){const ok=finishCastleOpening(this.data.progress);this.save();return ok;}
 restCastle(){const ok=restCastle(this.data);this.save();return ok;}
 finishCastleTruth(){const ok=finishCastleTruth(this.data.progress);this.save();return ok;}
 reachThrone(){const ok=reachThrone(this.data.progress);this.save();return ok;}
 finishDragonOpening(){const ok=finishDragonOpening(this.data.progress);this.save();return ok;}
 investigateCanyon(){const ok=investigateCanyon(this.data.progress);this.save();return ok;}
 finishDragonSeal(){const ok=finishDragonSeal(this.data.progress);this.save();return ok;}
 finishChaosOpening(){const ok=finishChaosOpening(this.data.progress);this.save();return ok;}
 investigateTower(){const ok=investigateTower(this.data.progress);this.save();return ok;}
 finishChaosSeal(){const ok=finishChaosSeal(this.data.progress);this.save();return ok;}
 finishActTwo(){const ok=finishActTwo(this.data.progress);this.save();return ok;}
 investigateFortress(){const ok=investigateFortress(this.data.progress);this.save();return ok;}
 finishSeal(){const ok=finishSeal(this.data.progress);this.save();return ok;}
 investigateMine(){const p=this.data.progress;if(this.run||!p.clearedDungeons.includes('old-prison')||!p.clearedDungeons.includes('cursed-forest'))return {ok:false,message:'두 지역을 클리어하고 마을로 돌아와 주세요.'};if(p.unlockedDungeons.includes('burning-mine'))return {ok:false,message:'이미 광산이 열려 있어요.'};p.story={...storyFlags(p),mineInvestigated:true};unlockDungeon(p,'burning-mine');this.save();return {ok:true,message:'새로운 지역이 열렸습니다! 🌋 불타는 광산 · 붉은 마력의 흔적을 조사하세요.'};}
 get dungeon(){const personal=personalQuestById(this.run?.personalQuestId);if(personal)return {...dungeonById(personal.dungeon),encounters:[personal.encounter],clearReward:{exp:0,gold:0}};const d=dungeonById(this.run?.dungeonId||'old-prison');return this.run?.route==='deep'?{...d,encounters:[EncounterData[1],EncounterData[4],EncounterData[5]]}:d;}
 claimCollection(id){const result=claimCollectionReward(this.data,id);if(result.ok)this.save();return result;}
 acceptQuest(id){if(this.run)return {ok:false,message:'던전을 마친 뒤 의뢰를 수락해 주세요.'};const result=acceptQuest(this.data.progress,id);if(result.ok)this.save();return result;}
 reportQuest(id){
  if(this.run)return {ok:false,message:'마을 귀환 후 완료 보고해 주세요.'};
  const reward=reportQuest(this.data.progress,id);if(!reward)return {ok:false,message:'이미 보고했거나 아직 목표가 남아 있어요.'};
  const levelUp=addExperience(this.character,reward.exp||0);addGold(this.character,reward.gold||0);
  grantLoot(this.character,{scrolls:reward.scroll?[reward.scroll]:[],equipment:reward.equipment?[reward.equipment]:[]});
  if(reward.unlock)unlockDungeon(this.data.progress,reward.unlock);
  const awakening=reward.awaken?awakenCompanion(this.data.progress,reward.awaken,id):null;this.save();return {ok:true,reward,levelUp,awakening,message:`완료 보고! 경험치 +${reward.exp||0} · ${reward.gold||0}G${reward.scroll?' · '+ScrollData[reward.scroll].name+' 획득':''}${reward.equipment?' · '+equipmentById(reward.equipment).name+' 획득':''}${reward.unlock?' · 저주받은 숲 해금!':''}`};
 }
 dispatchEvent(event){const changes=progressQuests(this.data.progress,event);if(changes.length)this.questNotice='📜 퀘스트 진행 +1 · 길드에서 진행도를 확인하세요';return changes;}
 enterPersonalQuest(id){const q=personalQuestById(id),p=this.data.progress;if(!q||this.run||!p.activeQuests.includes(id)||p.activeMercenary!==q.mercenaryId||!canEnterDungeon(p,q.dungeon))return {ok:false,message:'의뢰 수락 후 해당 동료와 계약해 주세요. 중단한 모험은 먼저 마쳐 주세요.'};if(!this.enterDungeon(q.dungeon,undefined,id))return {ok:false,message:'지금은 출발할 수 없어요.'};return {ok:true};}
 enterDungeon(id='old-prison',route,personalId){const personal=personalQuestById(personalId);if(personalId&&(!personal||personal.dungeon!==id||route||this.data?.progress.activeMercenary!==personal.mercenaryId||!this.data.progress.activeQuests.includes(personalId)))return false;if(!this.character)throw new Error('먼저 용사를 만들어 주세요.');if(this.run||route&&!(route==='deep'&&id==='old-prison'&&this.data.progress.clearedDungeons.includes(id))||!canEnterDungeon(this.data.progress,id))return false;this.data.progress.run={id:runId(),dungeonId:id,...(route?{route}:{}),nextEncounter:0,status:'active',completed:[],clearBonusGranted:false,pendingLoot:null,stats:blankStats(),poison:0,...(personalId?{personalQuestId:personalId,companionId:this.data.progress.activeMercenary,personalIntroSeen:false}:{})};bindContract(this.data.progress,this.run);this.receipt=null;this.companionNotice='';this.companionNoticeAt=0;this.save();return true;}
 createBattle(){
  const run=this.run;if(!run)throw new Error('던전에 입장해 주세요.');const pending=run.pendingLoot,index=pending?.encounterIndex??run.nextEncounter;
  if(index>=this.dungeon.encounters.length)throw new Error('마을로 귀환해 주세요.');
  const state=createState(1,'sequential',createRPGContext(this.character,this.dungeon));state.hero.hp=this.character.hp;state.hero.poison=Math.min(3,run.poison||0);state.hero.burn=Math.min(2,run.burn||0);state.scrolls=structuredClone(this.character.scrolls);state.stats=structuredClone(run.stats||blankStats());state.turn=state.stats.turns;
  state.battleContext.incomingDamageModifier=(s,n)=>incomingCompanionDamage(this.data,run,s,n);const combat=new CombatSystem(state),mercenaries=new MercenarySystem(this.data,run);combat.supportHook=(event,s)=>mercenaries.support(event,s);combat.scrollModifier=(action,s)=>mercenaries.scrollModifier(action,s);combat.configureEncounter(index);state.chaosTutorial=run.dungeonId==='chaos-tower'&&!run.illusionTutorialSeen&&state.enemies.some(e=>['illusionist','chaosMage'].includes(e.type));if(state.chaosTutorial)run.illusionTutorialSeen=true;if(run.dungeonId==='burning-mine')state.heatPoints=run.heatPoints||0;if(run.dungeonId==='black-fortress'){state.morale=run.morale||0;state.moraleDefeated=[...(run.moraleDefeated||[])];state.darkBlessingTurn=run.darkBlessingTurn||0;}if(!restoreBoss(state,run.bossCheckpoint))combat.startTurn();else if(state.phase==='enemy')combat.startTurn();
  if(pending){state.stats=structuredClone(run.stats||blankStats());state.turn=state.stats.turns;state.enemies.forEach(e=>e.hp=0);syncEncounter(state);state.phase=run.status==='clear'?'clear':'reward';state.lootCandidates=[...pending.candidates];state.lootChosen=pending.chosen;state.lootAcquired=pending.type;this.receipt=pending.receipt;}
  for(const e of state.enemies)if(discover(this.data.progress,'monsters',e.type))this.collectionNotice='새로운 기록! 도감에 등록되었습니다';this.save();
  return {state,combat,pending:!!pending};
 }
 captureBattle(state){if(!this.character||state?.battleContext?.mode!=='rpg'||!this.run)return false;this.character.hp=Math.max(0,Math.min(this.character.maxHP,state.hero.hp));this.character.scrolls=structuredClone(state.scrolls);if(this.character.hp===0&&this.run.status==='active')this.run.status='defeat';this.run.poison=state.hero.poison;if(['burning-mine','demon-castle'].includes(this.run.dungeonId)){this.run.burn=state.hero.burn||0;this.run.heatPoints=state.heatPoints||0;}if(this.run.dungeonId==='black-fortress'){this.run.morale=state.morale||0;this.run.moraleDefeated=[...(state.moraleDefeated||[])];this.run.darkBlessingTurn=state.darkBlessingTurn||0;}this.run.stats=structuredClone(state.stats);this.run.bossCheckpoint=checkpointBoss(state);return true;}
 awardBattle(state){
  if(!['reward','clear'].includes(state?.phase)||state.enemies?.some(e=>e.hp>0)||!this.captureBattle(state))return false;const run=this.run,index=state.encounterIndex;if(run.completed.includes(index))return false;
  const reward=state.enemies.reduce((sum,e)=>{const r=RPGRewardData[e.type]||{exp:0,gold:0};return {exp:sum.exp+r.exp,gold:sum.gold+r.gold};},{exp:0,gold:0});
  const hpRatio=state.hero.hp/state.battleContext.heroMaxHP;const drops=rollLoot(state.enemies,reward.gold,this.lootRng);const uniqueItems=[];for(const e of state.enemies){recordDefeat(this.data.progress,e.type,run.id+':'+index+':kill:'+e.id);const item=run.personalQuestId?null:rollBossUnique(this.data.progress,e.type,this.lootRng);if(item){drops.equipment.push(item);uniqueItems.push(item);}}grantLoot(this.character,drops);state.scrolls=structuredClone(this.character.scrolls);
  const final=index===this.dungeon.encounters.length-1,bonus=final&&!run.clearBonusGranted?this.dungeon.clearReward:{exp:0,gold:0};const levelUp=addExperience(this.character,reward.exp+bonus.exp);addGold(this.character,reward.gold+bonus.gold);
  const victoryHeal=Math.min(this.character.maxHP-this.character.hp,effectBonus(this.character,'VICTORY_HEAL','VICTORY'));this.character.hp+=victoryHeal;
  run.completed.push(index);run.nextEncounter=index+1;if(final){run.status='clear';run.clearBonusGranted=true;if(!run.personalQuestId&&!this.data.progress.clearedDungeons.includes(run.dungeonId))this.data.progress.clearedDungeons.push(run.dungeonId);}
  this.data.progress.lootHistory.push({id:`${run.id}:${index}`,dungeonId:run.dungeonId,loot:drops});
  if(final&&!run.personalQuestId){const clear={id:`${run.id}:clear`,dungeonId:run.dungeonId,hpRatio,defeated:false,mercenaryId:this.data.progress.activeMercenary};this.data.progress.dungeonClearHistory.push(clear);this.dispatchEvent({...clear,type:'DUNGEON_CLEARED'});}
  if(final&&!run.personalQuestId&&run.dungeonId==='demon-castle')campaign(this.data.progress).throneReached=true;
  if(final&&!run.personalQuestId&&run.dungeonId==='sky-canyon')campaign(this.data.progress).dragonDefeated=true;
  if(final&&!run.personalQuestId&&run.dungeonId==='chaos-tower')campaign(this.data.progress).mageDefeated=true;
  if(final&&!run.personalQuestId&&run.dungeonId==='black-fortress')knightDefeated(this.data.progress);
  const affinity=final?rewardAffinityClear(this.data,run,state):null;
  if(final&&run.personalQuestId)this.dispatchEvent({id:run.id+':personal-win',type:'PERSONAL_VICTORY',personalQuestId:run.personalQuestId,mercenaryId:run.companionId,dungeonId:run.dungeonId,hpRatio});
  this.receipt={affinity,personalQuestId:run.personalQuestId||null,reward,bonus,levelUp,final,drops,uniqueItems,victoryHeal,enemyNames:state.enemies.map(e=>e.name)};run.pendingLoot={encounterIndex:index,candidates:[...state.lootCandidates],chosen:!!state.lootChosen,type:state.lootAcquired||null,receipt:this.receipt};this.applyCharacter(state);this.save();return this.receipt;
 }
 applyCharacter(state){state.battleContext=createRPGContext(this.character,this.dungeon);state.hero.hp=this.character.hp;state.battleContext.incomingDamageModifier=(s,n)=>incomingCompanionDamage(this.data,this.run,s,n);}
 recordLoot(state,type){const pending=this.run?.pendingLoot;if(!pending||pending.chosen)return false;if(!pending.candidates.includes(type))return false;this.captureBattle(state);pending.chosen=true;pending.type=type;this.save();return true;}
 advanceBattle(state,combat){if(!this.run?.pendingLoot?.chosen||this.run.status!=='active')return false;if(castleRestPending(this.run)){if(!this.run.restUsed||!campaign(this.data.progress).eliaTruthSeen)return false;this.run.restDeparted=true;}if(this.run.dungeonId==='sky-canyon'){this.run.pursuitSeen??=[];if(!this.run.pursuitSeen.includes(state.encounterIndex))this.run.pursuitSeen.push(state.encounterIndex);}this.captureBattle(state);this.run.pendingLoot=null;this.receipt=null;this.applyCharacter(state);combat.nextMonster();state.chaosTutorial=this.run.dungeonId==='chaos-tower'&&!this.run.illusionTutorialSeen&&state.enemies.some(e=>['illusionist','chaosMage'].includes(e.type));if(state.chaosTutorial)this.run.illusionTutorialSeen=true;for(const e of state.enemies)if(discover(this.data.progress,'monsters',e.type))this.collectionNotice='새로운 기록! 도감에 등록되었습니다';this.captureBattle(state);this.save();return true;}
 onBattleEvent(event,state){if(!event||state?.battleContext?.mode!=='rpg'||!this.run)return;for(const e of state.enemies)if(discover(this.data.progress,'monsters',e.type))this.collectionNotice='새로운 기록! 도감에 등록되었습니다';const line=situationalLine(this.data.progress,this.run,event,state);if(line){this.companionNotice=line.text;this.companionNoticeAt=Date.now();if(event.support)event.support.dialogue=line.text;}if(this.run.dungeonId==='chaos-tower'&&event.kind==='magic'&&event.action?.targetGrade==='S'&&this.data.progress.activeMercenary==='luna'){this.companionNotice='이 마력은 나도 알아. 계산으로 금지된 마력의 흐름을 바꾸자!';this.companionNoticeAt=Date.now();if(event.support)event.support.dialogue=this.companionNotice;}for(const mapped of battleEvents(event,state,this.run)){if(mapped.type==='MONSTER_DEFEATED')recordDefeat(this.data.progress,mapped.monster,mapped.id);this.dispatchEvent(mapped);}if(event.support&&!event.support.cosmetic)this.dispatchEvent({...event.support,type:'MERCENARY_SUPPORT',dungeonId:this.run.dungeonId});if(event.kind==='victory')this.awardBattle(state);else if(event.kind==='gameover'){this.captureBattle(state);this.run.status='defeat';this.save();}else if(['chaos-tower','sky-canyon','demon-castle'].includes(state.battleContext?.dungeonId)||state.enemies?.some(e=>e.boss)||['attack','defense','block','magic','burn','heatSpark','magmaArmor','turn-end'].includes(event.kind)){this.captureBattle(state);this.save();}}
 returnToTown(){
  if(!this.run)return false;const result=this.run.status;if(!['clear','defeat'].includes(result))return false;
  if(result==='clear'&&!this.run.pendingLoot?.chosen)return false;
  if(result==='clear'&&RPGConfig.restoreOnClear||result==='defeat'&&RPGConfig.restoreOnDefeat)this.character.hp=this.character.maxHP;
  const totals=this.data.progress.stats||blankStats(),current=this.run.stats||blankStats();for(const key of ['turns','blocks','scrolls'])totals[key]=(totals[key]||0)+(current[key]||0);for(const side of ['attack','defense'])for(const grade of ['S','A','B','C'])totals[side][grade]=(totals[side][grade]||0)+(current[side][grade]||0);
  this.data.progress.stats=totals;if(result==='clear'&&!this.run.personalQuestId)this.data.progress.completedRuns=(this.data.progress.completedRuns||0)+1;endContract(this.data.progress,this.run);this.data.progress.run=null;this.receipt=null;this.save();return result;
 }
}
