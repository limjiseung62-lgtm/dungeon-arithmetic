import {MonsterVisualBounds} from './MonsterVisualBounds.js';
// Camera presets are read by the renderer only; no fields enter SaveData.
const small=new Set(['goblin','vineSlime','mushroomSpirit','fireImp','bookSpirit','dragonLizard']);
const large=new Set(['spider','magmaGuard','demonCommander','dragonGuard','royalGuard','sealGuardian']);
const bosses={
 golem:{sizeClass:'COLOSSAL',height:1.36,top:.06,center:.45,attackPoints:[[.51,.21],[.51,.34],[.25,.4],[.68,.49]],closeUpScale:1.1,attackCameraOffset:16,breakCameraOffset:9},
 treeGuardian:{sizeClass:'BOSS',height:1.12,top:.06,center:.46,attackPoints:[[.51,.2],[.5,.35],[.27,.43],[.67,.53]],closeUpScale:1.1,attackCameraOffset:12,breakCameraOffset:7},
 flameGiant:{sizeClass:'COLOSSAL',height:1.5,top:.06,center:.45,attackPoints:[[.53,.17],[.51,.29],[.31,.37],[.64,.47]],closeUpScale:1.08,attackCameraOffset:18,breakCameraOffset:10},
 darkKnight:{sizeClass:'BOSS',height:1.18,top:.06,center:.46,attackPoints:[[.51,.18],[.5,.33],[.29,.43],[.66,.52]],closeUpScale:1.12,attackCameraOffset:14,breakCameraOffset:8},
 chaosMage:{sizeClass:'BOSS',height:1.08,top:.06,center:.46,attackPoints:[[.52,.2],[.5,.37],[.29,.46],[.68,.55]],closeUpScale:1.1,attackCameraOffset:10,breakCameraOffset:6},
 dragonGuardian:{sizeClass:'COLOSSAL',height:1.4,top:.06,center:.45,attackPoints:[[.51,.18],[.62,.31],[.29,.36],[.5,.48]],closeUpScale:1.08,attackCameraOffset:20,breakCameraOffset:12},
 demonKing:{sizeClass:'BOSS',height:1.27,top:.06,center:.46,attackPoints:[[.3,.24],[.52,.31],[.35,.43],[.7,.35]],closeUpScale:1.1,attackCameraOffset:14,breakCameraOffset:8},
};
export const MonsterPresentationData=Object.fromEntries(Object.keys(MonsterVisualBounds).map(id=>{const sizeClass=small.has(id)?'SMALL':large.has(id)?'LARGE':'MEDIUM',height=sizeClass==='SMALL'?.5:sizeClass==='LARGE'?.7:.6;return [id,{id,sizeClass,height,top:.81-height,center:.5,closeUpScale:1.14,attackCameraOffset:8,breakCameraOffset:5,attackPoints:[[.5,.22],[.44,.42],[.66,.55],[.36,.68]],...bosses[id],art:MonsterVisualBounds[id]}];}));
export const presentationFor=id=>MonsterPresentationData[id]||MonsterPresentationData.skeleton;
