// Presentation-only: these functions never reserve actions or change combat results.
export function focusedCoopPlan(plan,rank,finisher=false,limited=false){
 const values={C:[100,0,60,130,50,85,300,130],B:[140,0,80,150,80,100,320,140],A:[170,0,100,210,110,130,340,150],S:[180,finisher&&!limited?45:0,150,250,160,160,360,170]}[rank]||[100,0,60,130,50,85,300,130];
 return [{stage:'focus',ms:rank==='S'?350:rank==='A'?320:300},...plan.map((part,i)=>({stage:part.stage,ms:limited&&!['contact','damage','restore'].includes(part.stage)?Math.round(values[i]*.7):values[i]}))];
}
export function focusStudent(shell,playerId,kind){if(!shell)return; shell.dataset.studentFocus=String(playerId);shell.dataset.focusKind=kind;}
export function clearStudentFocus(shell){if(!shell)return;delete shell.dataset.studentFocus;delete shell.dataset.focusKind;}
export function defendingStudents(state){
 return (state.coopRound?.contributions||[]).filter(v=>v.shield>0).map(v=>({playerId:v.playerId,rank:state.actionQueue.find(a=>a.actionType==='defense'&&a.playerId===v.playerId)?.targetGrade||'C'}));
}
