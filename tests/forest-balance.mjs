import {RPGMode} from '../src/RPGMode.js';
import {characterStats} from '../src/RPGConfig.js';
export function forestSimulation(policy='adaptive',seed=1,grade='S',level=4,mercenaryId=null){
 let value=seed;const rng=()=>{value=(value*1664525+1013904223)>>>0;return value/4294967296;};
 const storage={getItem(){return null;},setItem(){}},rpg=new RPGMode(storage,rng);rpg.create('균형 용사');
 Object.assign(rpg.character,{level,exp:0,...characterStats(level),hp:characterStats(level).maxHP});rpg.character.inventory.items.push('steel_sword','leather_armor');rpg.equip('steel_sword');rpg.equip('leather_armor');rpg.character.hp=rpg.character.maxHP;
 const p=rpg.data.progress;p.clearedDungeons=['old-prison'];p.rewardedQuests=['first-adventure','forest-road'];p.questProgress={'first-adventure':{count:1,scrolls:[]},'forest-road':{count:1,scrolls:[]}};p.unlockedDungeons.push('cursed-forest');
 if(mercenaryId){rpg.character.gold=5000;rpg.hire(mercenaryId);}
 rpg.enterDungeon('cursed-forest');const {state:s,combat:c}=rpg.createBattle();c.rng=rng;c.lootRng=rng;
 const turns=[0,0,0,0,0],specials={};let guard=0;
 while(!['clear','gameover'].includes(s.phase)&&guard++<150){
  if(s.phase==='reward'){const pick=s.lootCandidates.find(t=>t==='heal')||s.lootCandidates.find(t=>t==='shield')||s.lootCandidates[0];c.chooseReward(pick);rpg.recordLoot(s,pick);rpg.advanceBattle(s,c);continue;}
  if(s.phase==='enemy')c.startTurn();
  if(s.phase!=='playing')break;
  turns[s.encounterIndex]++;
  const alive=s.enemies.filter(e=>e.hp>0),incoming=alive.reduce((n,e)=>n+e.intent.attack,0);
  const side=policy==='defense'?'defense':policy==='attack'?'attack':s.hero.shield<incoming&&(s.enemyTurn===1||s.hero.hp<90||alive.some(e=>e.intent.special==='poison'))?'defense':'attack';
  const t=s.targets.find(t=>t.side===side&&t.grade===grade);c.submit(t.solution.ids,t.solution.ops);
  if(c.awaitingChoices()){const focus=side==='attack'?(alive.find(e=>e.type==='mushroomSpirit')||alive[0]):(alive.find(e=>e.intent.special==='poison')||alive.find(e=>e.intent.special!=='none')||alive[0]);c.chooseTarget(0,focus.id);}
  while(s.phase==='resolution'){
   const pending=s.resolutionStage==='actions'?s.actionQueue[s.resolutionIndex]:null;if(pending?.actionType==='scroll'){const pick=s.hero.hp<80?s.scrolls.find(x=>x.type==='heal'):null;const slot=pick||s.scrolls.find(x=>['fire','ice','lightning','meteor','iceStorm'].includes(x.type))||s.scrolls[0];c.chooseScroll(pending,slot?s.scrolls.indexOf(slot):null);}
   const event=c.resolveNext();rpg.onBattleEvent(event,s);if(event?.special&&event.kind!=='special-none')specials[event.kind]=(specials[event.kind]||0)+1;
  }
 }
 return {policy,seed,grade,level,mercenaryId,supports:rpg.data.progress.mercenaryStats.supports,phase:s.phase,hp:s.hero.hp,turns,totalTurns:turns.reduce((a,b)=>a+b,0),specials};
}
if(process.argv[1]?.endsWith('forest-balance.mjs')){
 const results=[];for(const policy of ['attack','defense','adaptive'])for(const grade of ['S','A'])for(let seed=1;seed<=10;seed++)results.push(forestSimulation(policy,seed,grade));
 console.log(JSON.stringify(results,null,2));
}
