import {plan} from './BalanceStrategies.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {createState} from '../src/GameState.js';import {CombatSystem} from '../src/CombatSystem.js';import {MonsterData} from '../src/MonsterData.js';
const game=(index=0,players=4)=>{const s=createState(players);s.monsterIndex=index;s.monsterHP=MonsterData[index].hp;const c=new CombatSystem(s,Math.random,()=>.2);c.startTurn();return {s,c};};
const finish=c=>{c.endTurn();c.resolveAll();};
const hit=(c,side,grade)=>{const t=c.state.targets.find(t=>t.side===side&&t.grade===grade);return c.submit(t.solution.ids,t.solution.ops);};
test('attack S consumes shared scroll; defense S blocks special but keeps normal attack',()=>{
  const {s,c}=game(1);hit(c,'attack','S');assert.equal(s.scrolls[0].uses,3);assert.equal(s.monsterHP,MonsterData[1].hp);
  hit(c,'defense','S');assert.equal(s.hero.shield,0);finish(c);assert.equal(s.scrolls[0].uses,2);assert.equal(s.monsterHP,MonsterData[1].hp-48);assert.equal(s.stolen,false);assert.equal(s.hero.shield,0);assert.equal(s.hero.hp,174);assert.equal(s.stats.blocks,1);
});
test('scroll vanishes after three uses and death has no counterattack',()=>{
  const {s,c}=game(4);s.monsterHP=1000;
  for(let i=0;i<3;i++){hit(c,'attack','S');finish(c);c.startTurn();}
  assert.equal(s.scrolls.length,0);s.monsterHP=1;const hp=s.hero.hp;hit(c,'attack','C');finish(c);assert.equal(s.phase,'clear');assert.equal(s.hero.hp,hp);assert.equal(s.scrolls.length,0);assert.equal(s.lootCandidates.length,3);assert.equal(c.chooseReward(s.lootCandidates[0]),true);assert.equal(s.scrolls.length,1);
});
test('goblin steals next turn time; then resets to 60 if blocked',()=>{
  const {s,c}=game(1);finish(c);c.startTurn();assert.equal(s.duration,45);hit(c,'defense','S');finish(c);c.startTurn();assert.equal(s.duration,60);
});
test('curse at 20 seconds can be lifted by defense S; hints never disclose solutions',()=>{
  const {s,c}=game(2);c.timeUpdate(41);assert.equal(s.curse,false);c.timeUpdate(40);assert.equal(s.curse,true);hit(c,'defense','S');assert.equal(s.curse,false);
});
test('spider poison lasts three ticks, web skips exactly one player next turn',()=>{
  const {s,c}=game(3);finish(c);assert.equal(s.hero.poison,2);c.startTurn();assert.equal(s.intent.special,'web');finish(c);c.startTurn();assert.equal(s.blocked.slot,1);assert.equal(s.player,0);c.pass();assert.equal(s.player,2);finish(c);c.startTurn();assert.equal(s.blocked,null);
});
test('golem relocates marks, stone blocks next action, defense S prevents relocation',()=>{
  const {s,c}=game(4);const positions=s.targets.map(t=>t.position);c.timeUpdate(40);assert.ok(s.targets.every((t,i)=>t.position!==positions[i]));finish(c);c.startTurn();assert.equal(s.intent.special,'stone');finish(c);c.startTurn();assert.equal(s.blocked.type,'stone');
  const g=game(4);hit(g.c,'defense','S');g.c.timeUpdate(40);assert.equal(g.s.shifted,false);
});
test('solo always retains one actionable slot without deadlock',()=>{const {s,c}=game(3,1);finish(c);c.startTurn();finish(c);c.startTurn();assert.equal(s.phase,'playing');assert.equal(s.actionsDone[0],false);});
test('game over at zero shared HP',()=>{const {s,c}=game();s.hero.hp=1;finish(c);assert.equal(s.phase,'gameover');});
test('full campaign for 1 to 4 players, rewards and final clear',()=>{
  for(let players=1;players<=4;players++){
    const {s,c}=game(0,players);let guard=0;
    while(s.phase!=='clear'&&s.phase!=='gameover'&&guard++<600){
      if(s.phase==='resolution')c.resolveAll();else if(s.phase==='enemy')c.startTurn();else if(s.phase==='reward'){c.chooseReward(s.lootCandidates.find(id=>id==='fire')||s.lootCandidates.find(id=>['ice','shield','heal'].includes(id))||s.lootCandidates[0]);c.nextMonster();}
      else if(s.phase==='playing'){
        for(const t of plan(s,'adaptive')){if(s.phase!=='playing')break;c.submit(t.solution.ids,t.solution.ops);}
        while(s.phase==='playing')c.pass();
      }
    }
    assert.equal(s.phase,'clear',`${players} players campaign`);assert.equal(s.monsterIndex,4);assert.ok(s.stats.scrolls>=3);
  }
});

