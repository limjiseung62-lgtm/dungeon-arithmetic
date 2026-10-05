import {CanyonProfiles} from './CanyonData.js';
import {ChaosProfiles} from './ChaosData.js';
import {FortressProfiles} from './FortressData.js';
import {MineProfiles} from './MineMonsterData.js';
import {ForestProfiles} from './ForestMonsterData.js';
// Deterministic party profiles; columns are 1 / 2 / 3 / 4 local players.
export const BalanceProfiles=[
 {id:'skeleton',hp:[100,145,190,230],attack:[6,7,8,8],attackPattern:[0],specials:['none']},
 {id:'goblin',hp:[115,185,250,320],attack:[12,20,27,32],attackPattern:[0,4,0],specials:['steal','none','steal']},
 {id:'orc',hp:[145,215,290,370],attack:[14,23,31,38],attackPattern:[0,6,0,4],specials:['curse','none','curse']},
 {id:'spider',hp:[125,245,330,380],attack:[16,27,36,44],attackPattern:[0,6,2,8],specials:['poison','web']},
 {id:'golem',hp:[140,260,350,410],attack:[19,31,42,52],attackPattern:[0,10,4,12],specials:['shift','stone']},
];
export function encounterStats(index,players=4,turn=1){
 const profile=BalanceProfiles[index]||[...ForestProfiles,...MineProfiles,...FortressProfiles,...ChaosProfiles,...CanyonProfiles][index-BalanceProfiles.length];if(!profile)throw new Error('알 수 없는 몬스터');
 const count=Math.max(1,Math.min(4,Math.trunc(players)||1)),slot=count-1,step=Math.max(0,turn-1);
 return {hp:profile.hp[slot],attack:profile.attack[slot]+Math.round(profile.attackPattern[step%profile.attackPattern.length]*[.35,.55,.8,1][slot]),special:profile.specials[step%profile.specials.length]};
}
