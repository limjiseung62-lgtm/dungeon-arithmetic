import {GameConfig as config} from './GameConfig.js';
export function scoreExpression(e){
  const weights={'+':0,'−':1,'×':2,'÷':3};
  let score=e.ids.length===3?3:0;
  score+=e.ops.reduce((n,op)=>n+weights[op],0);
  if(e.ops.length===2 && e.ops[0]!==e.ops[1]) score+=1;
  if(e.ops.length===2 && e.ops[0]==='−') score+=1;
  return score;
}
export function gradeScore(score){return score>=config.difficulty.S?'S':score>=config.difficulty.A?'A':score>=config.difficulty.B?'B':'C';}
export function analyze(expressions){
  const results=new Map();
  for(const e of expressions){
    const score=scoreExpression(e), existing=results.get(e.value);
    if(!existing) results.set(e.value,{value:e.value,score,grade:gradeScore(score),solution:e,solutions:[e]});
    else {existing.solutions.push(e);if(score<existing.score){existing.score=score;existing.grade=gradeScore(score);existing.solution=e;}}
  }
  return [...results.values()];
}
