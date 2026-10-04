import {LootTable} from './LootData.js';
import {rewardScroll} from './ScrollSystem.js';
export function rollLoot(enemies,gold,rng=Math.random){
 const result={gold,scrolls:[],equipment:[]};
 const pick=pool=>pool[Math.min(pool.length-1,Math.max(0,Math.floor(rng()*pool.length)))];
 for(const e of enemies){const t=LootTable[e.type];if(!t)continue;if(rng()<t.scrollChance)result.scrolls.push(pick(t.scrolls));if(rng()<t.equipmentChance)result.equipment.push(pick(t.equipment));}
 return result;
}
export function grantLoot(character,loot){for(const type of loot.scrolls)rewardScroll(character,type);character.inventory.items.push(...loot.equipment);}
