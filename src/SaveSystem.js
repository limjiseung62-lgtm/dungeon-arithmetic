import {RPGConfig,RPGDungeonData,nextLevelExp} from './RPGConfig.js';
import {validateName} from './CharacterSystem.js';
import {ScrollData,ScrollConfig} from './ScrollData.js';
const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export function migrateSave(value){if(value?.saveVersion===0)return {...value,saveVersion:1,character:{...value.character,equipment:{weapon:null,armor:null,accessory:null},inventory:{items:[],materials:[]}}};return value;}
export function validateSave(raw){
 const data=migrateSave(raw);if(data?.saveVersion!==RPGConfig.saveVersion)throw new Error('지원하지 않는 저장 버전입니다.');
 if(!data.meta||typeof data.meta.createdAt!=='string'||typeof data.meta.updatedAt!=='string')throw new Error('저장 정보가 올바르지 않습니다.');
 const c=data.character,p=data.progress;if(!c||!p||validateName(c.name)!==c.name)throw new Error('캐릭터 기록이 올바르지 않습니다.');
 for(const [key,min,max]of [['level',1,RPGConfig.maxLevel],['exp',0,1e9],['maxHP',1,10000],['hp',0,c.maxHP],['attack',1,1000],['defense',0,1000],['gold',0,1e9]])if(!integer(c[key],min,max))throw new Error('캐릭터 능력치 기록이 올바르지 않습니다.');
 if(c.level<RPGConfig.maxLevel&&c.exp>=nextLevelExp(c.level))throw new Error('경험치 기록이 올바르지 않습니다.');
 if(!Array.isArray(c.scrolls)||c.scrolls.length>Object.keys(ScrollData).length||new Set(c.scrolls.map(s=>s.type)).size!==c.scrolls.length||c.scrolls.some(s=>!ScrollData[s.type]||!integer(s.uses,1,ScrollConfig.maxUses)))throw new Error('두루마리 기록이 올바르지 않습니다.');
 if(!Array.isArray(p.clearedDungeons)||p.clearedDungeons.some(id=>id!==RPGDungeonData.id))throw new Error('던전 기록이 올바르지 않습니다.');
 for(const stats of [p.stats,p.run?.stats].filter(Boolean)){for(const key of ['turns','blocks','scrolls'])if(!integer(stats[key],0,1e9))throw new Error('전투 기록이 올바르지 않습니다.');for(const side of ['attack','defense'])for(const grade of ['S','A','B','C'])if(!integer(stats[side]?.[grade],0,1e9))throw new Error('전투 기록이 올바르지 않습니다.');}
 const run=p.run;if(run){if(typeof run.id!=='string'||run.id.length>100||run.dungeonId!==RPGDungeonData.id||!integer(run.nextEncounter,0,RPGDungeonData.encounters.length)||!['active','clear','defeat'].includes(run.status)||!Array.isArray(run.completed)||run.completed.some(i=>!integer(i,0,RPGDungeonData.encounters.length-1))||new Set(run.completed).size!==run.completed.length)throw new Error('던전 진행 기록이 올바르지 않습니다.');
  if(run.status==='clear'&&(run.nextEncounter!==RPGDungeonData.encounters.length||!run.clearBonusGranted))throw new Error('클리어 기록이 올바르지 않습니다.');
  const loot=run.pendingLoot;if(loot&&(!integer(loot.encounterIndex,0,RPGDungeonData.encounters.length-1)||!Array.isArray(loot.candidates)||loot.candidates.length!==3||new Set(loot.candidates).size!==3||loot.candidates.some(id=>!ScrollData[id])||typeof loot.chosen!=='boolean'))throw new Error('전리품 기록이 올바르지 않습니다.');
  if(loot){const r=loot.receipt,u=r?.levelUp;if(!r||!Array.isArray(r.enemyNames)||r.enemyNames.some(n=>typeof n!=='string'||n.length>100)||typeof r.final!=='boolean'||!u||!integer(u.from,1,RPGConfig.maxLevel)||!integer(u.to,u.from,RPGConfig.maxLevel)||['reward','bonus'].some(k=>!integer(r[k]?.exp,0,1e9)||!integer(r[k]?.gold,0,1e9))||['maxHP','attack','defense'].some(k=>!integer(u[k],0,10000))||loot.chosen&&!loot.candidates.includes(loot.type))throw new Error('보상 기록이 올바르지 않습니다.');}

 }
 return structuredClone(data);
}
export class SaveSystem{
 constructor(storage=null){this.storage=storage;}
 load(){
  if(!this.storage)return {status:'unavailable',data:null,message:'이 브라우저에서 저장 공간을 사용할 수 없어요. 이 모험은 창을 닫으면 사라집니다.'};
  let raw,backup;try{raw=this.storage.getItem(RPGConfig.saveKey);backup=this.storage.getItem(RPGConfig.backupKey);}catch{return {status:'unavailable',data:null,message:'저장 공간에 접근할 수 없어요. 이 모험은 창을 닫으면 사라집니다.'};}
  if(!raw&&!backup)return {status:'empty',data:null,message:''};
  try{const parsed=JSON.parse(raw);if(parsed?.saveVersion>RPGConfig.saveVersion)return {status:'newer',data:null,message:'더 최신 버전의 모험 기록이 있어요. 원래 기록을 보존했습니다.'};return {status:'ready',data:validateSave(parsed),message:''};}catch{}
  try{return {status:'recovered',data:validateSave(JSON.parse(backup)),message:'손상된 기록 대신 이전 자동 저장을 불러왔어요.'};}catch{return {status:'invalid',data:null,message:'모험 기록을 읽지 못했어요. 기존 기록을 보존했습니다. 새 모험은 확인 후 시작할 수 있어요.'};}
 }
 save(data){
  if(!this.storage)return {ok:false,message:'저장 공간을 사용할 수 없어 현재 모험이 저장되지 않았어요.'};
  try{const checked=validateSave(data),json=JSON.stringify(checked),previous=this.storage.getItem(RPGConfig.saveKey);if(previous){try{validateSave(JSON.parse(previous));this.storage.setItem(RPGConfig.backupKey,previous);}catch{}}
   this.storage.setItem(RPGConfig.saveKey,json);return {ok:true,message:'모험을 저장했습니다.'};
  }catch{return {ok:false,message:'모험을 저장하지 못했어요. 저장 공간 설정을 확인하고 이 창을 유지해 주세요.'};}
 }
}
