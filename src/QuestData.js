export const QuestConfig={maxActive:3};
const q=(id,name,description,type,target,filter,reward,difficulty='보통',dungeon='old-prison')=>({id,name,description,type,target,filter,reward,difficulty,dungeon});
export const QuestData=[
 q('skeleton-clean','스켈레톤 청소','문지기를 정리하고 안전한 길을 만들어요.','KILL_MONSTER',5,{monster:'skeleton'},{exp:60,gold:80}),
 q('goblin-hunt','고블린 소탕','시간을 훔치는 도적을 물리쳐요.','KILL_MONSTER',5,{monster:'goblin'},{exp:80,gold:110}),
 q('brain-power','두뇌 풀가동','공격 A 또는 S 목표를 해결해요.','ATTACK_GRADE_SUCCESS',5,{grades:['A','S']},{exp:45,gold:65},'쉬움'),
 q('perfect-math','최고의 계산','공격 S로 정확한 검격을 날려요.','ATTACK_GRADE_SUCCESS',3,{grades:['S']},{exp:55,gold:75}),
 q('shield-practice','방패 훈련','방어 A 또는 S로 방어막을 만들어요.','DEFENSE_GRADE_SUCCESS',5,{grades:['A','S']},{exp:45,gold:65},'쉬움'),
 q('iron-guardian','철벽의 수호자','방어 S로 실제 특수능력을 3번 막아요.','BLOCK_SPECIAL',3,{}, {exp:80,gold:90,equipment:'guardian_charm'},'어려움','any'),
 q('magic-study','마법 연구','서로 다른 두루마리 3종을 사용해요.','USE_DIFFERENT_SCROLLS',3,{}, {exp:70,gold:80,scroll:'heal'},'보통','any'),
 q('safe-return','무사 귀환','HP 절반 이상으로 던전을 클리어해요.','CLEAR_WITH_HP',1,{hpRatio:.5},{exp:60,gold:80,scroll:'shield'},'보통','any'),
 q('first-adventure','첫 번째 모험','오래된 지하감옥을 클리어하고 보고해요.','CLEAR_DUNGEON',1,{}, {exp:60,gold:120},'쉬움'),
 {...q('forest-road','숲으로 가는 길','첫 번째 모험 보고 후, 두루마리를 사용해 길을 열어요.','USE_SCROLL',1,{}, {exp:40,gold:70,unlock:'cursed-forest'},'보통'),prerequisites:['first-adventure']},
];
export const questById=id=>QuestData.find(q=>q.id===id);
// Additional quest kinds can be used by data without changing the battle core.
export const QuestTypes=['KILL_MONSTER','CLEAR_DUNGEON','ATTACK_GRADE_SUCCESS','DEFENSE_GRADE_SUCCESS','BLOCK_SPECIAL','USE_SCROLL','USE_DIFFERENT_SCROLLS','CLEAR_WITH_HP','CLEAR_WITHOUT_DEFEAT'];
