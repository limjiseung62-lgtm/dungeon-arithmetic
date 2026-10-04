export const MineConfig={thresholds:[0,3,6,9],maxHeat:12,attackBonus:[0,1,2,4],heatDamage:2,burnDuration:2,burnDamage:4,burnHotBonus:1,specialDamage:{pickBlast:5,flameFist:3,lavaSlam:5},armorTurns:2,armorReduction:.35,coreBreakDamage:24,phases:[{id:1,at:1,special:'flameFist',attackBonus:0},{id:2,at:.7,special:'lavaSlam',attackBonus:1},{id:3,at:.3,special:'lavaSlam',attackBonus:2}]};
export const MineDungeon={id:'burning-mine',name:'불타는 광산',recommendedLevel:7,description:'붉은 마력이 스며든 광산. 오래 싸울수록 열기가 높아집니다.',clearReward:{exp:160,gold:240},encounters:[
 {id:'mine-sparks',name:'갱도 입구 · 불씨의 장난',enemies:[{type:'fireImp',hpModifier:.8,attackModifier:.65},{type:'fireImp',hpModifier:.8,attackModifier:.65}]},
 {id:'mine-rail',name:'무너진 철길 · 폭발 곡괭이',enemies:[{type:'lavaMiner',attackModifier:.75},{type:'fireImp',hpModifier:.75,attackModifier:.55}]},
 {id:'mine-stingers',name:'용암 균열 · 화상 독침',enemies:[{type:'fireScorpion',hpModifier:.85,attackModifier:.65},{type:'fireScorpion',hpModifier:.85,attackModifier:.65}]},
 {id:'mine-armor',name:'용광로의 문 · 마그마 갑옷',enemies:[{type:'magmaGuard',attackModifier:.75},{type:'fireScorpion',hpModifier:.75,attackModifier:.55}]},
 {id:'mine-core',name:'광산의 심장 · 화염 거인',enemies:[{type:'flameGiant'}]},
]};
