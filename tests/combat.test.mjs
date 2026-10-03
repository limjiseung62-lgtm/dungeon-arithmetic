import test from 'node:test';import assert from 'node:assert/strict';
import {createState} from '../src/GameState.js';import {CombatSystem} from '../src/CombatSystem.js';import {takeDamage} from '../src/DefenseSystem.js';
function game(n=4){const s=createState(n),c=new CombatSystem(s);c.startTurn();return {s,c};}
function hit(c,side,grade){const t=c.state.targets.find(t=>t.side===side&&t.grade===grade);c.submit(t.solution.ids,t.solution.ops);return t;}
test('skeleton basic: player order, consumed targets, shields, turn refresh',()=>{
  const {s,c}=game();const t=hit(c,'defense','C');assert.equal(s.player,1);assert.equal(s.hero.shield,0); assert.equal(t.claimedBy,0);
  assert.throws(()=>c.submit(t.solution.ids,t.solution.ops));assert.equal(s.player,1);
  c.pass();c.pass();c.pass();assert.equal(s.phase,'resolution');c.resolveAll();assert.equal(s.phase,'enemy');assert.equal(s.hero.hp,180);assert.equal(s.hero.shield,1);
  const old=s.targets;c.startTurn();assert.notEqual(s.targets,old);assert.ok(s.targets.every(t=>!t.used));
});
test('shield absorbs before HP',()=>{const {s}=game();s.hero.shield=20;takeDamage(s,15);assert.equal(s.hero.shield,5);assert.equal(s.hero.hp,180);takeDamage(s,10);assert.equal(s.hero.hp,175);});
test('shared timer carries between players; expiry ends all remaining actions',()=>{const {s,c}=game();c.timeUpdate(43);c.pass();assert.equal(s.seconds,43);c.timeUpdate(0);assert.equal(s.phase,'resolution');c.resolveAll();assert.equal(s.phase,'enemy');});

