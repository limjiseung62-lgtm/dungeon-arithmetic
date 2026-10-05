const rows=[['bookSpirit','마도서 정령',95,8,1,['pageShuffle','none']],['illusionist','환영술사',110,9,1,['falseProphecy','none']],['chaosApostle','혼돈의 사도',115,8,2,['chaosAmplify','none']],['timeKeeper','시간 파수꾼',125,10,2,['timeWarp','none']],['chaosMage','혼돈의 마법사',330,12,2,['falseProphecy']]];
export const ChaosMonsterData=rows.map(([id,name,hp,attack,armor,specials])=>{const line=text=>({text,speaker:name,duration:1400,voiceAsset:null});return {id,name,hp,attack,armor,specials,boss:id==='chaosMage',subtitle:'현실과 환상이 교차하는 혼돈의 마탑',dialogues:{encounter:line('보이는 것 너머를 관찰해 보아라.'),attack:line('마력의 파동!'),hit:line('정확한 계산이군.'),blocked:line('마법을 막아냈군!'),lowHP:line('아직 진실을 보지 못했구나.'),defeat:line(id==='chaosMage'?'재미있군…… 하지만 진실을 알게 된 뒤에도 마왕을 쓰러뜨리고 싶을까?':'환영이 흩어진다…'),special:Object.fromEntries(['pageShuffle','falseProphecy','chaosAmplify','timeWarp','spaceCollapse','chaosExplosion'].map(k=>[k,line('현실과 환상의 경계를 넘어라!')]))}};});
export const ChaosProfiles=ChaosMonsterData.map(m=>({id:m.id,hp:Array(4).fill(m.hp),attack:Array(4).fill(m.attack),attackPattern:[0,2,0],specials:m.specials}));
export const ChaosDungeon={id:'chaos-tower',name:'혼돈의 마탑',recommendedLevel:10,description:'제2막 · 정보 교란과 관찰. 숫자의 진실은 변하지 않습니다. 마법진의 문양을 살펴 두 번째 봉인을 파괴하세요.',clearReward:{exp:260,gold:280},encounters:[
 {id:'tower-library',name:'떠다니는 서가 · 페이지 뒤섞기',enemies:[{type:'bookSpirit',hpModifier:.8},{type:'bookSpirit',hpModifier:.8}]},
 {id:'tower-mirror',name:'거울의 방 · 거짓 예언',enemies:[{type:'illusionist'},{type:'bookSpirit',hpModifier:.85}]},
 {id:'tower-crystal',name:'뒤틀린 수정 · 혼돈 증폭',enemies:[{type:'chaosApostle'},{type:'illusionist',attackModifier:.85}]},
 {id:'tower-clock',name:'시간의 회랑 · 우선순위',enemies:[{type:'timeKeeper',attackModifier:.85},{type:'chaosApostle',hpModifier:.8,attackModifier:.7},{type:'bookSpirit',hpModifier:.7,attackModifier:.65}]},
 {id:'tower-seal',name:'진실의 정점 · 혼돈의 마법사',enemies:[{type:'chaosMage'}]}
]};
