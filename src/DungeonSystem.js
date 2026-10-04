import {dungeonById} from './DungeonData.js';
export function canEnterDungeon(progress,id){return !!dungeonById(id)&&progress.unlockedDungeons.includes(id);}
export function unlockDungeon(progress,id){if(!dungeonById(id))return false;if(id==='cursed-forest'&&(!progress.clearedDungeons.includes('old-prison')||!progress.rewardedQuests.includes('forest-road')))return false;if(!progress.unlockedDungeons.includes(id))progress.unlockedDungeons.push(id);return true;}
