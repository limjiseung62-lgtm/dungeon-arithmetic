import {evaluate} from './ExpressionEngine.js';
export const createPads=count=>Array.from({length:count},()=>({ids:[],ops:[],pending:null,message:'주사위 → 연산 → 주사위',error:false}));
export function inputDice(pad,index){
  if(pad.ids.includes(index)||pad.ids.length===3||(pad.ids.length&&pad.pending===null))return false;
  if(pad.ids.length)pad.ops.push(pad.pending);pad.ids.push(index);pad.pending=null;pad.error=false;return true;
}
export function inputOperator(pad,op){if(!pad.ids.length||pad.ids.length===3)return false;pad.pending=op;return true;}
export function eraseInput(pad){if(pad.pending!==null)pad.pending=null;else if(pad.ids.length>1){pad.ids.pop();pad.pending=pad.ops.pop();}else pad.ids=[];pad.error=false;}
export function resetPad(pad){pad.ids=[];pad.ops=[];pad.pending=null;pad.error=false;pad.message='새 수식을 만들어 보세요.';}
export function previewPad(pad,dice){
  let expression='',steps='',valid=false;
  if(pad.ids.length){expression=String(dice[pad.ids[0]]);for(let i=1;i<pad.ids.length;i++)expression=i===1?`${expression} ${pad.ops[i-1]} ${dice[pad.ids[i]]}`:`(${expression}) ${pad.ops[i-1]} ${dice[pad.ids[i]]}`;}
  if(pad.ids.length>=2){try{const e=evaluate(dice,pad.ids,pad.ops);expression=e.expression+(pad.pending?'':` = ${e.value}`);steps=e.steps.join(' → ');valid=pad.pending===null;}catch(err){steps=err.message;}}
  if(pad.pending)expression+=` ${pad.pending} …`;
  return {expression,steps,valid};
}
