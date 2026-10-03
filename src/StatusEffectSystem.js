import {GameConfig as config} from './GameConfig.js';
import {takeDamage} from './DefenseSystem.js';
export const StatusRules={
 poison:{stack:false,maxStack:1,duration:3,refresh:true,dispellable:true},
 steal:{stack:false,maxStack:1,duration:1,refresh:true,dispellable:true,minimumSeconds:30},
 web:{stack:true,maxStack:'players-1',duration:1,refresh:true,dispellable:true},
 stone:{stack:true,maxStack:'players-1',duration:1,refresh:true,dispellable:true},
 curse:{stack:false,maxStack:1,duration:1,refresh:true,dispellable:true},
 shift:{stack:false,maxStack:1,duration:1,refresh:false,dispellable:true},
};
export function applyStatus(s,sp,intent){
 if(sp==='steal'){s.stolen=true;s.stolenDuration=Math.max(StatusRules.steal.minimumSeconds,Math.min(s.stolenDuration||60,intent.seconds||45));}
 if(sp==='poison')s.hero.poison=StatusRules.poison.duration;
 if(sp==='web'||sp==='stone'){
  const list=s.nextBlockedList|| (s.nextBlocked?[s.nextBlocked]:[]);
  for(let i=0;i<(intent.locks||1)&&list.length<Math.max(0,s.players-1);i++){const slot=(intent.slot+i)%s.players;if(!list.some(b=>b.slot===slot))list.push({slot,type:sp});}
  s.nextBlockedList=list;s.nextBlocked=list[0]||null;
 }
 if(sp==='curse')s.curse=true;
 if(sp==='shift'&&!s.shifted){s.shifted=true;for(const t of s.targets)t.position=(t.position+1)%4;}
}
export function cleanseStatuses(s){for(const [id,rule]of Object.entries(StatusRules)){if(!rule.dispellable)continue;if(id==='poison')s.hero.poison=0;else if(id==='web'||id==='stone'){s.blocked=null;s.nextBlocked=null;s.blockedList=[];s.nextBlockedList=[];}else if(id==='steal'){s.stolen=false;s.stolenDuration=null;}else if(id==='shift')s.shifted=false;else s[id]=false;}}
export function tickPoison(state){if(!state.hero.poison)return null;state.hero.poison--;return takeDamage(state,config.poisonDamage);}
