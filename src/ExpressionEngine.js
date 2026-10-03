import {GameConfig as config} from './GameConfig.js';
export const OPERATORS=['+','−','×','÷'];
export function step(a,op,b){
  if(op==='÷' && b===0) throw new Error('0으로 나눌 수 없어요.');
  const n=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:op==='÷'?a/b:NaN;
  if(!Number.isFinite(n)) throw new Error('올바른 연산을 선택해 주세요.');
  if(config.integerSteps && !Number.isInteger(n)) throw new Error('나눗셈은 나누어떨어져야 해요.');
  if(config.positiveSteps && n<=0) throw new Error('계산 중에도 양의 정수를 만들어 주세요.');
  if(Math.abs(n)>config.maxIntermediate) throw new Error('계산 결과가 너무 커요.');
  return n;
}
// Numbers are addressed by dice identity, not value. No eval and no precedence parser.
export function evaluate(dice,ids,ops){
  if(ids.length<2 || ids.length>3 || ops.length!==ids.length-1) throw new Error('주사위 2개 또는 3개로 수식을 완성해 주세요.');
  if(new Set(ids).size!==ids.length || ids.some(i=>!Number.isInteger(i)||i<0||i>=dice.length)) throw new Error('각 주사위는 한 번만 사용할 수 있어요.');
  let value=dice[ids[0]], expression=String(value); const steps=[];
  for(let i=0;i<ops.length;i++){
    const b=dice[ids[i+1]], next=step(value,ops[i],b);
    steps.push(`${value} ${ops[i]} ${b} = ${next}`);
    expression=i===0?`${expression} ${ops[i]} ${b}`:`(${expression}) ${ops[i]} ${b}`;
    value=next;
  }
  return {ids:[...ids],ops:[...ops],value,expression,steps};
}
export function enumerate(dice){
  const result=[];
  function visit(ids){
    if(ids.length>=2){
      for(const a of OPERATORS) for(const b of ids.length===3?OPERATORS:[null]){
        try { const e=evaluate(dice,ids,b?[a,b]:[a]); if(e.value<=config.maxTarget) result.push(e); } catch{}
      }
    }
    if(ids.length===3)return;
    for(let i=0;i<3;i++) if(!ids.includes(i)) visit([...ids,i]);
  }
  visit([]); return result;
}
