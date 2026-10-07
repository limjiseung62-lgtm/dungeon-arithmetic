const weapons=[['steel_sword','SWORD','검격'],['sage_staff','STAFF','마법'],['rogue_dagger','DAGGER','연속 찌르기'],['dark_greatsword','GREATSWORD','강한 내려치기']];
export function coopVisualWeapon(playerId){const [id,type,label]=weapons[playerId%weapons.length];return {id,type,label,profile:null,legendary:false,item:{name:label}};}
export function compactCoopPlan(plan,rank,finisher,limited=false){
 const timings={C:[150,0,50,130,40,85,150,170],B:[180,0,70,150,60,100,160,180],A:[230,0,100,210,90,130,190,210],S:[290,finisher&&!limited?45:0,160,250,140,180,230,240]}[rank]||[150,0,50,130,40,85,150,170];
 return plan.map((part,i)=>({stage:part.stage,ms:part.stage==='contact'?timings[i]:limited?part.stage==='damage'||part.stage==='restore'?timings[i]:Math.round(timings[i]*.7):timings[i]}));
}
export class ClassCoopPresentation{
 constructor(){this.nodes=new Set();this.animations=new Set();this.token=0;}
 clear(){this.token++;for(const a of this.animations)a.cancel();this.animations.clear();for(const n of this.nodes)n.remove();this.nodes.clear();}
 async combo(event,{wait,valid=()=>true,limited=false}={}){this.clear();const token=this.token,stage=document.querySelector('.battle-stage');if(!stage)return;const root=document.createElement('div');root.className='coop-combo-impact';root.dataset.perfect=String(event.perfect);root.dataset.limited=String(limited);root.setAttribute('aria-hidden','true');root.innerHTML='<strong>'+(event.contributors===4?'4인 협동 성공!':event.contributors>1?event.contributors+'인 협동 공격!':event.contributors===1?'한 명의 힘도 소중해요':'다음 턴에 다시 함께!')+'</strong><span>총 피해 '+(event.totalDamage||0)+(event.perfect?' · 완벽한 협동!':'')+(event.damage?' · 팀 보너스 +'+event.damage:'')+'</span>';stage.append(root);this.nodes.add(root);await wait(event.contributors?650:260);if(token===this.token&&valid())this.clear();}
}
