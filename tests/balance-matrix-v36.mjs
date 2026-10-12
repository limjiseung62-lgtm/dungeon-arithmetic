import fs from 'node:fs';import {performance} from 'node:perf_hooks';import {preparedCastle} from './castle-fixture.mjs';
import {MercenarySystem} from '../src/MercenarySystem.js';import {validateSave} from '../src/SaveSystem.js';
import {LegendaryData} from '../src/LegendaryData.js';import {rollLegendary} from '../src/LegendarySystem.js';
const weapons=['old_sword','steel_sword','rogue_dagger','sage_staff','dark_greatsword','earth_shatterer','eclipse_blade','chaos_staff'];
const parties=[[],['rowen'],['rowen','kain','elia'],['luna','tobin','sol']],rows=[];
function run(ids,level,weapon,scene,boost=1){
 const {r}=preparedCastle(12),p=r.data.progress;r.character.gold=100000;for(const id of ids)r.hire(id);r.setParty(ids);for(const id of ids)p.mercenaryGrowth.records[id].level=level;
 const legendary=LegendaryData.find(i=>i.id===weapon);if(legendary)rollLegendary(p,legendary.boss,'matrix:'+weapon,()=>0);
 r.character.inventory.items.push(weapon);r.equip(weapon);r.character.hp=r.character.maxHP;r.character.scrolls=[{type:'heal',uses:5},{type:'fire',uses:5},{type:'shield',uses:5},{type:'lightning',uses:3},{type:'time',uses:2}];
 if(scene==='boss'){p.clearedDungeons.push('demon-castle');p.campaign.throneReached=p.campaign.throneSceneSeen=p.campaign.eliaTruthSeen=true;r.enterFinalBattle();}
 else {r.enterDungeon(scene==='elite'?'demon-castle':scene==='normal'?'old-prison':'cursed-forest');if(scene==='multi')r.run.nextEncounter=r.dungeon.encounters.findIndex(e=>e.enemies.length>=2);}
 const {state:s,combat:c}=r.createBattle(),support=new MercenarySystem(r.data,r.run),value=support.value.bind(support);support.value=(...a)=>Math.round(value(...a)*boost);c.supportHook=(e,s)=>support.support(e,s);c.scrollModifier=(a,s)=>support.scrollModifier(a,s);
 let seed=2413;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);c.rng=c.lootRng=r.lootRng=rng;const t=performance.now(),events=[];let turns=0,actualDamage=0;const initialHP=s.hero.hp;
 while(turns++<100&&s.phase==='playing'&&!s.kingFinal){const incoming=s.enemies.filter(e=>e.hp>0).reduce((a,e)=>a+e.intent.attack+(e.intent.extraDamage||0),0),heal=s.hero.hp<65&&s.scrolls.some(v=>v.type==='heal'&&v.uses>0),defend=!heal&&s.hero.shield<incoming&&(s.hero.hp<90||s.enemyTurn%3===0||s.enemies.some(e=>['magicStorm','kingSword','doomBreath'].includes(e.intent.special)));
 const target=s.targets.find(t=>t.side===(defend?'defense':'attack')&&t.grade==='S');c.submit(target.solution.ids,target.solution.ops);if(s.choices[0]){const enemy=(s.choices[0].kind==='attack'?s.enemies.find(e=>e.type==='sealGuardian'&&e.hp>0):null)||s.enemies.find(e=>e.hp>0&&(s.choices[0].kind!=='block'||e.intent.special!=='none'));c.chooseTarget(0,enemy.id,s.chaosTurn?.body);}
 for(let i=0;i<50&&s.phase==='resolution';i++){const next=s.actionQueue[s.resolutionIndex];if(next?.actionType==='scroll'&&next.status==='pending'){const type=heal?'heal':s.enemies.filter(e=>e.hp>0).length>1&&s.scrolls.some(x=>x.type==='lightning'&&x.uses>0)?'lightning':s.hero.shield<incoming?'shield':'fire',slot=s.scrolls.findIndex(x=>x.type===type&&x.uses>0);c.chooseScroll(next,slot<0?null:slot);}const before=s.enemies.reduce((n,e)=>n+e.hp,0),e=c.resolveNext();actualDamage+=Math.max(0,before-s.enemies.reduce((n,e)=>n+e.hp,0));if(e){events.push(e);r.onBattleEvent(e,s);}}
 if(s.phase==='enemy')c.startTurn();
 }
 if(s.kingFinal){const before=s.enemies.reduce((n,e)=>n+e.hp,0),q=s.kingFinal.target;c.submitFinal(q.solution.ids,q.solution.ops);const e=c.resolveNext();actualDamage+=Math.max(0,before-s.enemies.reduce((n,e)=>n+e.hp,0));r.onBattleEvent(e,s);}
 const battleWon=['clear','reward'].includes(s.phase);assertValid(r);
 return {party:ids.join('+')||'solo',mercenaryLevel:level,weapon,scene,trialBoost:boost,turns:turns-1,damage:actualDamage,supportDamage:events.flatMap(e=>e.supports||[]).filter(e=>e.effect==='damage').reduce((n,e)=>n+e.value+(e.secondary?.value||0),0),survival:s.hero.hp>0,won:battleWon,hp:s.hero.hp,initialHP,simulationMs:Math.round(performance.now()-t),estimatedSecondsAt20sCalculation:(turns-1)*20+(turns-1)*5};
}
function assertValid(r){validateSave(r.data);}
for(const ids of parties)for(const level of [1,10,20,30])for(const weapon of weapons)for(const scene of ['normal','multi','elite','boss'])rows.push(run(ids,level,weapon,scene));
const trials=[1,1.2,1.3,1.5].flatMap(boost=>[1,30].map(level=>run(['rowen','kain','elia'],level,'eclipse_blade','boss',boost)));
const summarize=a=>({cases:a.length,clearRate:a.filter(v=>v.won).length/a.length,meanTurns:a.reduce((n,v)=>n+v.turns,0)/a.length,meanDamage:a.reduce((n,v)=>n+v.damage,0)/a.length});
const report={passed:rows.every(v=>v.won&&v.survival),seed:2413,method:'actual arithmetic and CombatSystem, fixed S/defense strategy, hero Lv12; time estimate assumes 20s calculation and 5s presentation, not human measurement',cases:rows.length,summary:summarize(rows),party:parties.map(ids=>({party:ids.join('+')||'solo',...summarize(rows.filter(r=>r.party===(ids.join('+')||'solo')))})),trials,rows};
fs.writeFileSync('BALANCE-MATRIX-v3.6.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,cases:rows.length,summary:report.summary,party:report.party,trials}));if(!report.passed)process.exitCode=1;
