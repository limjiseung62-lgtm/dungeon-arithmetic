import test from 'node:test';import assert from 'node:assert/strict';
import {createState} from '../src/GameState.js';import {CombatSystem} from '../src/CombatSystem.js';import {BattleDirector} from '../src/BattleDirector.js';
function setup(){const s=createState(4),c=new CombatSystem(s);c.startTurn();for(const [side,grade] of [['attack','S'],['defense','S']]){const t=s.targets.find(t=>t.side===side&&t.grade===grade);c.submit(t.solution.ids,t.solution.ops);}c.pass();c.pass();return {s,c};}
test('cinematic pacing and fast deterministic resolution produce identical game results',async()=>{
  const {s,c}=setup();const expected=structuredClone(s),directCombat=new CombatSystem(expected);directCombat.resolveAll();
  const effects=[],updates=[];let finished=0;const d=new BattleDirector(c,{effects:e=>effects.push(e.kind),update:e=>updates.push(e.kind),finish:()=>finished++,scale:()=>0});await d.run();
  assert.equal(s.monsterHP,expected.monsterHP);assert.deepEqual(s.hero,expected.hero);assert.deepEqual(s.stats,expected.stats);assert.equal(s.scrolls[0].uses,2);assert.equal(finished,1);
  assert.ok(effects.indexOf('scroll-open')<effects.indexOf('magic'));assert.equal(updates.filter(k=>k==='magic').length,1);assert.equal(updates.filter(k=>k==='enemy').length,1);
});
test('cancelling a cinematic leaves unexecuted actions untouched and releases waits',async()=>{
  const {s,c}=setup(),hp=s.monsterHP;let finished=0;
  const d=new BattleDirector(c,{effects:()=>{},update:()=>{},finish:()=>finished++,scale:()=>1});const running=d.run();d.cancel();await running;
  assert.equal(s.monsterHP,hp);assert.equal(s.scrolls[0].uses,3);assert.equal(s.resolutionIndex,0);assert.equal(finished,0);assert.equal(d.pending.size,0);
});
