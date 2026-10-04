export class AnimationVariationSystem{
 constructor(rng=Math.random){this.rng=rng;this.previous=new Map();}
 choose(key,count){const old=this.previous.get(key);const options=Array.from({length:count},(_,i)=>i).filter(i=>i!==old);const value=options[Math.min(options.length-1,Math.floor(this.rng()*options.length))]??0;this.previous.set(key,value);return value;}
}
export class BattlePresentationManager{
 constructor(variations=new AnimationVariationSystem()){this.variations=variations;this.combo=0;}
 decorate(event,state){
  const result={...event};
  if(event.kind==='attack-windup'||event.kind==='attack'){result.grade=event.action?.targetGrade||'A';if(event.kind==='attack-windup')this.sword=this.variations.choose('sword',4);result.variation=this.sword??0;if(event.kind==='attack'){result.combo=++this.combo;result.finisher=state.monsterHP===0;}}
  if(event.kind==='enemy-windup')this.enemy=this.variations.choose('enemy-'+(event.monster??state.monsterIndex),3);
  if(event.kind==='enemy')result.variation=this.enemy??0;
  if(event.kind==='defense'||event.kind==='barrier')result.grade=event.action?.targetGrade||'S';
  if(event.kind==='magic')result.finisher=state.monsterHP===0;
  const enemy=state.enemies?.find(e=>e.id===(event.enemyId||event.action?.enemyId));result.bossReaction=enemy?.boss&&['attack','magic'].includes(event.kind)?state.monsterHP===0?'lethal':event.bossBreak||enemy.boss.breakTurns?'break':['A','S'].includes(event.action?.targetGrade)?'strong':'normal':null;result.enemyId=event.enemyId||event.action?.enemyId;result.monster=event.monster??enemy?.monsterIndex??state.monsterIndex;result.wounded=state.monsterHP<=state.monsterMaxHP*.5;result.intensity=Math.min(3,1+Math.floor((state.enemyTurn-1)/4));
  return result;
 }
}
