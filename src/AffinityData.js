export const AffinityConfig={trustedAt:3,progressCap:6,clearPoints:{'demon-throne':3,'old-prison':2,'cursed-forest':3,'burning-mine':3,'black-fortress':3,'chaos-tower':3,'sky-canyon':3,'demon-castle':3},bossBonus:1,repeatPoints:1};
export const RelationshipNames=['낯선 동료','믿을 수 있는 동료','진정한 동료'];
const story=(id,theme,opening,background,ending,departures,start,finish,skill,skillText)=>({id,theme,chapters:[opening,background,ending],departures,start,finish,skill,skillText});
export const CompanionStories={
 rowen:story('rowen','한 발에 담긴 책임','로웬은 웃으며 활시위를 확인한다. “계약이니까 최선을 다하지!”','“예전에 중요한 화살을 놓쳤어. 친구를 위험하게 만들었지. 자신 있는 척하지만 아직 그 순간이 무서워.”','실패를 숨기는 대신 동료를 믿기로 했다. 마왕군의 검은 표식이 그날의 적에게도 있었다.',
 ['계약이니까 최선을 다하지.','오늘도 같이 가는군. 이번에도 잘 부탁해.','네가 어디로 가든 내 화살이 함께할 거야.'],
 ['이번엔 혼자 증명하려 하지 않을게.','골렘의 석갑을 함께 공략하자. A/S 공격으로 기회를 만들면 내가 뒤를 맡을게.','S로 맞히면 내 결정적인 화살도 보게 될 거야. 실패해도 다시 도전하면 돼.'],
 ['이번엔 놓치지 않았어. 아니, 우리가 놓치지 않은 거야.','한 발로 모두를 해결할 필요는 없었네. 너를 믿으면 되는 거였어.'],
 '관통 화살','공격 S 화살 +7 · 다른 적에게 관통 피해 3, 단일 보스에는 약점 압력 +0.25'),
 bram:story('bram','방패가 지키는 것','브람은 방패의 작은 흠집을 쓸어 본다. “네 판단을 믿겠다.”','“지키던 마을을 잃었다. 그 후로 방패를 내려놓지 못했지. 모든 공격을 막아야 한다고 생각했다.”','방패는 혼자 버티는 벽이 아니라 다시 일어설 시간을 만드는 약속이 되었다. 적의 휘장은 마왕군 간부를 가리킨다.',
 ['좋은 판단을 부탁한다. 뒤는 내가 맡지.','네가 준비할 시간을 지켜 주겠다.','네가 앞으로 나아간다면 내 방패도 함께한다.'],
 ['골렘의 강타는 과거의 포성을 떠올리게 하는군.','A/S 방어로 버틸 순간을 만들자. 특수기 차단은 여전히 방어 S가 필요하다.'],
 ['지킨다는 건 모든 짐을 혼자 짊어지는 뜻이 아니었군.','네가 다시 나아갈 수 있다면, 내 방패는 제 역할을 한 것이다.'],
 '최후의 방벽','방어 S 방어막 +8 · 이번 턴 다음 강한 일반 반격 피해 3 감소, 최대 3회'),
 sera:story('sera','포기하지 않는 작은 빛','세라는 등불을 감싸 쥔다. “모험을 마치면 상처를 살펴드릴게요.”','“모두를 구할 수는 없었어요. 그 기억 때문에 빛을 켜는 손이 떨릴 때도 있어요. 그래도 지금 곁의 사람을 포기하고 싶지 않아요.”','세라는 실패의 기억과 함께 걷기로 한다. 숲을 비틀었던 마력이 누군가의 오래된 기억에 반응했다.',
 ['무사히 돌아오는 것이 가장 중요해요.','숲의 생명력이 뒤틀리고 있어요. 함께 돌봐요.','당신이 지키려는 마음에 제 빛도 보탤게요.'],
 ['독이 스며든 곳에도 작은 생명은 남아 있어요.','공격과 방어를 두 번 이상 성공시키고, HP를 25% 이상 남겨 돌아와요. 무리하면 다시 준비해도 돼요.'],
 ['모든 상처를 지우지는 못해도, 지금의 빛을 꺼뜨리지는 않겠어요.','당신과 함께라면 다시 손을 내밀 수 있어요.'],
 '생명의 기도','승리 회복 +15 · HP 20% 이하에서 계산 성공 시 긴급 회복 6, 던전당 1회 · 부활 없음'),
 luna:story('luna','금지된 마력을 읽는 용기','루나는 빛나는 봉인을 들여다본다. “마법도 결국 질서를 가진 힘이야.”','“마왕의 마력에는 낯익은 흔적이 있어. 금지된 연구에서 본 것과 같아. 진실을 알면 두려워질까 봐 멈췄었지.”','봉인은 명령이 아니라 두 세계 사이의 길을 감추고 있었다. 루나는 답을 서두르지 않고 다음 흔적을 함께 찾기로 한다.',
 ['좋아. 마법은 내가 살펴볼게.','이번 마력은 조심해서 다루자. 네 계산을 믿어.','모르는 답도 함께 찾아가면 돼.'],
 ['숲의 유적에 금지된 연구의 흔적이 있어.','공격 S로 두루마리를 실제 사용하고 전투를 마치자. 보유 두루마리를 먼저 확인해 줘.'],
 ['이 마력은 누군가를 연결하려 했던 것 같아. 아직 결론은 이르겠지.','혼자 품던 비밀을 함께 조사해 줘서 고마워.'],
 '마력 공명','공격 S로 사용한 두루마리: 피해 +8, 회복·방어막 +9 · 전투당 2회'),
 kain:story('kain','패배를 넘어 함께 걷기','카인은 검을 닦는다. “중요한 순간에는 정확히 판단해라.”','“마왕군 간부에게 패배했다. 그 뒤로 강해지는 것만 생각했지. 검을 휘두를 이유를 잊을 만큼.”','카인은 다시 패배를 마주할 수 있게 된다. 불길 너머의 간부가 영웅의 검보다 모험가의 선택을 두려워했다.',
 ['네 계산이 검의 길을 정한다.','이번에는 네 판단도 내 힘의 일부다.','앞길에 무엇이 있든 함께 넘어가자.'],
 ['불길은 나를 쓰러뜨렸던 적을 닮았군.','화염 거인의 핵 노출 때 A/S 공격으로 BREAK를 만들자. 힘만으로 밀어붙이지 않겠다.'],
 ['패배를 이기는 건 더 큰 힘만이 아니었군.','네가 열어 준 순간에, 내 검도 앞으로 나아간다.'],
 '일섬','공격 S 기본 지원 +13 · 보스 BREAK 중에만 추가 4, 전투당 2회'),
 elia:story('elia','봉인된 기억의 약속','엘리아는 용사를 오래 바라본다. “이 세계에는 보이는 것보다 오래된 이야기가 있지.”','“네가 온 곳과 이 세계는 완전히 떨어져 있지 않단다. 오래전 그 사이에 약속이 있었지. 지금은 기억의 문이 닫혀 있다.”','기억의 조각에는 교실의 창과 마왕의 성이 함께 비쳤다. 엘리아는 다음 여정에서 약속의 의미를 말해 주겠다고 한다.',
 ['눈앞의 답부터 차근차근 찾으렴.','네 선택이 오래된 봉인을 흔드는구나.','이제 너와 함께 그 기억의 문을 열 때가 가까워졌다.'],
 ['광산의 돌에 봉인된 기억이 남아 있구나.','공격 또는 방어 S를 두 번 성공시키고 흔적을 지켜내렴. 정답을 대신 알려줄 수는 없단다.'],
 ['두 세계 사이의 약속은 아직 끝나지 않았단다. 마왕도 그 안에 있지.','다음 길에서는 숨겨 둔 기억을 함께 마주하자.'],
 '현자의 선택','공격 S 지원 +11 / 방어 S 지원 +13 · 전투당 합계 3회 · 보스 행동의 짧은 힌트')
};
export const PersonalQuestData=[
 {id:'personal-rowen',name:'단 한 발의 기회',mercenaryId:'rowen',dungeon:'old-prison',description:'로웬과 골렘에게 A/S 공격 2회 성공 후 승리해요.',condition:'attack',needed:2,encounter:{id:'rowen-trial',name:'단 한 발의 기회 · 돌의 수호자',enemies:[{type:'golem',hpModifier:.9,attackModifier:.85}]}},
 {id:'personal-bram',name:'무너지지 않는 방패',mercenaryId:'bram',dungeon:'old-prison',description:'브람과 A/S 방어 2회 성공 후 골렘을 물리쳐요.',condition:'defense',needed:2,encounter:{id:'bram-trial',name:'무너지지 않는 방패 · 골렘의 강타',enemies:[{type:'golem',attackModifier:1}]}},
 {id:'personal-sera',name:'꺼지지 않는 빛',mercenaryId:'sera',dungeon:'cursed-forest',description:'세라와 계산 2회 성공, HP 25% 이상으로 독의 숲을 돌파해요.',condition:'calculation',needed:2,minHP:.25,encounter:{id:'sera-trial',name:'꺼지지 않는 빛 · 뒤틀린 숲',enemies:[{type:'mushroomSpirit',hpModifier:.9,attackModifier:.8},{type:'shadowWolf',hpModifier:.8,attackModifier:.7}]}},
 {id:'personal-luna',name:'금지된 마법의 흔적',mercenaryId:'luna',dungeon:'cursed-forest',description:'루나와 두루마리를 실제 사용한 후 유적을 지켜내요.',condition:'scroll',needed:1,encounter:{id:'luna-trial',name:'금지된 마법의 흔적 · 유적의 봉인',enemies:[{type:'forestSpirit'},{type:'mushroomSpirit',hpModifier:.7,attackModifier:.65}]}},
 {id:'personal-kain',name:'패배를 넘어',mercenaryId:'kain',dungeon:'burning-mine',description:'카인과 화염 거인의 BREAK를 만든 뒤 승리해요.',condition:'break',needed:1,encounter:{id:'kain-trial',name:'패배를 넘어 · 불길의 재대결',enemies:[{type:'flameGiant',attackModifier:.8}]}},
 {id:'personal-elia',name:'봉인된 기억',mercenaryId:'elia',dungeon:'burning-mine',description:'엘리아와 공격/방어 S 2회 성공 후 기억의 흔적을 지켜요.',condition:'perfect',needed:2,encounter:{id:'elia-trial',name:'봉인된 기억 · 마력의 흔적',enemies:[{type:'magmaGuard',hpModifier:.8,attackModifier:.75},{type:'fireScorpion',hpModifier:.8,attackModifier:.7}]}}
];
export const personalQuestById=id=>PersonalQuestData.find(q=>q.id===id);
export const CompanionSupportLines={
 rowen:['이번엔 믿고 맡겨 줘!','함께 만든 기회를 놓치지 않을게!'],
 bram:['네가 나아갈 시간을 지키겠다.','함께라면 이 방패는 무너지지 않는다.'],
 sera:['지금 곁의 빛을 포기하지 않을게요.','당신의 마음에 제 기도를 보탤게요.'],
 luna:['함께 읽으니 마력의 흐름이 보여!','모르는 힘도 이제 함께 다룰 수 있어.'],
 kain:['네 판단이 내 검을 이끌었다.','이번 검은 너와 함께 앞으로 나아간다.'],
 elia:['네 선택이 기억의 문을 흔드는구나.','기억 너머의 길도 함께 찾으렴.']
};
export const CompanionLines={
 low:['조심해! 지금은 방어를 준비하자.','숨을 고르고 다음 판단을 해 보자.'],
 perfect:['좋아! 지금이 기회야!','정확한 계산이야. 함께 밀고 나가자!'],
 break:['약점이 열렸다! 지금을 놓치지 말자.','이 틈을 만든 건 네 판단이야!'],
 region:{sera:{'cursed-forest':'숲의 생명력이 뒤틀리고 있어요. 독을 조심해요.'},bram:{golem:'저 석갑은 단단하다. A/S 공격으로 균열을 모아라.'},luna:{flameGiant:'핵의 마력이 불안정해. 3단계 노출을 노려 보자.'}}
};
