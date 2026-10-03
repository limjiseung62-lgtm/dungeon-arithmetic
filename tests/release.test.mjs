import test from 'node:test';
import assert from 'node:assert/strict';
import {createState} from '../src/GameState.js';
import {CombatSystem} from '../src/CombatSystem.js';
test('next monster preserves HP and clears shield',()=>{
 const s=createState(4),c=new CombatSystem(s);s.phase='reward';s.hero.hp=82;s.hero.shield=30;c.nextMonster();
 assert.equal(s.monsterIndex,1);assert.equal(s.hero.hp,82);assert.equal(s.hero.shield,0);assert.equal(s.phase,'playing');
});
