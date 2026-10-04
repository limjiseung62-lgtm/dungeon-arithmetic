import {MonsterData} from './MonsterData.js';
import {ForestMonsterData} from './ForestMonsterData.js';
export const AllMonsterData=[...MonsterData,...ForestMonsterData];
export const monsterAt=index=>AllMonsterData[index];
