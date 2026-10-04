import {MineMonsterData} from './MineMonsterData.js';
import {MonsterData} from './MonsterData.js';
import {ForestMonsterData} from './ForestMonsterData.js';
export const AllMonsterData=[...MonsterData,...ForestMonsterData,...MineMonsterData];
export const monsterAt=index=>AllMonsterData[index];
