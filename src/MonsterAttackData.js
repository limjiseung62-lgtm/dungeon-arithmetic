const types={
 skeleton:'SLASH',goblin:'STAB',orc:'MAGIC',spider:'CLAW',golem:'HEAVY',vineSlime:'CHARGE',shadowWolf:'BITE',mushroomSpirit:'MAGIC',forestSpirit:'MAGIC',treeGuardian:'HEAVY',
 fireImp:'FIRE',lavaMiner:'HEAVY',fireScorpion:'STAB',magmaGuard:'HEAVY',flameGiant:'HEAVY',demonSoldier:'STAB',darkArcher:'RANGED',demonCommander:'SLASH',darkPriest:'MAGIC',darkKnight:'SLASH',
 bookSpirit:'MAGIC',illusionist:'MAGIC',chaosApostle:'MAGIC',timeKeeper:'MAGIC',chaosMage:'MAGIC',dragonLizard:'CLAW',fireWyvern:'CLAW',dragonGuard:'SHIELD_BASH',dragonShaman:'MAGIC',dragonGuardian:'CLAW',royalGuard:'SHIELD_BASH',abyssMage:'MAGIC',sealGuardian:'HEAVY',demonKing:'MAGIC'
};
export const EnemyArchetypes=Object.freeze({
 SLASH:{name:'검을 들어 베기',timing:[270,290,65,220,180],sound:'metal'},STAB:{name:'빈틈을 노리는 찌르기',timing:[160,170,45,140,160],sound:'fast'},
 HEAVY:{name:'무거운 내려치기',timing:[550,380,100,270,260],sound:'rock'},MAGIC:{name:'마력 집중 · 투사체',timing:[430,350,70,220,200],sound:'magic'},
 FIRE:{name:'화염 발사',timing:[300,320,70,220,190],sound:'fire'},RANGED:{name:'활시위 · 화살',timing:[320,250,55,180,170],sound:'arrow'},
 BITE:{name:'다가오는 송곳니',timing:[260,250,70,190,190],sound:'creature'},CLAW:{name:'발톱 휘두르기',timing:[290,280,70,190,180],sound:'creature'},
 CHARGE:{name:'몸을 낮추고 돌진',timing:[310,260,75,190,220],sound:'creature'},SHIELD_BASH:{name:'방패를 앞세운 충돌',timing:[380,300,90,220,230],sound:'metal'}
});
export const MonsterAttackTypes=Object.freeze(types);
export function monsterAttackSpec(type,intent={},variant=0){
 let archetype=types[type]||'SLASH';if(type==='dragonGuardian'&&variant%2===1)archetype='BITE';
 const base=EnemyArchetypes[archetype],boss=['golem','treeGuardian','flameGiant','darkKnight','chaosMage','dragonGuardian','demonKing'].includes(type),material=/flame|fire|magma|lava/i.test(type)?'ember':/golem|seal/.test(type)?'stone':/tree|vine|forest|mushroom/.test(type)?'leaf':/dragon|wyvern/i.test(type)?'scale':/king|abyss|darkPriest/i.test(type)?'void':base.sound==='metal'?'metal':'arcane';
 return {type,archetype,boss,variant:variant%2,name:base.name,material,sound:base.sound,timing:base.timing.map((ms,i)=>Math.round(ms*(boss&&i!==2?1.18:1))),intentName:intent.label||intent.name||intent.patternName||'',special:intent.special||'none'};
}
