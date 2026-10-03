export const ScrollConfig={rarityWeights:{common:50,uncommon:30,rare:15,heroic:5},rarityNames:{common:'일반',uncommon:'고급',rare:'희귀',heroic:'영웅'},candidateCount:3,maxUses:9,cleanseable:['poison','web','stone','curse','shift','steal']};
export const ScrollData={
 fire:{name:'화염구 두루마리',icon:'🔥',rarity:'common',role:'damage',uses:3,targetType:'SINGLE_ENEMY',damage:22,effect:'fire',sound:'fire-explosion',description:'적에게 추가 피해 22'},
 ice:{name:'얼음창 두루마리',icon:'❄',rarity:'uncommon',role:'weaken',uses:3,targetType:'SINGLE_ENEMY',damage:20,weaken:.35,effect:'ice',sound:'ice-spear',description:'피해 20 · 이번 일반 반격 35% 약화'},
 shield:{name:'마법방패 두루마리',icon:'🛡',rarity:'uncommon',role:'protect',uses:2,targetType:'SELF_TEAM',shield:36,effect:'shield',sound:'magic-shield',description:'공동 방어막 36 획득'},
 heal:{name:'치유 두루마리',icon:'♥',rarity:'rare',role:'heal',uses:1,targetType:'SELF_TEAM',heal:30,effect:'heal',sound:'healing-light',description:'공동 HP 30 회복 · 최대 HP까지'},
 lightning:{name:'연쇄번개 두루마리',icon:'⚡',rarity:'rare',role:'damage',uses:2,targetType:'RANDOM_ENEMIES',damage:26,hits:3,effect:'lightning',sound:'chain-lightning',description:'현재 적에게 번개 3회 · 총 피해 26'},
 cleanse:{name:'정화 두루마리',icon:'✧',rarity:'rare',role:'cleanse',uses:2,targetType:'ALLY_STATUS',cleanse:true,effect:'cleanse',sound:'purification',description:'독·봉쇄·저주·시간 훔치기 등 현재 상태 제거'},
 meteor:{name:'운석 두루마리',icon:'☄',rarity:'heroic',role:'damage',uses:1,targetType:'ALL_ENEMIES',damage:48,effect:'meteor',sound:'meteor-impact',description:'현재 적에게 운석 피해 48 · 1회'},
 time:{name:'시간정지 두루마리',icon:'⌛',rarity:'heroic',role:'control',uses:1,targetType:'ALL_ENEMIES',stop:true,effect:'time',sound:'time-stop',description:'이번 적의 특수기와 일반 반격 억제 · 기존 독 피해는 유지'},
};
