export const MonsterData=[
  {id:'skeleton',name:'스켈레톤 병사',subtitle:'잊힌 문을 지키는 자',hp:230,attack:8,armor:0,specials:['none'],reward:'lightning'},
  {id:'goblin',name:'고블린 도적',subtitle:'도둑맞은 시간의 회랑',hp:320,attack:32,armor:1,specials:['steal','none','steal'],reward:'ice'},
  {id:'orc',name:'오크 주술사',subtitle:'숫자를 삼키는 안개',hp:370,attack:38,armor:2,specials:['curse','none','curse'],reward:'heal'},
  {id:'spider',name:'거대거미',subtitle:'깊은 동굴의 검은 실',hp:380,attack:44,armor:2,specials:['poison','web'],reward:'fire'},
  {id:'golem',name:'골렘',subtitle:'마지막 문 · 돌의 수호자',hp:410,attack:52,armor:5,specials:['shift','stone'],reward:'lightning'},
];

const scripts={
 skeleton:{encounter:'여기는 내가 지키는 문이다. 너희의 계산 실력을 보여라!',special:{},blocked:'그 방패… 제법이군!',attack:'내 검을 받아라!',hit:'큭! 제법 정확한 계산이군.',lowHP:'아직… 이 문을 내줄 수 없다!',defeat:'문이 열렸다… 함께 앞으로 가거라.'},
 goblin:{encounter:'크크크! 너희 시간은 내 것이다!',special:{steal:'크크크… 너희에겐 시간이 너무 많아!'},blocked:'뭐야! 시간이 잘리지 않잖아!',attack:'빈틈이다!',hit:'앗! 내 보물이!',lowHP:'이런, 도망갈 시간이 없어!',defeat:'내 시간이… 다 떨어졌잖아!'},
 orc:{encounter:'숫자의 기억을 잃어도 계산할 수 있겠느냐?',special:{curse:'숫자들아, 안개 속으로 사라져라!'},blocked:'내 저주가… 흩어졌다고?',attack:'안개 속의 일격!',hit:'감히 내 주문을!',lowHP:'주문의 힘이 약해지는군…',defeat:'너희의 기억은… 강하구나.'},
 spider:{encounter:'내 거미줄 속에서 함께 빠져나갈 수 있을까?',special:{web:'한 명씩, 꼼짝 못 하게 묶어 주마!',poison:'독니의 힘을 맛보아라!'},blocked:'내 실과 독니가 방패에 막혔어!',attack:'날카로운 발톱!',hit:'내 거미줄이 찢어졌다!',lowHP:'둥지가 무너지고 있어!',defeat:'함께라면… 내 실도 끊을 수 있구나.'},
 golem:{encounter:'마지막 문은 내가 지킨다. 함께 도전하라.',special:{shift:'대지를 울려 숫자의 자리를 바꾸겠다!',stone:'움직임을 돌 속에 가두겠다!'},blocked:'그 방패는… 돌보다 단단하군.',attack:'대지의 일격!',hit:'내 돌갑옷에 금이 갔다!',lowHP:'마지막 문이… 흔들린다!',defeat:'너희의 협력이 문을 열었다. 앞으로 가라.'}
};
for(const monster of MonsterData){const data=scripts[monster.id],line=(text,event)=>({text,voiceAsset:null,duration:1700,speaker:monster.name,event});monster.dialogues={};for(const key of ['encounter','blocked','attack','hit','lowHP','defeat'])monster.dialogues[key]=line(data[key],key);monster.dialogues.special=Object.fromEntries(Object.entries(data.special).map(([key,text])=>[key,line(text,key)]));}
