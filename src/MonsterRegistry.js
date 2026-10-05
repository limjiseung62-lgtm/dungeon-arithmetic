import {ChaosMonsterData} from './ChaosData.js';
import {FortressMonsterData} from './FortressData.js';
import {MineMonsterData} from './MineMonsterData.js';
import {MonsterData} from './MonsterData.js';
import {ForestMonsterData} from './ForestMonsterData.js';
export const AllMonsterData=[...MonsterData,...ForestMonsterData,...MineMonsterData,...FortressMonsterData,...ChaosMonsterData];
export const monsterAt=index=>AllMonsterData[index];
