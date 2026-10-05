import {preparedCanyon} from './canyon-fixture.mjs';
export function preparedCastle(level=12){const v=preparedCanyon(level),r=v.r,p=r.data.progress;p.clearedDungeons.push('sky-canyon');p.campaign.dragonDefeated=true;r.finishDragonSeal();r.finishCastleOpening();r.save();return v;}
export function enterCastle(index=0){const v=preparedCastle();v.r.enterDungeon('demon-castle');v.r.run.nextEncounter=index;return {...v,...v.r.createBattle()};}
