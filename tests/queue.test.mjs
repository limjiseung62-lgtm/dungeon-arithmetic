import test from 'node:test';import assert from 'node:assert/strict';
import {createState} from '../src/GameState.js';import {CombatSystem} from '../src/CombatSystem.js';import {createPads,inputDice,inputOperator,eraseInput,resetPad} from '../src/InputPadSystem.js';
const game=(mode='sequential')=>{const s=createState(4,mode),c=new CombatSystem(s);c.startTurn();return {s,c};};
const submit=(c,side,grade,player)=>{const t=c.state.targets.find(t=>t.side===side&&t.grade===grade);c.submit(t.solution.ids,t.solution.ops,player);return t;};
test('success only claims and queues; no HP, shields, scroll charges or combat stats change',()=>{
  const {s,c}=game(),hp=s.monsterHP;const t=submit(c,'attack','S',0);
  assert.equal(s.monsterHP,hp);assert.equal(s.hero.shield,0);assert.equal(s.scrolls[0].uses,3);assert.equal(s.stats.scrolls,0);assert.equal(s.stats.attack.S,0);
  assert.equal(t.claimedBy,0);assert.equal(s.actionQueue.length,2);assert.deepEqual(s.actionQueue.map(a=>a.actionType),['attack','scroll']);
  submit(c,'defense','S',1);assert.equal(s.hero.shield,0);assert.equal(s.specialBlocked,false);assert.equal(s.actionQueue.length,4);
});
test('four player queue resolves in submission order, once, after everyone completes',()=>{
  const {s,c}=game(),hp=s.monsterHP;
  submit(c,'attack','C',0);submit(c,'defense','A',1);submit(c,'attack','S',2);submit(c,'attack','A',3);
  assert.equal(s.phase,'resolution');assert.equal(s.monsterHP,hp);c.resolveAll();
  assert.equal(s.monsterHP,hp-10-27-22-27);assert.equal(s.hero.shield,26-8);assert.equal(s.scrolls[0].uses,2);
  assert.equal(s.events.filter(e=>e.kind==='attack').length,3);assert.equal(s.events.filter(e=>e.kind==='magic').length,1);
  const snapshot=JSON.stringify(s);c.resolveAll();c.endTurn();assert.equal(JSON.stringify(s),snapshot);
});
test('simultaneous claims are atomic; contested claim neither consumes action nor changes queue',async()=>{
  const {s,c}=game('simultaneous'),t=s.targets.find(t=>t.id==='attack-C');
  const responses=await Promise.allSettled([Promise.resolve().then(()=>c.submit(t.solution.ids,t.solution.ops,2)),Promise.resolve().then(()=>c.submit(t.solution.ids,t.solution.ops,0))]);
  assert.equal(responses.filter(r=>r.status==='fulfilled').length,1);assert.match(responses[1].reason.message,/이미 3P/);
  assert.equal(t.claimedBy,2);assert.equal(s.actionsDone[0],false);assert.equal(s.actionsDone[2],true);assert.equal(s.actionQueue.length,1);
  submit(c,'attack','A',0);assert.equal(s.actionsDone[0],true);
});
test('independent input pads retain dice, operators, reset and erase independently',()=>{
  const pads=createPads(4);for(let i=0;i<4;i++){inputDice(pads[i],i%3);inputOperator(pads[i],['+','−','×','÷'][i]);}
  const others=JSON.stringify(pads.slice(1));resetPad(pads[0]);assert.equal(JSON.stringify(pads.slice(1)),others);assert.notEqual(pads[0].ids,pads[1].ids);
  const first=JSON.stringify(pads[0]);eraseInput(pads[3]);assert.equal(JSON.stringify(pads[0]),first);
});
test('timer expiry auto passes remaining slots, preserves queued attacks and closes all inputs',()=>{
  const {s,c}=game('simultaneous'),hp=s.monsterHP;submit(c,'attack','B',2);c.timeUpdate(31);assert.equal(s.seconds,31);c.timeUpdate(0);
  assert.ok(s.actionsDone.every(Boolean));assert.equal(s.monsterHP,hp);assert.throws(()=>submit(c,'attack','C',0));c.resolveAll();assert.equal(s.monsterHP,hp-17);
});
test('reserved scroll identity remains stable when shared selection changes',()=>{
  const {s,c}=game();s.scrolls.push({type:'heal',uses:3});submit(c,'attack','S',0);s.scrollIndex=1;c.endTurn();c.resolveAll();
  assert.equal(s.scrolls[0].uses,2);assert.equal(s.scrolls[1].uses,3);assert.equal(s.stats.scrolls,1);
});
test('lethal queue stops later actions and enemy counter; uncast scroll not consumed',()=>{
  const {s,c}=game();s.monsterHP=5;submit(c,'attack','C',0);submit(c,'attack','S',1);c.pass(2);c.pass(3);const hp=s.hero.hp;c.resolveAll();
  assert.equal(s.phase,'reward');assert.equal(s.hero.hp,hp);assert.equal(s.scrolls[0].uses,3);assert.equal(s.stats.scrolls,0);assert.equal(s.events.filter(e=>e.kind==='enemy').length,0);
  assert.equal(s.actionQueue[1].status,'cancelled');assert.equal(s.totalDamage,5);
});
test('defense S is applied only in resolution and cancels only the scheduled special',()=>{
  const {s,c}=game();s.intent.special='steal';submit(c,'defense','S',0);assert.equal(s.specialBlocked,false);assert.equal(s.hero.shield,0);c.endTurn();c.resolveAll();
  assert.equal(s.specialBlocked,true);assert.equal(s.stolen,false);assert.equal(s.hero.shield,18);assert.equal(s.stats.blocks,1);assert.equal(s.events.filter(e=>e.kind==='enemy').length,1);
});
test('next turn cannot start early; all eight targets replaced only after resolution',()=>{
  const {s,c}=game();const old=s.targets;c.endTurn();assert.equal(c.startTurn(),false);assert.equal(s.targets,old);c.resolveAll();assert.equal(c.startTurn(),true);assert.notEqual(s.targets,old);assert.equal(s.actionQueue.length,0);assert.ok(s.targets.every(t=>!t.used));
});
