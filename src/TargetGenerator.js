import {enumerate,evaluate} from './ExpressionEngine.js';
import {analyze} from './DifficultyEvaluator.js';
import {rollDice,shuffle} from './DiceSystem.js';
export function targetsForDice(dice,rng=Math.random,previous=[]){
  const pool=analyze(enumerate(dice)), targets=[];
  for(const grade of ['S','A','B','C']){
    const options=shuffle(pool.filter(t=>t.grade===grade),rng).sort((a,b)=>Number(previous.includes(a.value))-Number(previous.includes(b.value)));
    if(options.length<2)return null;
    for(let i=0;i<2;i++)targets.push({...options[i],side:i===0?'attack':'defense',id:`${i===0?'attack':'defense'}-${grade}`,used:false,position:['S','A','B','C'].indexOf(grade)});
  }
  if(new Set(targets.map(t=>t.value)).size!==8)throw new Error('중복 목표');
  for(const t of targets)if(evaluate(dice,t.solution.ids,t.solution.ops).value!==t.value)throw new Error('정답 검증 실패');
  return targets;
}
export function generateTurn(rng=Math.random,previous=[]){
  for(let attempt=0;attempt<3000;attempt++){
    const dice=rollDice(rng),targets=targetsForDice(dice,rng,previous);
    if(targets)return {dice,targets};
  }
  throw new Error('유효한 주사위를 생성하지 못했습니다.');
}
