import {encounterStats} from './BalanceSystem.js';
import {MonsterData} from './MonsterData.js';
export const SpecialNames={guard:'🌿 덩굴 갑옷 · HP 6 회복',none:'특수능력 없음',steal:'⏳ 시간 훔치기 · 다음 턴 45초',curse:'🔮 숫자 저주 · 20초 후 일부 숫자 숨김',poison:'☠ 독니 · 독 3턴',web:'🕸 거미줄 · 다음 행동 봉쇄',shift:'🪨 재조립 · 20초 후 표식 위치 변경',stone:'🪨 석화 · 다음 행동 봉쇄'};
export function nextIntent(state){const stats=encounterStats(state.monsterIndex,state.players,state.enemyTurn);return {attack:stats.attack,special:stats.special,slot:['web','stone'].includes(stats.special)?(Math.floor((state.enemyTurn-1)/2)+1)%state.players:(state.enemyTurn-1)%state.players};}
