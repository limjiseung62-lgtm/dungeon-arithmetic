import {livingEnemies,syncEncounter} from './EncounterData.js';
import {bossDamage,pressureBoss} from './BossBattleSystem.js';
export function weaponCounter(s,enemy,absorbed){
 const c=s.battleContext,attacks=Object.values(s.stats?.attack||{}).reduce((a,b)=>a+b,0);if(c?.mode!=='rpg'||c.weaponType!=='SWORD'||!c.weaponId||attacks===0||!enemy||enemy.hp<=0||absorbed<=0||!s.actionQueue.some(a=>a.actionType==='defense'&&['A','S'].includes(a.targetGrade)))return null;
 const value=Math.min(enemy.hp,bossDamage(enemy,c.weaponId==='eclipse_blade'?3:c.weaponId==='steel_sword'?2:1));if(value<=0)return null;enemy.hp-=value;s.totalDamage+=value;syncEncounter(s);return {value,enemyId:enemy.id,label:'검의 반격'};
}
export function weaponFollowup(s,enemy,action){
 const c=s.battleContext;if(c?.mode!=='rpg'||!c.weaponId||!enemy||action.weaponApplied)return null;
 action.weaponApplied=true;const grade=action.targetGrade,type=c.weaponType;
 if(type==='SWORD'&&grade==='S'&&enemy.hp>0){const broke=pressureBoss(enemy,'B');if(broke)action.bossBreak=true;return {type,label:'검의 균형 · BREAK 압박',value:.25};}
 if(type==='GREATSWORD'&&grade==='S'){const secondary=livingEnemies(s).find(e=>e.id!==enemy.id);if(!secondary)return null;const value=Math.min(secondary.hp,bossDamage(secondary,3));if(value<=0)return null;secondary.hp-=value;s.totalDamage+=value;syncEncounter(s);return {type,label:'대검 광역 참격',enemyId:secondary.id,value};}
 if(type==='DAGGER'&&['A','S'].includes(grade)&&enemy.hp>0&&(enemy.boss?.breakTurns||enemy.elite?.breakTurns)){const value=Math.min(enemy.hp,bossDamage(enemy,3));if(value<=0)return null;enemy.hp-=value;s.totalDamage+=value;syncEncounter(s);return {type,label:'단검 약점 연격',enemyId:enemy.id,value};}
 return null;
}
