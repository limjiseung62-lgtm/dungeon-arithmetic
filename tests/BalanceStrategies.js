import {createState} from '../src/GameState.js';import {CombatSystem} from '../src/CombatSystem.js';import {MonsterData} from '../src/MonsterData.js';import {GameConfig as config} from '../src/GameConfig.js';import {ScrollData} from '../src/ScrollData.js';

export function chooseScroll(s){let chosen=-1,best=-Infinity;for(const [i,slot] of s.scrolls.entries()){const d=ScrollData[slot.type],value=d.heal?(s.hero.hp<80?Math.min(d.heal,config.heroHP-s.hero.hp)*1.6:0):(d.damage||0);if(value>best){best=value;chosen=i;}}if(chosen>=0)s.scrollIndex=chosen;return s.scrolls[s.scrollIndex]?ScrollData[s.scrolls[s.scrollIndex].type]:null;}
export function estimate(s,list){const m=MonsterData[s.monsterIndex],scroll=chooseScroll(s);let damage=0,shield=s.hero.shield,heal=0,blocked=false;for(const t of list){if(t.side==='attack'){damage+=Math.max(1,config.attack[t.grade]-m.armor);if(t.grade==='S'&&scroll){damage+=scroll.damage||0;heal=Math.min(scroll.heal||0,config.heroHP-s.hero.hp);}}else{shield+=config.defense[t.grade];if(t.grade==='S')blocked=true;}}const incoming=s.intent.attack+(s.hero.poison>0||(!blocked&&s.intent.special==='poison')?config.poisonDamage:0);return {damage,heal,blocked,hpLoss:Math.max(0,incoming-shield),remainingShield:Math.max(0,shield-incoming)};}
const target=(s,side,g)=>s.targets.find(t=>t.side===side&&t.grade===g&&!t.used);
export function plan(s,policy){const n=s.actionsDone.filter(x=>!x).length;if(!n)return [];chooseScroll(s);
 const priority=keys=>keys.map(([side,g])=>target(s,side,g)).filter(Boolean).slice(0,n);
 const atk=['S','A','B','C'].map(g=>['attack',g]),def=['S','A','B','C'].map(g=>['defense',g]);
 if(policy==='attack-all')return priority(atk);
 if(policy==='defense-all')return priority(def);
 if(policy==='one-defense')return priority([def[0],...atk]);
 if(policy==='balanced')return priority(n===1&&s.players===1?(s.enemyTurn%2===0?def:atk):[...def.slice(0,Math.max(1,Math.floor(n/2))),...atk]);
 if(policy==='attack-S')return priority([atk[0],def[0],atk[1],def[1]]);
 if(policy==='defense-S')return priority([def[0],atk[0],def[1],atk[1]]);
 if(s.players===1){const attack=target(s,'attack','S'),e=estimate(s,[attack]);if(e.damage>=s.monsterHP)return [attack];if(['web','stone'].includes(s.intent.special)||s.hero.hp<Math.max(50,s.intent.attack*2))return [target(s,'defense','S')];return [attack];}
 const available=s.targets.filter(t=>!t.used);let best=[],bestScore=-Infinity;
 for(let mask=1;mask<1<<available.length;mask++){const list=available.filter((_,i)=>mask>>i&1);if(list.length>n)continue;const e=estimate(s,list);const specialCost=e.blocked?0:({none:0,steal:12,curse:17,poison:12,web:23,shift:10,stone:26}[s.intent.special]);let score;
 if(e.damage>=s.monsterHP)score=10000-list.length*5-(list.some(t=>t.side==='attack'&&t.grade==='S')?1:0);
 else score=e.damage-e.hpLoss*(s.hero.hp<65?5:2.3)+e.heal*2-specialCost+Math.min(20,e.remainingShield)*.35;
 if(score>bestScore){bestScore=score;best=list;}}
 // If lethal, put plain attacks ahead of scrolls when they already finish the enemy.
 return best.sort((a,b)=>a.side==='attack'&&b.side!=='attack'?-1:a.side!=='attack'&&b.side==='attack'?1:['S','A','B','C'].indexOf(a.grade)-['S','A','B','C'].indexOf(b.grade));
}

export function simulate(players,policy,seed=1,{isolated=null,maxTurns=80,mode='sequential'}={}){
 let value=seed;const rng=()=>{value=(value*1664525+1013904223)>>>0;return value/2**32;};const s=createState(players,mode),c=new CombatSystem(s,rng);if(isolated!==null){s.monsterIndex=isolated;s.monsterHP=MonsterData[isolated].hp;}
 const turns=Array(5).fill(0);let attackActions=0,defenseActions=0,guard=0;
 while(!['clear','gameover'].includes(s.phase)&&s.stats.turns<maxTurns&&guard++<1000){
 if(s.phase==='ready'||s.phase==='enemy'){c.startTurn();turns[s.monsterIndex]++;}
 else if(s.phase==='reward'){if(isolated!==null)break;c.nextMonster();turns[s.monsterIndex]++;}
 else if(s.phase==='playing'){const list=plan(s,policy);for(const t of list){if(s.phase!=='playing')break;if(t.side==='attack')attackActions++;else defenseActions++;c.submit(t.solution.ids,t.solution.ops);}while(s.phase==='playing')c.pass();}
 else if(s.phase==='resolution')c.resolveAll();
 }
 return {players,policy,clear:s.phase==='clear'||(isolated!==null&&s.phase==='reward'),phase:s.phase,turns,total:s.stats.turns,hp:s.hero.hp,shield:s.hero.shield,attackActions,defenseActions,blocks:s.stats.blocks};
}
