import {createState} from './GameState.js';
import {CombatSystem} from './CombatSystem.js';
import {createCharacter,addExperience,addGold} from './CharacterSystem.js';
import {RPGConfig,RPGDungeonData,RPGRewardData,createRPGContext} from './RPGConfig.js';
import {SaveSystem} from './SaveSystem.js';
import {syncEncounter} from './EncounterData.js';
const blankStats=()=>({turns:0,attack:{S:0,A:0,B:0,C:0},defense:{S:0,A:0,B:0,C:0},blocks:0,scrolls:0});
const runId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export class RPGMode{
 constructor(storage=null){this.saves=new SaveSystem(storage);this.data=null;this.loadInfo={status:'empty',message:''};this.saveInfo={ok:true,message:''};this.receipt=null;}
 load(){if(this.data&&!this.saveInfo.ok){this.loadInfo={status:'ready',data:this.data,message:'저장되지 않은 현재 창의 모험을 이어갑니다.'};return this.loadInfo;}this.loadInfo=this.saves.load();this.data=this.loadInfo.data;this.receipt=this.data?.progress.run?.pendingLoot?.receipt||null;return this.loadInfo;}
 get character(){return this.data?.character;}
 get run(){return this.data?.progress.run;}
 create(name){const character=createCharacter(name);this.data={saveVersion:RPGConfig.saveVersion,character,progress:{clearedDungeons:[],run:null,completedRuns:0,stats:blankStats()},meta:{createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}};this.receipt=null;this.loadInfo={status:'ready',data:this.data,message:''};this.save();return character;}
 save(){if(!this.data)return false;this.data.meta.updatedAt=new Date().toISOString();this.saveInfo=this.saves.save(this.data);return this.saveInfo.ok;}
 enterDungeon(){if(!this.character)throw new Error('먼저 용사를 만들어 주세요.');if(this.run?.status==='active'||this.run?.pendingLoot)return false;this.data.progress.run={id:runId(),dungeonId:RPGDungeonData.id,nextEncounter:0,status:'active',completed:[],clearBonusGranted:false,pendingLoot:null,stats:blankStats(),poison:0};this.receipt=null;this.save();return true;}
 createBattle(){
  const run=this.run;if(!run)throw new Error('던전에 입장해 주세요.');const pending=run.pendingLoot,index=pending?.encounterIndex??run.nextEncounter;
  if(index>=RPGDungeonData.encounters.length)throw new Error('마을로 귀환해 주세요.');
  const state=createState(1,'sequential',createRPGContext(this.character));state.hero.hp=this.character.hp;state.hero.poison=Math.min(3,run.poison||0);state.scrolls=structuredClone(this.character.scrolls);state.stats=structuredClone(run.stats||blankStats());state.turn=state.stats.turns;
  const combat=new CombatSystem(state);combat.configureEncounter(index);combat.startTurn();
  if(pending){state.stats=structuredClone(run.stats||blankStats());state.turn=state.stats.turns;state.enemies.forEach(e=>e.hp=0);syncEncounter(state);state.phase=run.status==='clear'?'clear':'reward';state.lootCandidates=[...pending.candidates];state.lootChosen=pending.chosen;state.lootAcquired=pending.type;this.receipt=pending.receipt;}
  return {state,combat,pending:!!pending};
 }
 captureBattle(state){if(!this.character||state?.battleContext?.mode!=='rpg'||!this.run)return false;this.character.hp=Math.max(0,Math.min(this.character.maxHP,state.hero.hp));this.character.scrolls=structuredClone(state.scrolls);if(this.character.hp===0&&this.run.status==='active')this.run.status='defeat';this.run.poison=state.hero.poison;this.run.stats=structuredClone(state.stats);return true;}
 awardBattle(state){
  if(!['reward','clear'].includes(state?.phase)||state.enemies?.some(e=>e.hp>0)||!this.captureBattle(state))return false;const run=this.run,index=state.encounterIndex;if(run.completed.includes(index))return false;
  const reward=state.enemies.reduce((sum,e)=>{const r=RPGRewardData[e.type]||{exp:0,gold:0};return {exp:sum.exp+r.exp,gold:sum.gold+r.gold};},{exp:0,gold:0});
  const final=index===RPGDungeonData.encounters.length-1,bonus=final&&!run.clearBonusGranted?RPGDungeonData.clearReward:{exp:0,gold:0};const levelUp=addExperience(this.character,reward.exp+bonus.exp);addGold(this.character,reward.gold+bonus.gold);
  run.completed.push(index);run.nextEncounter=index+1;if(final){run.status='clear';run.clearBonusGranted=true;if(!this.data.progress.clearedDungeons.includes(run.dungeonId))this.data.progress.clearedDungeons.push(run.dungeonId);}
  this.receipt={reward,bonus,levelUp,final,enemyNames:state.enemies.map(e=>e.name)};run.pendingLoot={encounterIndex:index,candidates:[...state.lootCandidates],chosen:!!state.lootChosen,type:state.lootAcquired||null,receipt:this.receipt};this.applyCharacter(state);this.save();return this.receipt;
 }
 applyCharacter(state){state.battleContext=createRPGContext(this.character);state.hero.hp=this.character.hp;}
 recordLoot(state,type){const pending=this.run?.pendingLoot;if(!pending||pending.chosen)return false;if(!pending.candidates.includes(type))return false;this.captureBattle(state);pending.chosen=true;pending.type=type;this.save();return true;}
 advanceBattle(state,combat){if(!this.run?.pendingLoot?.chosen||this.run.status!=='active')return false;this.captureBattle(state);this.run.pendingLoot=null;this.receipt=null;this.applyCharacter(state);combat.nextMonster();this.captureBattle(state);this.save();return true;}
 onBattleEvent(event,state){if(!event)return;if(event.kind==='victory')this.awardBattle(state);else if(event.kind==='gameover'){this.captureBattle(state);this.run.status='defeat';this.save();}else if(['magic','turn-end'].includes(event.kind)){this.captureBattle(state);this.save();}}
 returnToTown(){
  if(!this.run)return false;const result=this.run.status;if(!['clear','defeat'].includes(result))return false;
  if(result==='clear'&&!this.run.pendingLoot?.chosen)return false;
  if(result==='clear'&&RPGConfig.restoreOnClear||result==='defeat'&&RPGConfig.restoreOnDefeat)this.character.hp=this.character.maxHP;
  const totals=this.data.progress.stats||blankStats(),current=this.run.stats||blankStats();for(const key of ['turns','blocks','scrolls'])totals[key]=(totals[key]||0)+(current[key]||0);for(const side of ['attack','defense'])for(const grade of ['S','A','B','C'])totals[side][grade]=(totals[side][grade]||0)+(current[side][grade]||0);
  this.data.progress.stats=totals;if(result==='clear')this.data.progress.completedRuns=(this.data.progress.completedRuns||0)+1;this.data.progress.run=null;this.receipt=null;this.save();return result;
 }
}
