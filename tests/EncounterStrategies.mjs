import {createState} from '../src/GameState.js';
import {CombatSystem} from '../src/CombatSystem.js';
import {EncounterData,livingEnemies} from '../src/EncounterData.js';
import {reserveAction} from '../src/ActionQueue.js';
export function planEncounter(s,policy='adaptive'){
 const count=s.actionsDone.filter(x=>!x).length,alive=livingEnemies(s),focus=alive.filter(e=>e.hp>0).sort((a,b)=>a.hp-b.hp)[0];
 if(policy==='attack-all')return {goals:s.targets.filter(t=>t.side==='attack').slice(0,count),focus:focus.id,block:alive.find(e=>e.intent.special!=='none')?.id,scroll:s.scrollIndex};
 if(policy==='defense-all')return {goals:s.targets.filter(t=>t.side==='defense').slice(0,count),focus:focus.id,block:alive.find(e=>e.intent.special!=='none')?.id,scroll:s.scrollIndex};
 let best=null;const subsets=[];for(let mask=1;mask<256;mask++){const goals=s.targets.filter((_,i)=>mask&(1<<i));if(goals.length<=count)subsets.push(goals);}
 const blocks=alive.filter(e=>e.intent.special!=='none');if(!blocks.length)blocks.push(alive[0]);
 for(const goals of subsets)for(const target of alive)for(const block of blocks){
  const sc=goals.some(t=>t.side==='attack'&&t.grade==='S')?s.scrolls.map((_,i)=>i):[s.scrollIndex];if(!sc.length)sc.push(0);
  for(const scroll of sc){const copy=structuredClone(s),c=new CombatSystem(copy,Math.random,()=>.2);copy.scrollIndex=scroll;copy.choices={};copy.actionQueue=[];copy.resolutionIndex=0;
   for(const [i,t]of goals.entries()){reserveAction(copy,t,t.solution,i);for(const a of copy.actionQueue.filter(a=>a.playerId===i)){if(a.actionType==='attack'||a.actionType==='scroll')a.enemyId=target.id;if(a.actionType==='block')a.enemyId=block.id;}}
   c.endTurn();c.resolveAll();const loss=s.hero.hp-copy.hero.hp,damage=s.monsterHP-copy.monsterHP,kills=alive.length-livingEnemies(copy).length;
   const bossValue=copy.enemies.reduce((n,e,i)=>n+(e.boss?(e.boss.pressure-(s.enemies[i].boss?.pressure||0))*12+(e.boss.breaks-(s.enemies[i].boss?.breaks||0))*35:0),0);let score=bossValue+damage+ kills*25-loss*3+Math.min(55,copy.hero.shield)*.45-(copy.hero.poison?4:0)-(copy.stolen?2:0);
   if(copy.hero.hp===0)score=-1e6;if(['reward','clear'].includes(copy.phase))score=10000-loss*3-goals.length*.1;
   if(!best||score>best.score)best={goals,focus:target.id,block:block.id,scroll,score};
  }
 }
 return best;
}
export function simulateEncounterCampaign(players,policy='adaptive',seed=1){let random=seed;const rng=()=>{random=(random*1664525+1013904223)>>>0;return random/2**32;};const s=createState(players,'simultaneous'),c=new CombatSystem(s,rng,rng);c.configureEncounter(0);c.startTurn();const turns=Array(6).fill(0);let guard=0;
 while(!['clear','gameover'].includes(s.phase)&&guard++<160){if(s.phase==='reward'){const preferred=s.hero.hp<120?'heal':'fire';c.chooseReward(s.lootCandidates.find(t=>t===preferred)||s.lootCandidates.find(t=>['iceStorm','lightning','shield','meteor'].includes(t))||s.lootCandidates[0]);c.nextMonster();continue;}if(s.phase==='enemy'){c.startTurn();continue;}if(s.phase==='playing'){turns[s.encounterIndex]++;const plan=planEncounter(s,policy);s.scrollIndex=plan.scroll;let i=0;for(const t of plan.goals){const p=s.actionsDone.findIndex((done,p)=>!done&&!s.choices[p]);if(p<0)break;c.submit(t.solution.ids,t.solution.ops,p);if(s.choices[p])c.chooseTarget(p,t.side==='attack'?plan.focus:plan.block);i++;}c.endTurn();c.resolveAll();}}
 return {players,policy,seed,phase:s.phase,hp:s.hero.hp,turns,scrolls:s.stats.scrolls};
}
if(process.argv[1]?.endsWith('EncounterStrategies.mjs')){for(const players of [1,2,3,4])for(const policy of ['attack-all','defense-all','adaptive'])console.log(JSON.stringify(simulateEncounterCampaign(players,policy)));}
