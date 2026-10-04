export const RPGConfig={saveVersion:1,saveKey:'dungeon-rpg-adventure-save',backupKey:'dungeon-rpg-adventure-backup',maxNameLength:12,maxLevel:50,
 initial:{maxHP:100,attack:10,defense:5,gold:0,scrolls:[{type:'fire',uses:3}]},
 growth:{maxHP:5,attack:2,defense:1},experience:[50,80,120,170,230],experienceStep:70,
 attackBonusFactor:.5,maxAttackBonus:8,defenseFactor:.2,maxDefenseMitigation:4,maxMitigationRatio:.3,
 restoreOnClear:true,restoreOnDefeat:true,
};
export const RPGRewardData={skeleton:{exp:20,gold:15},goblin:{exp:30,gold:25},orc:{exp:45,gold:35},spider:{exp:40,gold:30},golem:{exp:60,gold:50}};
export const RPGDungeonData={id:'old-prison',name:'오래된 지하감옥',recommendedLevel:1,description:'잠긴 문 너머, 첫 모험이 기다립니다.',clearReward:{exp:50,gold:100},encounters:[
 {id:'rpg-skeleton',name:'지하감옥의 문지기',enemies:[{type:'skeleton',hpModifier:.75,attackModifier:1}],rewardModifier:1},
 {id:'rpg-goblin',name:'고블린의 경비실',enemies:[{type:'goblin',hpModifier:.8,attackModifier:.85}],rewardModifier:1},
 {id:'rpg-orc',name:'오크의 봉인실',enemies:[{type:'orc',hpModifier:.8,attackModifier:.85}],rewardModifier:1},
]};
export function nextLevelExp(level){if(level>=RPGConfig.maxLevel)return 0;return RPGConfig.experience[level-1]??RPGConfig.experience.at(-1)+(level-RPGConfig.experience.length)*RPGConfig.experienceStep;}
export function characterStats(level){const steps=level-1;return {maxHP:RPGConfig.initial.maxHP+steps*RPGConfig.growth.maxHP,attack:RPGConfig.initial.attack+steps*RPGConfig.growth.attack,defense:RPGConfig.initial.defense+steps*RPGConfig.growth.defense};}
export function createRPGContext(character){return {mode:'rpg',heroMaxHP:character.maxHP,attackBonus:Math.min(RPGConfig.maxAttackBonus,Math.max(0,Math.floor((character.attack-RPGConfig.initial.attack)*RPGConfig.attackBonusFactor))),defenseMitigation:Math.min(RPGConfig.maxDefenseMitigation,Math.floor(character.defense*RPGConfig.defenseFactor)),maxMitigationRatio:RPGConfig.maxMitigationRatio,encounters:RPGDungeonData.encounters};}
