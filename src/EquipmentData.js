import {LegendaryData} from './LegendaryData.js';
export const RarityNames={COMMON:'일반',UNCOMMON:'고급',RARE:'희귀',EPIC:'영웅',LEGENDARY:'전설'};
export const EquipmentData=[
 {id:'old_sword',name:'낡은 검',type:'weapon',rarity:'COMMON',buyPrice:100,sellPrice:50,icon:'⚔️',description:'공격력 +2',statModifiers:{attack:2},specialEffects:{}},
 {id:'steel_sword',name:'강철검',type:'weapon',rarity:'UNCOMMON',buyPrice:220,sellPrice:110,icon:'🗡️',description:'공격력 +4',statModifiers:{attack:4},specialEffects:{}},
 {id:'rogue_dagger',name:'도적의 단검',type:'weapon',rarity:'RARE',buyPrice:380,sellPrice:190,icon:'🔪',description:'공격력 +3 · C/B 검격 강화',statModifiers:{attack:3},specialEffects:{effectType:'ATTACK_GRADE_BONUS',trigger:['C','B'],value:1}},
 {id:'sage_staff',name:'현자의 지팡이',type:'weapon',rarity:'EPIC',buyPrice:650,sellPrice:325,icon:'🪄',description:'공격력 +3 · S 스크롤 강화',statModifiers:{attack:3},specialEffects:{effectType:'SCROLL_POWER_BONUS',trigger:'S',value:2}},
 {id:'leather_armor',name:'가죽 갑옷',type:'armor',rarity:'COMMON',buyPrice:120,sellPrice:60,icon:'🥋',description:'최대 HP +5',statModifiers:{maxHP:5},specialEffects:{}},
 {id:'iron_armor',name:'철 갑옷',type:'armor',rarity:'UNCOMMON',buyPrice:260,sellPrice:130,icon:'🛡️',description:'최대 HP +10 · 방어력 +1',statModifiers:{maxHP:10,defense:1},specialEffects:{}},
 {id:'guardian_armor',name:'수호자의 갑옷',type:'armor',rarity:'RARE',buyPrice:440,sellPrice:220,icon:'🏰',description:'방어력 +2 · A/S 방어막 강화',statModifiers:{defense:2},specialEffects:{effectType:'DEFENSE_GRADE_BONUS',trigger:['A','S'],value:3}},
 {id:'mage_armor',name:'마법 갑옷',type:'armor',rarity:'EPIC',buyPrice:700,sellPrice:350,icon:'🧙',description:'최대 HP +15 · S 방어막 강화',statModifiers:{maxHP:15},specialEffects:{effectType:'DEFENSE_GRADE_BONUS',trigger:'S',value:5}},
 {id:'power_ring',name:'힘의 반지',type:'accessory',rarity:'COMMON',buyPrice:140,sellPrice:70,icon:'💍',description:'공격력 +1',statModifiers:{attack:1},specialEffects:{}},
 {id:'life_necklace',name:'생명의 목걸이',type:'accessory',rarity:'UNCOMMON',buyPrice:240,sellPrice:120,icon:'📿',description:'최대 HP +8',statModifiers:{maxHP:8},specialEffects:{}},
 {id:'guardian_charm',name:'수호자의 부적',type:'accessory',rarity:'RARE',buyPrice:400,sellPrice:200,icon:'🔰',description:'A/S 방어막 강화',statModifiers:{},specialEffects:{effectType:'DEFENSE_GRADE_BONUS',trigger:['A','S'],value:2}},
 {id:'sage_ring',name:'현자의 반지',type:'accessory',rarity:'EPIC',buyPrice:620,sellPrice:310,icon:'💠',description:'S 스크롤 강화',statModifiers:{},specialEffects:{effectType:'SCROLL_POWER_BONUS',trigger:'S',value:3}}
];
EquipmentData.push({id:'chaos_grimoire',name:'혼돈의 마도서',type:'accessory',rarity:'EPIC',bossOnly:true,buyPrice:0,sellPrice:200,description:'최대 HP +6 · 정보 교란의 목표 숫자 가림 시간을 2초 줄임 (정답과 주사위는 유지)',statModifiers:{maxHP:6},specialEffects:{effectType:'CHAOS_REVEAL',trigger:'CHAOS',value:2}},{id:'dark_greatsword',name:'흑기사의 대검',type:'weapon',rarity:'EPIC',bossOnly:true,buyPrice:0,sellPrice:200,description:'공격력 +4 · 보스 BREAK 중 A/S 공격 추가 피해 +3',statModifiers:{attack:4},specialEffects:{effectType:'BOSS_BREAK_BONUS',trigger:['A','S'],value:3}},
 {id:'golem_core_shield',name:'골렘의 핵 방패',type:'armor',rarity:'EPIC',bossOnly:true,buyPrice:0,sellPrice:200,description:'방어력 +3 · A/S 방어막 +3 · 특수기 차단은 방어 S만 가능',statModifiers:{defense:3},specialEffects:{effectType:'DEFENSE_GRADE_BONUS',trigger:['A','S'],value:3}},
 {id:'life_seed',name:'생명의 씨앗',type:'accessory',rarity:'EPIC',bossOnly:true,buyPrice:0,sellPrice:200,description:'최대 HP +10 · 전투 승리 후 HP 4 회복',statModifiers:{maxHP:10},specialEffects:{effectType:'VICTORY_HEAL',trigger:'VICTORY',value:4}},
 {id:'flame_greatsword',name:'화염 거인의 대검',type:'weapon',rarity:'EPIC',bossOnly:true,buyPrice:0,sellPrice:200,description:'공격력 +3 · A/S 공격 성공 시 화염 추가 피해 +2',statModifiers:{attack:3},specialEffects:{effectType:'ATTACK_GRADE_BONUS',trigger:['A','S'],value:2}}
);
EquipmentData.push({id:'dragon_heart',name:'용의 심장',type:'accessory',rarity:'EPIC',bossOnly:true,buyPrice:0,sellPrice:200,description:'최대 HP +8 · 공격 S 성공 시 용혈 추가 피해 +2',statModifiers:{maxHP:8},specialEffects:{effectType:'ATTACK_GRADE_BONUS',trigger:'S',value:2}});
const types={old_sword:'SWORD',steel_sword:'SWORD',rogue_dagger:'DAGGER',sage_staff:'STAFF',dark_greatsword:'GREATSWORD',flame_greatsword:'GREATSWORD'};
for(const item of EquipmentData)if(item.type==='weapon')item.weaponType=types[item.id];
EquipmentData.push(...LegendaryData);
export const equipmentById=id=>EquipmentData.find(item=>item.id===id)||null;
