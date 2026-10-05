import {preparedTower} from './chaos-fixture.mjs';
export function preparedCanyon(level=11){const v=preparedTower(level),r=v.r,p=r.data.progress;r.finishChaosOpening();r.investigateTower();p.clearedDungeons.push('chaos-tower');p.campaign.mageDefeated=true;r.finishChaosSeal();r.finishDragonOpening();r.investigateCanyon();r.save();return v;}
export function enterCanyon(index=0){const v=preparedCanyon();v.r.enterDungeon('sky-canyon');v.r.run.nextEncounter=index;return {...v,...v.r.createBattle()};}
