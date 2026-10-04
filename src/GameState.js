import {createClassContext} from './BattleContext.js';
import {encounterStats} from './BalanceSystem.js';
import {GameConfig as config} from './GameConfig.js';
import {MonsterData} from './MonsterData.js';
export function createState(players=1,mode='sequential',battleContext=createClassContext()){
  return {players,mode,battleContext,phase:'ready',hero:{hp:battleContext.heroMaxHP,shield:0,poison:0},
    encounterIndex:null,encounter:null,enemies:null,choices:{},blockedList:[],nextBlockedList:[],blockReservedIds:new Set(),blockedIds:new Set(),
    monsterIndex:0,monsterHP:encounterStats(0,players).hp,monsterMaxHP:encounterStats(0,players).hp,turn:0,enemyTurn:0,
    dice:[],targets:[],player:0,blocked:null,nextBlocked:null,
    scrolls:[{type:'fire',uses:config.scrollUses}],scrollIndex:0,
    seconds:config.turnSeconds,duration:config.turnSeconds,elapsed:0,stolen:false,specialBlocked:false,
    curse:false,shifted:false,intent:null,events:[],
    actionQueue:[],actionsDone:[],resolutionIndex:0,resolutionStage:null,totalDamage:0,blockReserved:false,
    stats:{turns:0,attack:{S:0,A:0,B:0,C:0},defense:{S:0,A:0,B:0,C:0},blocks:0,scrolls:0},
  };
}
