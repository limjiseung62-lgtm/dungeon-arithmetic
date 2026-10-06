const weapon=(id,name,boss,dungeon,weaponType,attack,description,effects,profile)=>({id,name,type:'weapon',rarity:'LEGENDARY',bossOnly:true,buyPrice:0,sellPrice:0,weaponType,statModifiers:{attack},description,specialEffects:effects,boss,dungeon,presentationProfile:profile,asset:`assets/legendary-v35/${id}.webp`});
export const LegendaryData=[
 weapon('earth_shatterer','대지분쇄자','golem','old-prison','GREATSWORD',7,'공격력 +7 · BREAK 중 A/S 추가 피해 +6',{effectType:'BOSS_BREAK_BONUS',trigger:['A','S'],value:6},'earth'),
 weapon('worldtree_staff','세계수의 지팡이','treeGuardian','cursed-forest','STAFF',6,'공격력 +6 · S 두루마리 효과 +5',{effectType:'SCROLL_POWER_BONUS',trigger:'S',value:5},'forest'),
 weapon('inferno_blade','업화의 대검','flameGiant','burning-mine','GREATSWORD',8,'공격력 +8 · A/S 화염 추가 피해 +5',{effectType:'ATTACK_GRADE_BONUS',trigger:['A','S'],value:5},'inferno'),
 weapon('eclipse_blade','월식','darkKnight','black-fortress','SWORD',7,'공격력 +7 · A/S 검은 검기 추가 피해 +4',{effectType:'ATTACK_GRADE_BONUS',trigger:['A','S'],value:4},'eclipse'),
 weapon('chaos_staff','혼돈의 지팡이','chaosMage','chaos-tower','STAFF',6,'공격력 +6 · S 두루마리 효과 +4 · 숫자 가림 2초 감소',[{effectType:'SCROLL_POWER_BONUS',trigger:'S',value:4},{effectType:'CHAOS_REVEAL',trigger:'CHAOS',value:2}],'chaos'),
 weapon('dragon_slayer','용살검','dragonGuardian','sky-canyon','GREATSWORD',9,'공격력 +9 · BREAK 중 A/S 추가 피해 +8',{effectType:'BOSS_BREAK_BONUS',trigger:['A','S'],value:8},'dragon'),
 weapon('finale_staff','종언을 풀어낸 왕홀','demonKing','demon-throne','STAFF',8,'공격력 +8 · S 두루마리 효과 +6 · 승리 후 HP +3',[{effectType:'SCROLL_POWER_BONUS',trigger:'S',value:6},{effectType:'VICTORY_HEAL',trigger:'VICTORY',value:3}],'king')
];
export const LegendaryDropConfig=Object.freeze({chances:[.1,.15,.2,.25,1],guaranteedAt:5});
export const legendaryForBoss=id=>LegendaryData.find(item=>item.boss===id)||null;
