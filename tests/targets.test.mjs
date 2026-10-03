import test from 'node:test';import assert from 'node:assert/strict';
import {analyze,scoreExpression} from '../src/DifficultyEvaluator.js';
import {enumerate,evaluate} from '../src/ExpressionEngine.js';
import {generateTurn,targetsForDice} from '../src/TargetGenerator.js';
let seed=92743;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
test('easiest solution controls grade, not hardest alternative',()=>{
  const t=analyze(enumerate([8,3,2])).find(t=>t.value===10);
  assert.equal(t.grade,'C');assert.equal(t.solution.ids.length,2);
  assert.ok(t.solutions.some(e=>e.expression==='(8 − 3) × 2'));
});
test('insufficient grade diversity rejects dice instead of inventing targets',()=>assert.equal(targetsForDice([1,1,1]),null));
test('3000 generated turns: eight unique, legal targets; grade agrees with easiest solution',()=>{
  let previous=[],unchanged=0;const signatures=new Set();
  for(let i=0;i<3000;i++){
    const {dice,targets}=generateTurn(rng,previous);
    assert.equal(targets.length,8);assert.equal(new Set(targets.map(t=>t.value)).size,8);
    for(const t of targets){
      assert.equal(evaluate(dice,t.solution.ids,t.solution.ops).value,t.value);
      assert.equal(t.score,Math.min(...t.solutions.map(scoreExpression)));
      assert.equal(targets.filter(x=>x.grade===t.grade).length,2);
      assert.equal(new Set(t.solution.ids).size,t.solution.ids.length);
    }
    const values=targets.map(t=>t.value);if(values.join()===previous.join())unchanged++;
    signatures.add(values.join());previous=values;
  }
  assert.ok(signatures.size>1000);assert.ok(unchanged<5);
});
