import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,enumerate,step} from '../src/ExpressionEngine.js';
test('left to right, explicit steps and parentheses',()=>{
  const e=evaluate([3,7,2],[0,1,2],['+','×']);
  assert.equal(e.value,20);assert.equal(e.expression,'(3 + 7) × 2');
  assert.deepEqual(e.steps,['3 + 7 = 10','10 × 2 = 20']);
});
test('dice identity, minimum use, division and integer constraints',()=>{
  assert.throws(()=>evaluate([3,7,2],[1,1],['+']));
  assert.equal(evaluate([7,7,2],[0,1],['+']).value,14);
  assert.throws(()=>evaluate([3,7,2],[0],[]));
  assert.throws(()=>step(7,'÷',0));assert.throws(()=>step(7,'÷',2));
  assert.throws(()=>evaluate([3,7,2],[3,0],['+']));
});
test('all 960 dice combinations enumerate only legal exact expressions',()=>{
  for(let a=1;a<=8;a++)for(let b=1;b<=10;b++)for(let c=1;c<=12;c++){
    const dice=[a,b,c];
    for(const e of enumerate(dice)){
      assert.equal(new Set(e.ids).size,e.ids.length);
      assert.equal(evaluate(dice,e.ids,e.ops).value,e.value);
      assert.ok(e.value>0&&e.value<=120);
    }
  }
});
