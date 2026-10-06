export const AttackS35Timeline=Object.freeze([
 {stage:'anticipation',ms:180},{stage:'cutin',ms:340},{stage:'charge',ms:260},{stage:'trail',ms:200},{stage:'contact',ms:110},{stage:'reaction',ms:280},{stage:'damage',ms:350},{stage:'restore',ms:180}
]);
export const AttackS35Reduced=Object.freeze([
 {stage:'anticipation',ms:120},{stage:'cutin',ms:140},{stage:'charge',ms:160},{stage:'trail',ms:100},{stage:'contact',ms:0},{stage:'reaction',ms:100},{stage:'damage',ms:350},{stage:'restore',ms:100}
]);
// Resolve is called once at contact; waiting, cancellation and skip are presentation only.
export async function runAttackS35({wait,stage,resolve,valid=()=>true,plan=AttackS35Timeline}){let result=null,committed=false;for(const part of plan){if(!valid())return result;if(part.stage==='contact'){if(!committed){result=resolve();committed=true;}stage(part.stage,result);}else stage(part.stage,result);await wait(part.ms);}return result;}
