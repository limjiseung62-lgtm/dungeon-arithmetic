export const RPGConfig={saveVersion:4,previousSaveVersion:3,saveKey:'dungeon-rpg-adventure-save',backupKey:'dungeon-rpg-adventure-backup',maxNameLength:12,maxLevel:50,
 initial:{maxHP:100,attack:10,defense:5,gold:0,scrolls:[{type:'fire',uses:3}]},
 growth:{maxHP:5,attack:2,defense:1},experience:[50,80,120,170,230],experienceStep:70,
 attackBonusFactor:.5,maxAttackBonus:8,defenseFactor:.2,maxDefenseMitigation:4,maxMitigationRatio:.3,
 restoreOnClear:true,restoreOnDefeat:true,
};
export const RPGRewardData={fireImp:{exp:45,gold:42},lavaMiner:{exp:65,gold:60},fireScorpion:{exp:50,gold:46},magmaGuard:{exp:80,gold:75},flameGiant:{exp:140,gold:130},skeleton:{exp:20,gold:15},goblin:{exp:30,gold:25},orc:{exp:45,gold:35},spider:{exp:40,gold:30},golem:{exp:60,gold:50},vineSlime:{exp:30,gold:28},shadowWolf:{exp:40,gold:38},mushroomSpirit:{exp:35,gold:32},forestSpirit:{exp:50,gold:45},treeGuardian:{exp:85,gold:80}};
export const RPGDungeonData={id:'old-prison',name:'오래된 지하감옥',recommendedLevel:1,description:'잠긴 문 너머, 첫 모험이 기다립니다.',clearReward:{exp:50,gold:100},encounters:[
 {id:'rpg-skeleton',name:'지하감옥의 문지기',enemies:[{type:'skeleton',hpModifier:.75,attackModifier:1}],rewardModifier:1},
 {id:'rpg-goblin',name:'고블린의 경비실',enemies:[{type:'goblin',hpModifier:.8,attackModifier:.85}],rewardModifier:1},
 {id:'rpg-orc',name:'오크의 봉인실',enemies:[{type:'orc',hpModifier:.8,attackModifier:.85}],rewardModifier:1},
]};
export function nextLevelExp(level){if(level>=RPGConfig.maxLevel)return 0;return RPGConfig.experience[level-1]??RPGConfig.experience.at(-1)+(level-RPGConfig.experience.length)*RPGConfig.experienceStep;}
export function characterStats(level){const steps=level-1;return {maxHP:RPGConfig.initial.maxHP+steps*RPGConfig.growth.maxHP,attack:RPGConfig.initial.attack+steps*RPGConfig.growth.attack,defense:RPGConfig.initial.defense+steps*RPGConfig.growth.defense};}
import {finalStats,effectBonus} from './EquipmentSystem.js';
export function createRPGContext(character,dungeon=RPGDungeonData){const hasEquipment=character.equipment&&Object.values(character.equipment).some(Boolean);const derived=finalStats(character);const levelBase=characterStats(character.level);const stats=hasEquipment?derived:{maxHP:character.maxHP!==levelBase.maxHP?character.maxHP:derived.maxHP,attack:character.attack!==levelBase.attack?character.attack:derived.attack,defense:character.defense!==levelBase.defense?character.defense:derived.defense};return {mode:'rpg',heroMaxHP:stats.maxHP,attackBonus:Math.min(RPGConfig.maxAttackBonus,Math.max(0,Math.floor((stats.attack-RPGConfig.initial.attack)*RPGConfig.attackBonusFactor))),defenseMitigation:Math.min(RPGConfig.maxDefenseMitigation,Math.floor(stats.defense*RPGConfig.defenseFactor)),defenseGradeBonus:trigger=>effectBonus(character,'DEFENSE_GRADE_BONUS',trigger),scrollPowerBonus:trigger=>effectBonus(character,'SCROLL_POWER_BONUS',trigger),attackGradeBonus:trigger=>effectBonus(character,'ATTACK_GRADE_BONUS',trigger),maxMitigationRatio:RPGConfig.maxMitigationRatio,dungeonId:dungeon.id,encounters:dungeon.encounters};}
