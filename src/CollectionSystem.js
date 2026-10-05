import {AllMonsterData} from './MonsterRegistry.js';
import {EquipmentData} from './EquipmentData.js';
import {ScrollData} from './ScrollData.js';
import {DungeonData} from './DungeonData.js';
import {LootTable} from './LootData.js';
import {addGold,addExperience} from './CharacterSystem.js';
import {grantLoot} from './LootSystem.js';
export const BossLootConfig={chance:.25,guaranteedReplay:4};
export const BossLootData=[{boss:'chaosMage',item:'chaos_grimoire',dungeon:'chaos-tower'},{boss:'darkKnight',item:'dark_greatsword',dungeon:'black-fortress'},
 {boss:'golem',item:'golem_core_shield',dungeon:'old-prison'},
 {boss:'treeGuardian',item:'life_seed',dungeon:'cursed-forest'},
 {boss:'flameGiant',item:'flame_greatsword',dungeon:'burning-mine'}
];
export const CollectionRewards=[
 {id:'monsters-5',category:'monsters',target:5,label:'몬스터 5종 발견',gold:100},
 {id:'monsters-10',category:'monsters',target:10,label:'몬스터 10종 발견',exp:60},
 {id:'equipment-10',category:'equipment',target:10,label:'장비 10종 발견',gold:120},
 {id:'total-25',category:'percent',target:25,label:'전체 도감 25%',gold:80},
 {id:'total-50',category:'percent',target:50,label:'전체 도감 50%',scroll:'heal'}
];
export const blankCollection=()=>({monsters:[],equipment:[],scrolls:[],defeatCounts:{},killIds:[],bossLoot:{},claimedCollectionRewards:[]});
export function collection(p){return p.collection??=blankCollection();}
export function discover(p,category,id){
 const c=collection(p),valid=category==='monsters'?AllMonsterData.some(m=>m.id===id):category==='equipment'?EquipmentData.some(e=>e.id===id):category==='scrolls'?!!ScrollData[id]:false;
 if(!valid||c[category].includes(id))return false;c[category].push(id);return true;
}
export function registerPossessions(data){
 const changes=[],add=(category,id)=>{if(discover(data.progress,category,id))changes.push({category,id});};
 for(const id of [...data.character.inventory.items,...Object.values(data.character.equipment)])add('equipment',id);
 for(const s of data.character.scrolls)add('scrolls',s.type);
 return changes;
}
export function recordDefeat(p,type,eventId){
 const c=collection(p);if(!AllMonsterData.some(m=>m.id===type)||!eventId||c.killIds.includes(eventId))return false;
 discover(p,'monsters',type);c.killIds.push(eventId);c.defeatCounts[type]=(c.defeatCounts[type]||0)+1;return true;
}
export function rollBossUnique(p,type,rng=Math.random){
 const entry=BossLootData.find(b=>b.boss===type);if(!entry)return null;
 const c=collection(p),b=c.bossLoot[type]??={kills:0,misses:0,acquired:c.equipment.includes(entry.item)};
 b.kills++;if(c.equipment.includes(entry.item)){b.acquired=true;b.misses=0;}if(b.kills===1||b.acquired)return null;
 if(b.misses>=BossLootConfig.guaranteedReplay-1||rng()<BossLootConfig.chance){
  b.acquired=true;b.misses=0;discover(p,'equipment',entry.item);return entry.item;
 }
 b.misses++;return null;
}
export function collectionProgress(p){
 const c=collection(p),counts={monsters:c.monsters.length,equipment:c.equipment.length,scrolls:c.scrolls.length,bossLoot:BossLootData.filter(b=>c.equipment.includes(b.item)).length};
 const totals={monsters:AllMonsterData.length,equipment:EquipmentData.length,scrolls:Object.keys(ScrollData).length,bossLoot:BossLootData.length};
 const found=Object.values(counts).reduce((a,b)=>a+b,0),total=Object.values(totals).reduce((a,b)=>a+b,0);
 return {counts,totals,found,total,percent:Math.floor(found/total*100)};
}
export function claimCollectionReward(data,id){
 const reward=CollectionRewards.find(r=>r.id===id),c=collection(data.progress),v=collectionProgress(data.progress);
 if(!reward||data.progress.run||c.claimedCollectionRewards.includes(id)||(reward.category==='percent'?v.percent:v.counts[reward.category])<reward.target)return {ok:false,message:'아직 목표가 남아 있거나 이미 받은 보상이에요.'};
 c.claimedCollectionRewards.push(id);addGold(data.character,reward.gold||0);addExperience(data.character,reward.exp||0);grantLoot(data.character,{scrolls:reward.scroll?[reward.scroll]:[],equipment:[]});registerPossessions(data);
 return {ok:true,message:'수집 보상을 받았어요! '+reward.label};
}
export function seedCollection(data){
 if(data.progress.collection)return data;
 collection(data.progress);registerPossessions(data);
 for(const h of data.progress.lootHistory||[]){for(const id of h.loot.equipment)discover(data.progress,'equipment',id);for(const id of h.loot.scrolls)discover(data.progress,'scrolls',id);}
 for(const id of data.progress.clearedDungeons||[]){
  const d=DungeonData.find(d=>d.id===id);for(const e of d?.encounters||[])for(const m of e.enemies)discover(data.progress,'monsters',m.type);
  const b=BossLootData.find(b=>b.dungeon===id&&b.boss!=='golem');
  if(b)data.progress.collection.bossLoot[b.boss]={kills:Math.max(1,(data.progress.dungeonClearHistory||[]).filter(h=>h.dungeonId===id).length),misses:0,acquired:false};
 }
 return data;
}
export function dungeonCollection(p,d){
 const monsterIds=[...new Set(d.encounters.flatMap(e=>e.enemies.map(m=>m.type)))];
 if(d.id==='old-prison')monsterIds.push('spider','golem');
 const equipmentIds=[...new Set(monsterIds.flatMap(id=>LootTable[id]?.equipment||[]))],c=collection(p),boss=BossLootData.find(b=>b.dungeon===d.id);
 return {monsters:monsterIds.filter(id=>c.monsters.includes(id)).length,monsterTotal:monsterIds.length,equipment:equipmentIds.filter(id=>c.equipment.includes(id)).length,equipmentTotal:equipmentIds.length,boss,bossFound:c.equipment.includes(boss.item)};
}
export function validateCollection(p){
 const c=p.collection,validIds={monsters:AllMonsterData.map(m=>m.id),equipment:EquipmentData.map(e=>e.id),scrolls:Object.keys(ScrollData),claimedCollectionRewards:CollectionRewards.map(r=>r.id)};
 if(!c||typeof c!=='object')return false;
 for(const [key,ids]of Object.entries(validIds))if(!Array.isArray(c[key])||new Set(c[key]).size!==c[key].length||c[key].some(id=>!ids.includes(id)))return false;
 if(!Array.isArray(c.killIds)||new Set(c.killIds).size!==c.killIds.length||c.killIds.some(id=>typeof id!=='string'||id.length>250)||!c.defeatCounts||!c.bossLoot||typeof c.defeatCounts!=='object'||typeof c.bossLoot!=='object'||Array.isArray(c.defeatCounts)||Array.isArray(c.bossLoot))return false;
 const count=v=>Number.isSafeInteger(v)&&v>=0&&v<=1e9;
 if(Object.entries(c.defeatCounts).some(([id,n])=>!validIds.monsters.includes(id)||!c.monsters.includes(id)||!count(n)))return false;
 if(Object.entries(c.bossLoot).some(([id,b])=>!BossLootData.some(v=>v.boss===id)||!b||!count(b.kills)||!count(b.misses)||b.misses>=BossLootConfig.guaranteedReplay||typeof b.acquired!=='boolean'||b.acquired&&!c.equipment.includes(BossLootData.find(v=>v.boss===id).item)||b.acquired&&b.misses!==0))return false;
 return true;
}
