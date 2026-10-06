const make=(id,name,grade,role,cost,personality,trigger,effect,value,limit,lines)=>({id,name,grade,role,hireCost:cost,recruitCost:cost,personality,trigger,supportTrigger:trigger,effect,supportEffect:effect,effectValue:value,supportValue:value,maxPerEncounter:limit,grades:['A','S'],defenseValue:value,portraitAsset:`assets/mercenaries-v35/${id}.webp`,battleAsset:`assets/mercenaries-v35/${id}.webp`,dialogue:lines[0],dialogues:lines,isCoreMercenary:false,supportPresentation:effect,description:''});
export const ExtraMercenaryData=[
 make('aiden','에이든','B','창기사',560,'먼저 길을 살피는 든든한 동료','attack','pressure',1,2,['틈을 찾았어. 네 계산을 믿을게!','단단한 갑옷에도 빈틈은 있어.']),
 make('nox','녹스','A','암살자',1450,'조용히 적의 약점을 읽는 관찰자','attack','bossDamage',4,2,['네가 만든 틈, 놓치지 않아.','큰 적일수록 정확하게.']),
 make('iris','이리스','B','약초사',520,'작은 풀 한 포기도 아끼는 치료사','defense','cleanseHeal',3,2,['독은 내가 돌볼게. 천천히 계산해.','숨을 고르고 다시 시작하자.']),
 make('tobin','토빈','B','연금술사',600,'재료를 끝까지 활용하는 호기심 많은 연구자','magic','scroll',2,2,['한 방울도 낭비하지 않을 거야!','그 계산에 내 비법을 더해 볼게.']),
 make('rafa','라파','A','격투가',1300,'단단한 적에게도 한 번 더 도전하는 승부사','attack','pressure',2,2,['균형이 무너지는 순간을 노려!','좋은 답이야. 빈틈을 넓힐게!']),
 make('boris','보리스','A','대검사',1500,'오래 싸울수록 침착해지는 베테랑','attack','longDamage',4,2,['서두르지 마. 다음 일격을 준비하지.','오래 버텼군. 이제 힘을 모으자.']),
 make('lyra','리라','B','음유시인',550,'동료의 호흡을 맞추는 밝은 연주자','defense','time',3,2,['다음 계산은 조금 더 여유롭게!','우리의 박자를 맞춰 보자.']),
 make('rune','룬','A','룬술사',1350,'복잡한 문양을 차분히 풀어내는 학자','defense','runeGuard',3,2,['어지러운 마력은 내가 정리할게.','문양 너머의 숫자를 믿어.']),
 make('faye','페이','B','사냥꾼',580,'여러 적의 움직임을 한눈에 보는 길잡이','attack','multi',2,3,['뒤쪽의 적은 내게 맡겨!','함께 둘러싸이지 않도록 하자.']),
 make('vero','베로','A','마법기사',1400,'마법과 방패의 균형을 중시하는 기사','magic','scrollGuard',2,2,['마법을 펼쳐. 나는 방패를 들게.','공격 뒤의 빈틈도 지켜 줄게.']),
 make('sol','솔','S','원소술사',2800,'뜨거운 마력 속에서도 평온한 조율자','magic','cooling',2,2,['불꽃의 흐름을 가라앉히겠어.','정확한 답이 원소를 이끌어.']),
 make('mirin','미린','S','수호술사',2700,'위기의 순간까지 동료 곁을 지키는 수호자','defense','crisisGuard',6,1,['아직 끝나지 않았어. 내가 지킬게.','위기일수록 네 판단을 믿어.'])
];
const descriptions={pressure:'보스에게 A/S 공격 성공 시 BREAK 압박 지원',bossDamage:'보스에게 A/S 공격 성공 시 추가 피해 +4',cleanseHeal:'방어 A/S 성공 시 독 해제 · HP +3',scroll:'S 두루마리 효과 +2',longDamage:'3턴 이후 공격 A/S 성공 시 추가 피해 +4',time:'방어 A/S 성공 시 다음 계산 시간 +3초',runeGuard:'방어 A/S 성공 시 방어막 +3 · 화상 해제',multi:'다중 적에게 A/S 공격 성공 시 뒤쪽 적 추가 피해 +2',scrollGuard:'S 두루마리 효과 +2 · 방어막 +2',cooling:'S 두루마리 효과 +2 · 광산 열기 -1',crisisGuard:'HP 35% 이하에서 방어 A/S 성공 시 방어막 +6'};
for(const m of ExtraMercenaryData)m.description=descriptions[m.effect]+` · 전투당 ${m.maxPerEncounter}회`;
