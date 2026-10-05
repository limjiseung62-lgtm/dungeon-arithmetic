const rows=[['dragonLizard','용혈 도마뱀',105,9,1,['quickClaw','none']],['fireWyvern','화염 와이번',125,10,1,['smallBreath','none']],['dragonGuard','용족 수호병',135,9,3,['dragonGuard','none']],['dragonShaman','용혈 주술사',110,8,1,['dragonBlood','none']],['dragonGuardian','용의 수호자',400,13,2,['none']]];
export const CanyonMonsterData=rows.map(([id,name,hp,attack,armor,specials])=>{const line=text=>({text,speaker:name,duration:1500,voiceAsset:null});return {id,name,hp,attack,armor,specials,boss:id==='dragonGuardian',subtitle:'천공의 용암 협곡 · 마지막 봉인의 수호자',dialogues:{encounter:line(id==='dragonGuardian'?'두 봉인을 깨뜨린 인간이 너인가.':'용의 영역에 들어왔구나!'),attack:line('용혈의 힘!'),hit:line('정확한 계산이군.'),blocked:line('불길을 막아냈군!'),lowHP:line('아직 끝나지 않았다!'),defeat:line(id==='dragonGuardian'?'인간…… 네가 그분을 만날 자격이 있는지 직접 확인해 보아라.':'협곡의 바람 속으로…'),special:Object.fromEntries(['quickClaw','smallBreath','dragonGuard','dragonBlood','fireBombard','doomBreath','dragonThreat'].map(k=>[k,line('하늘과 불꽃을 지배하라!')]))}};});
export const CanyonProfiles=CanyonMonsterData.map(m=>({id:m.id,hp:Array(4).fill(m.hp),attack:Array(4).fill(m.attack),attackPattern:[0,2,0],specials:m.specials}));
export const CanyonDungeon={id:'sky-canyon',name:'천공의 용암 협곡',recommendedLevel:11,description:'제2막 최종편 · 거대한 용을 추격하며 협곡을 돌파하세요. 날개 BREAK와 브레스 예고를 관찰하고 마지막 봉인을 파괴하세요.',clearReward:{exp:300,gold:320},encounters:[
 {id:'canyon-entry',name:'협곡 입구',enemies:[{type:'dragonLizard',hpModifier:.85},{type:'dragonLizard',hpModifier:.85}]},
 {id:'canyon-ambush',name:'용의 습격',enemies:[{type:'fireWyvern'},{type:'dragonLizard',attackModifier:.85}]},
 {id:'canyon-cliff',name:'무너지는 절벽',enemies:[{type:'dragonGuard'},{type:'fireWyvern',attackModifier:.85}]},
 {id:'canyon-ruins',name:'고대 용족 유적',enemies:[{type:'dragonShaman',attackModifier:.75},{type:'dragonGuard',hpModifier:.8,attackModifier:.7},{type:'fireWyvern',hpModifier:.8,attackModifier:.7}]},
 {id:'canyon-nest',name:'용의 둥지 · 용의 수호자',enemies:[{type:'dragonGuardian'}]}
]};
export const DragonRules={flightDamage:.75,guardDamage:.75,bloodAttack:2,threatDamage:3,scrollPressure:.5,rowenPressure:.25,assistCap:2.75,groundTurns:2,breathDamage:22};
