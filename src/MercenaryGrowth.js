import {MercenaryData,mercenaryById} from './MercenaryData.js';
export const MercenaryGrowthConfig=Object.freeze({maxLevel:30,baseBoost:1,levelStep:.025});
export const mercenaryNextExp=level=>level>=30?0:40+level*12;
export const blankMercenaryGrowth=()=>({records:Object.fromEntries(MercenaryData.map(m=>[m.id,{level:1,exp:0}])),eventIds:[]});
export function seedMercenaryGrowth(p){p.mercenaryGrowth??=blankMercenaryGrowth();return p.mercenaryGrowth;}
export function mercenaryLevel(p,id){return p.mercenaryGrowth?.records[id]?.level||1;}
export function mercenaryPower(p,id,value){return Math.max(1,Math.round(value*(MercenaryGrowthConfig.baseBoost+(mercenaryLevel(p,id)-1)*MercenaryGrowthConfig.levelStep)));}
export function awardMercenaryExp(p,ids,amount,eventId){
 if(!Number.isSafeInteger(amount)||amount<0||typeof eventId!=='string'||eventId.length>250)throw Error('동료 경험치 기록이 올바르지 않습니다.');
 const g=seedMercenaryGrowth(p);if(g.eventIds.includes(eventId))return [];
 const members=[...new Set(ids)].filter(id=>mercenaryById(id));g.eventIds.push(eventId);
 return members.map(id=>{const r=g.records[id],from=r.level;r.exp+=amount;while(r.level<30&&r.exp>=mercenaryNextExp(r.level)){r.exp-=mercenaryNextExp(r.level);r.level++;}if(r.level===30)r.exp=0;return {id,from,to:r.level,exp:amount};});
}
export function validateMercenaryGrowth(p){const g=p.mercenaryGrowth;return !!g&&Object.keys(g.records||{}).length===MercenaryData.length&&MercenaryData.every(m=>{const r=g.records[m.id];return r&&Number.isSafeInteger(r.level)&&r.level>=1&&r.level<=30&&Number.isSafeInteger(r.exp)&&r.exp>=0&&(r.level===30?r.exp===0:r.exp<mercenaryNextExp(r.level));})&&Array.isArray(g.eventIds)&&new Set(g.eventIds).size===g.eventIds.length&&g.eventIds.every(id=>typeof id==='string'&&id.length<=250);}
