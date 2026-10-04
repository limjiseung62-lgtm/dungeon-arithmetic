import {MineConfig} from './MineConfig.js';
import {mineIntent} from './HeatSystem.js';
import {AllMonsterData,monsterAt} from './MonsterRegistry.js';
import {encounterStats} from './BalanceSystem.js';
// Entries can later include summon metadata; no summoning occurs in v1.2.
const enemy=(type,hp=1,attack=1,special=1)=>({type,hpModifier:hp,attackModifier:attack,specialModifier:special});
export const EncounterData=[
 {id:'entrance',name:'문지기 스켈레톤',enemies:[enemy('skeleton')],rewardModifier:1},
 {id:'twins',name:'해골 경비대',enemies:[enemy('skeleton',.65,.75),enemy('skeleton',.65,.75)],rewardModifier:1},
 {id:'ambush',name:'고블린의 매복',enemies:[enemy('goblin',.65,.70),enemy('skeleton',.65,.75)],rewardModifier:1},
 {id:'curse',name:'시간과 저주의 방',enemies:[enemy('goblin',.55,.55),enemy('orc',.65,.60)],rewardModifier:1.15},
 {id:'web',name:'독니와 시간의 방',enemies:[enemy('spider',.65,.60),enemy('goblin',.55,.55)],rewardModifier:1.15},
 {id:'boss',name:'마지막 문 · 골렘',enemies:[enemy('golem')],rewardModifier:1.25},
];
export function createEncounter(data,players,index=0){
 if(!data?.enemies?.length||data.enemies.length>3)throw new Error('적은 1~3마리여야 합니다.');
 return data.enemies.map((entry,i)=>{const monsterIndex=AllMonsterData.findIndex(m=>m.id===entry.type);if(monsterIndex<0)throw new Error('알 수 없는 몬스터');const stats=encounterStats(monsterIndex,players);const hp=Math.max(1,Math.round(stats.hp*(entry.hpModifier??1)));return {id:`${data.id||'custom'}-${index}-${i}`,monsterIndex,type:entry.type,name:monsterAt(monsterIndex).name+(data.enemies.filter(e=>e.type===entry.type).length>1?` ${String.fromCharCode(65+data.enemies.slice(0,i).filter(e=>e.type===entry.type).length)}`:''),hp,maxHP:hp,attackModifier:entry.attackModifier??1,specialModifier:entry.specialModifier??1,enrage:0,weaken:0,intent:null};});
}
export const livingEnemies=s=>(s.enemies||[]).filter(e=>e.hp>0);
export function syncEncounter(s){if(!s.enemies)return;s.monsterHP=s.enemies.reduce((n,e)=>n+e.hp,0);s.monsterMaxHP=s.enemies.reduce((n,e)=>n+e.maxHP,0);}
export function enemyIntent(s,e){const stats=encounterStats(e.monsterIndex,s.players,s.enemyTurn);const tier=e.forcedEnrage??Math.min(2,Math.floor((s.enemyTurn-1)/4));e.enrage=tier;const awakened=e.type==='treeGuardian'&&e.hp<=e.maxHP*.5;e.bossPhase=awakened?2:1;return mineIntent(s,e,{attack:Math.round((stats.attack+(awakened?4:0))*e.attackModifier),special:e.forcedSpecial??(e.specialModifier===0?'none':(awakened?(s.enemyTurn%2?'poison':'shift'):stats.special)),slot:(Math.floor((s.enemyTurn-1)/2)+1+(s.enemies?.indexOf(e)||0))%s.players,seconds:tier>0||e.specialModifier>1?30:45,locks:tier>0||e.specialModifier>1?2:1});}
export function intentText(e){const sp=e.intent?.special;const text={heatSpark:'🔥 불씨 장난 · 열기 +1 (방어 S 차단)',pickBlast:'⛏ 폭발 곡괭이 · 추가 공격 5 (방어 S 차단)',burn:'🔥 화상 독침 · 2턴 화상 (방어 S 차단)',magmaArmor:'🛡 마그마 갑옷 · 2턴 피해 35% 감소 (방어 S 차단)',flameFist:'🔥 화염 주먹 · 추가 공격 3 (방어 S 차단)',lavaSlam:`💥 용암 강타 · 추가 공격 ${MineConfig.specialDamage.lavaSlam} (방어 S 차단)`,guard:'🌿 덩굴 갑옷 · HP 6 회복 (방어 S로 차단)',none:'특수능력 없음',steal:`⏳ 시간 훔치기 · 다음 턴 ${e.intent.seconds}초`,curse:'🔮 숫자 저주 · 20초 후 숫자 숨김',poison:'☠ 독니 · 독 3턴',web:`🕸 거미줄 · 최대 ${e.intent.locks}명 봉쇄`,stone:`🪨 석화 · 최대 ${e.intent.locks}명 봉쇄`,shift:'🪨 재조립 · 20초 후 표식 이동'};return text[sp]||'';}
