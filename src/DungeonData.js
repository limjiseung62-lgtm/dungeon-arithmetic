import {CanyonDungeon} from './CanyonData.js';
import {ChaosDungeon} from './ChaosData.js';
import {FortressDungeon} from './FortressData.js';
import {MineDungeon} from './MineConfig.js';
import {RPGDungeonData} from './RPGConfig.js';
export const ForestDungeon={id:'cursed-forest',name:'저주받은 숲',recommendedLevel:4,description:'빛나는 버섯과 오래된 유적 사이, 숲의 마력을 되돌려 주세요.',clearReward:{exp:100,gold:160},encounters:[
 {id:'forest-gate',name:'덩굴로 덮인 길',enemies:[{type:'vineSlime'}],rewardModifier:1.1},
 {id:'forest-wolf',name:'그림자의 추격',enemies:[{type:'shadowWolf'}],rewardModifier:1.1},
 {id:'forest-mushrooms',name:'빛나는 버섯 군락',enemies:[{type:'vineSlime',hpModifier:.7,attackModifier:.65},{type:'mushroomSpirit',attackModifier:.75}],rewardModifier:1.15},
 {id:'forest-ruins',name:'잊힌 숲의 유적',enemies:[{type:'forestSpirit'}],rewardModifier:1.2},
 {id:'forest-heart',name:'숲의 심장 · 고대 나무수호자',enemies:[{type:'treeGuardian'}],rewardModifier:1.25},
]};
export const DungeonData=[RPGDungeonData,ForestDungeon,MineDungeon,FortressDungeon,ChaosDungeon,CanyonDungeon];
export const dungeonById=id=>DungeonData.find(d=>d.id===id);
