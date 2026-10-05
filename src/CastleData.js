const rows=[['royalGuard','마왕의 근위병',145,12,3,['royalGuard','none']],['abyssMage','심연 마도사',115,9,1,['abyssCurse','none']],['sealGuardian','봉인 수호자',140,9,2,['sealBarrier','none','none']]];
export const CastleMonsterData=rows.map(([id,name,hp,attack,armor,specials])=>{const line=text=>({text,speaker:name,duration:1500,voiceAsset:null});return {id,name,hp,attack,armor,specials,boss:false,subtitle:'마왕의 성 · 왕좌를 지키는 정예',dialogues:{encounter:line('왕좌에 도달할 자격을 증명해라.'),attack:line('물러서라!'),hit:line('정확한 계산…!'),blocked:line('내 마법을 막았군.'),lowHP:line('아직 지켜야 할 것이 있다.'),defeat:line('왕좌로… 가라.'),special:Object.fromEntries(specials.map(k=>[k,line('왕의 수호를 위하여!')]))}};});
export const CastleProfiles=CastleMonsterData.map(m=>({id:m.id,hp:Array(4).fill(m.hp),attack:Array(4).fill(m.attack),attackPattern:[0,2,0],specials:m.specials}));
const enemy=(type,hpModifier=1,attackModifier=.7)=>({type,hpModifier,attackModifier});
export const CastleDungeon={id:'demon-castle',name:'마왕의 성',recommendedLevel:12,description:'제3막 · 여섯 전투, 봉인의 방, 그리고 왕좌의 문. 배운 전략과 준비한 장비로 왕좌까지 도달하세요.',clearReward:{exp:320,gold:350},encounters:[
 {id:'castle-gate',name:'성문',mechanics:['morale'],enemies:[enemy('demonSoldier',.65,.55),enemy('demonCommander',.7,.55),enemy('darkArcher',.65,.55)]},
 {id:'castle-black',name:'검은 회랑',mechanics:['morale','flight'],enemies:[enemy('demonCommander',.65,.5),enemy('dragonGuard',.65,.5),enemy('darkPriest',.65,.5)]},
 {id:'castle-illusion',name:'환영의 회랑',mechanics:['chaos'],enemies:[enemy('illusionist',.65,.5),enemy('bookSpirit',.65,.5),enemy('abyssMage',.7,.55)]},
 {id:'castle-forge',name:'마력 용광로',mechanics:['heat'],enemies:[enemy('royalGuard',.7,.5),enemy('fireScorpion',.6,.5),enemy('sealGuardian',.65,.5)]},
 {id:'castle-dragon',name:'용의 전당',mechanics:['flight'],enemies:[enemy('fireWyvern',.7,.55),enemy('dragonGuard',.65,.5),enemy('sealGuardian',.7,.55)]},
 {id:'castle-throne',name:'왕좌의 수호자',mechanics:[],enemies:[enemy('royalGuard',.8,.65),enemy('abyssMage',.8,.6),enemy('sealGuardian',.8,.6)]}
]};
export const inCastle=s=>s?.battleContext?.mode==='rpg'&&s.battleContext.dungeonId==='demon-castle';
export const castleMechanic=(s,key)=>inCastle(s)&&s.encounter?.mechanics?.includes(key);
