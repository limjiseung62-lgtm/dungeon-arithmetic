export const RarityNames={COMMON:'일반',UNCOMMON:'고급',RARE:'희귀',EPIC:'영웅'};
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
export const equipmentById=id=>EquipmentData.find(item=>item.id===id)||null;
