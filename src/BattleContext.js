import {GameConfig} from './GameConfig.js';
import {EncounterData} from './EncounterData.js';
export function createClassContext(){return {mode:'class',heroMaxHP:GameConfig.heroHP,attackBonus:0,defenseMitigation:0,maxMitigationRatio:0,encounters:EncounterData};}
export const contextOf=s=>s?.battleContext||createClassContext();
export const heroMaxHP=s=>contextOf(s).heroMaxHP;
export const battleEncounters=s=>contextOf(s).encounters;
export function attackDamage(s,grade,armor=0){const c=contextOf(s);return Math.max(1,Math.round((GameConfig.attack[grade]+(c.attackBonus||0)+(c.attackGradeBonus?.(grade)||0)+(c.weaponGradeBonus?.(grade)||0)-armor)*(c.coop?1+(s.coopRun?.buffs.attack||0):1)));}
export function mitigateAttack(s,incoming){const c=contextOf(s),reduction=Math.min(c.defenseMitigation||0,Math.floor(incoming*(c.maxMitigationRatio||0)));return Math.max(incoming>0?1:0,incoming-reduction);}
