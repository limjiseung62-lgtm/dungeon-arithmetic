import {GameConfig} from './GameConfig.js';
import {EncounterData} from './EncounterData.js';
export function createClassContext(){return {mode:'class',heroMaxHP:GameConfig.heroHP,attackBonus:0,defenseMitigation:0,maxMitigationRatio:0,encounters:EncounterData};}
export const contextOf=s=>s?.battleContext||createClassContext();
export const heroMaxHP=s=>contextOf(s).heroMaxHP;
export const battleEncounters=s=>contextOf(s).encounters;
export function attackDamage(s,grade,armor=0){return Math.max(1,GameConfig.attack[grade]+(contextOf(s).attackBonus||0)-armor);}
export function mitigateAttack(s,incoming){const c=contextOf(s),reduction=Math.min(c.defenseMitigation||0,Math.floor(incoming*(c.maxMitigationRatio||0)));return Math.max(incoming>0?1:0,incoming-reduction);}
