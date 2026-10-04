const entries=[
 ['vineSlime','덩굴 슬라임','단단한 덩굴 방어막',72,8,2,['guard','none'],'방어막 뒤에서도 계산의 힘은 통한다!'],
 ['shadowWolf','그림자 늑대','빠른 추격과 시간 압박',80,11,0,['steal','none','steal'],'늑대보다 빠르게 판단해 보아라!'],
 ['mushroomSpirit','독버섯 정령','빛나는 포자의 독',56,8,1,['poison','none'],'빛나는 포자는 방패로 막을 수 있지!'],
 ['forestSpirit','타락한 숲의 정령','마력에 흔들리는 표식',96,10,1,['shift','none'],'숫자는 그대로, 자리를 잘 보아라!'],
 ['treeGuardian','고대 나무수호자','숲의 심장을 지키는 수호자',150,12,3,['guard','shift'],'숲의 심장을 깨울 준비가 되었느냐?'],
];
export const ForestMonsterData=entries.map(([id,name,subtitle,hp,attack,armor,specials,greeting])=>{
 const line=text=>({text,speaker:name,duration:1400,voiceAsset:null});
 return {id,name,subtitle,hp,attack,armor,specials,boss:id==='treeGuardian',dialogues:{encounter:line(greeting),blocked:line('정확한 방패가 마력을 막았구나!'),attack:line('숲의 일격!'),hit:line('정확한 계산이군!'),lowHP:line(id==='treeGuardian'?'숲의 심장아, 깨어나라!':'마력이 약해지고 있어!'),defeat:line('숲에 다시 빛이 돌아오는구나.'),special:{guard:line('덩굴 갑옷으로 상처를 회복하겠다!'),steal:line('다음 판단은 더 빠르게!'),poison:line('빛나는 포자여, 피어나라!'),shift:line('마력으로 표식의 자리를 바꾸겠다!')}}};
});
export const ForestProfiles=ForestMonsterData.map(m=>({id:m.id,hp:[m.hp,m.hp,m.hp,m.hp],attack:[m.attack,m.attack,m.attack,m.attack],attackPattern:m.id==='shadowWolf'?[0,6,3]:[0,3,0],specials:m.specials}));
