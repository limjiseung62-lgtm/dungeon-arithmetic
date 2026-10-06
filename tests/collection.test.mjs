import {legacyV34} from './legacy-v34-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {RPGMode} from '../src/RPGMode.js';
import {migrateSave,validateSave} from '../src/SaveSystem.js';
import {collection,discover,recordDefeat,rollBossUnique,BossLootData,BossLootConfig,collectionProgress,claimCollectionReward,CollectionRewards,dungeonCollection,registerPossessions} from '../src/CollectionSystem.js';
import {AllMonsterData} from '../src/MonsterRegistry.js';
import {EquipmentData} from '../src/EquipmentData.js';
import {equipItem,sellItem,unequipItem,finalStats,effectBonus} from '../src/EquipmentSystem.js';
import {createState} from '../src/GameState.js';
import {createRPGContext} from '../src/RPGConfig.js';
import {buyItem} from '../src/ShopSystem.js';
import {collectionHTML} from '../src/CollectionView.js';
import {MercenarySystem} from '../src/MercenarySystem.js';
import {GameConfig} from '../src/GameConfig.js';
import {deepSimulation} from './deep-balance.mjs';
const make=()=>{const records=new Map(),storage={getItem:k=>records.get(k)||null,setItem:(k,v)=>records.set(k,v)},r=new RPGMode(storage,()=>.99);r.create('수집 용사');return {r,storage};};
test('v2.7 migration preserves every old field, resources, quests, contract, run and loot',()=>{
 const {r}=make();r.character.gold=4000;r.buy('steel_sword');r.equip('steel_sword');r.buy('iron_armor');r.acceptQuest('brain-power');r.hire('sera');r.finishOpening();r.enterDungeon();r.createBattle();
 const old=legacyV34(structuredClone(r.data));delete old.progress.collection;const before=structuredClone(old),next=migrateSave(old);
 assert.deepEqual(old,before);assert.deepEqual(next.character,old.character);for(const [key,value]of Object.entries(old.progress)){if(key==='run'){for(const [field,record]of Object.entries(value))assert.deepEqual(next.progress.run[field],record,field);}else assert.deepEqual(next.progress[key],value,key);}assert.deepEqual(next.meta,old.meta);assert.deepEqual(migrateSave(next),next);assert.doesNotThrow(()=>validateSave(next));
 assert.ok(next.progress.collection.equipment.includes('steel_sword'));assert.ok(next.progress.collection.scrolls.includes('fire'));
});
test('migration infers historical discovered gear even if sold and does not invent defeat counts',()=>{
 const {r}=make();r.data.progress.lootHistory=[{id:'past',dungeonId:'old-prison',loot:{gold:15,scrolls:['ice'],equipment:['old_sword']}}];r.data.progress.clearedDungeons=['old-prison'];delete r.data.progress.collection;legacyV34(r.data);
 const migrated=migrateSave(r.data);assert.ok(migrated.progress.collection.equipment.includes('old_sword'));assert.ok(migrated.progress.collection.monsters.includes('orc'));assert.deepEqual(migrated.progress.collection.defeatCounts,{});assert.equal(migrated.progress.collection.bossLoot.golem,undefined);
});
test('legacy forest and mine clears make first v2.8 replay eligible without extra first-clear penalty',()=>{
 const {r}=make();r.data.progress.clearedDungeons=['cursed-forest','burning-mine'];delete r.data.progress.collection;legacyV34(r.data);const p=migrateSave(r.data).progress;
 assert.equal(rollBossUnique(p,'treeGuardian',()=>0),'life_seed');assert.equal(rollBossUnique(p,'flameGiant',()=>0),'flame_greatsword');
});
test('encounter registers before any kill and repeated encounter does not duplicate',()=>{
 const {r}=make();r.enterDungeon();r.createBattle();r.createBattle();assert.deepEqual(r.data.progress.collection.monsters,['skeleton']);assert.equal(r.data.progress.collection.defeatCounts.skeleton,undefined);
});
test('kill events deduplicate across actions, victory and reload',()=>{
 const {r,storage}=make();assert.ok(recordDefeat(r.data.progress,'skeleton','kill-one'));assert.equal(recordDefeat(r.data.progress,'skeleton','kill-one'),false);r.save();r.load();assert.equal(recordDefeat(r.data.progress,'skeleton','kill-one'),false);assert.ok(recordDefeat(r.data.progress,'skeleton','kill-two'));assert.equal(collection(r.data.progress).defeatCounts.skeleton,2);assert.ok(storage);
});
test('buy registers and selling never removes discoveries',()=>{
 const {r}=make();r.character.gold=500;r.buy('old_sword');r.sell('old_sword');r.save();r.load();assert.ok(collection(r.data.progress).equipment.includes('old_sword'));assert.equal(r.character.inventory.items.length,0);
});
test('scroll acquisition criterion registers starting and newly selected scrolls',()=>{
 const {r}=make();assert.deepEqual(collection(r.data.progress).scrolls,['fire']);r.character.scrolls.push({type:'heal',uses:1});r.save();r.character.scrolls=[];r.save();r.load();assert.deepEqual(collection(r.data.progress).scrolls,['fire','heal']);
});
for(const b of BossLootData){
 test(b.boss+' first defeat grants only normal loot and no unique RNG roll',()=>{const {r}=make();assert.equal(rollBossUnique(r.data.progress,b.boss,()=>{throw Error('first-clear roll')}),null);assert.equal(collection(r.data.progress).bossLoot[b.boss].kills,1);assert.equal(collection(r.data.progress).bossLoot[b.boss].misses,0);});
 test(b.boss+' 25% boundary excludes exact .25 and includes .249',()=>{const {r}=make();rollBossUnique(r.data.progress,b.boss);assert.equal(rollBossUnique(r.data.progress,b.boss,()=>.25),null);assert.equal(rollBossUnique(r.data.progress,b.boss,()=>.249),b.item);assert.equal(collection(r.data.progress).bossLoot[b.boss].misses,0);});
 test(b.boss+' pity persists after misses and guarantees fifth total kill',()=>{
  const {r,storage}=make();rollBossUnique(r.data.progress,b.boss);for(let i=0;i<3;i++)assert.equal(rollBossUnique(r.data.progress,b.boss,()=>.99),null);r.save();const restored=new RPGMode(storage);assert.equal(restored.load().status,'ready');assert.equal(collection(restored.data.progress).bossLoot[b.boss].misses,3);assert.equal(rollBossUnique(restored.data.progress,b.boss,()=>{throw Error('pity RNG')}),b.item);const state=collection(restored.data.progress).bossLoot[b.boss];assert.deepEqual(state,{kills:5,misses:0,acquired:true});
 });
 test(b.boss+' never drops again after sale, prevents unique gold farming',()=>{const {r}=make();rollBossUnique(r.data.progress,b.boss);assert.equal(rollBossUnique(r.data.progress,b.boss,()=>0),b.item);r.character.inventory.items.push(b.item);assert.ok(sellItem(r.character,b.item).ok);for(let i=0;i<10;i++)assert.equal(rollBossUnique(r.data.progress,b.boss,()=>{throw Error('already-acquired RNG')}),null);assert.equal(collection(r.data.progress).equipment.filter(id=>id===b.item).length,1);});
 test(b.item+' reuses equipment slot and can unequip without stat accumulation',()=>{const {r}=make();r.character.inventory.items.push(b.item);const base=finalStats(r.character);assert.ok(equipItem(r.character,b.item).ok);assert.notDeepEqual(finalStats(r.character),base);assert.ok(unequipItem(r.character,EquipmentData.find(e=>e.id===b.item).type).ok);assert.deepEqual(finalStats(r.character),base);});
 test(b.item+' cannot be bought from any shop',()=>{const {r}=make();r.character.gold=10000;assert.equal(buyItem(r.character,b.item).ok,false);assert.equal(r.character.gold,10000);});
}
test('shield bonus only A/S, never turns A into special blocking',()=>{const {r}=make();r.character.inventory.items.push('golem_core_shield');equipItem(r.character,'golem_core_shield');const ctx=createRPGContext(r.character);assert.equal(finalStats(r.character).defense,8);for(const g of ['C','B'])assert.equal(ctx.defenseGradeBonus(g),0);for(const g of ['A','S'])assert.equal(ctx.defenseGradeBonus(g),3);assert.equal(ctx.specialBlock,undefined);});
test('greatsword fire bonus requires actual A/S success and remains RPG only',()=>{const {r}=make();r.character.inventory.items.push('flame_greatsword');equipItem(r.character,'flame_greatsword');const ctx=createRPGContext(r.character);assert.equal(finalStats(r.character).attack,13);assert.equal(ctx.attackGradeBonus('B'),0);assert.equal(ctx.attackGradeBonus('A'),2);assert.equal(ctx.attackGradeBonus('S'),2);const s=createState(1,'sequential');assert.equal(s.battleContext?.attackGradeBonus,undefined);});
test('seed heals four only on committed victory; caps max and cannot duplicate receipt',()=>{
 const {r}=make();r.character.inventory.items.push('life_seed');equipItem(r.character,'life_seed');assert.equal(r.character.maxHP,110);r.character.hp=70;r.enterDungeon();const {state}=r.createBattle();state.hero.hp=70;state.enemies.forEach(e=>e.hp=0);state.phase='reward';state.lootCandidates=['fire','ice','heal'];const receipt=r.awardBattle(state);assert.equal(receipt.victoryHeal,4);assert.equal(r.character.hp,74);assert.equal(r.awardBattle(state),false);assert.equal(r.character.hp,74);
});
test('seed stacks conservatively with Sera and never exceeds max HP',()=>{
 const {r}=make();r.character.gold=4000;r.character.inventory.items.push('life_seed');r.equip('life_seed');r.hire('sera');r.enterDungeon();const {state}=r.createBattle(),merc=new MercenarySystem(r.data,r.run);state.hero.hp=90;
 merc.support({kind:'attack',action:{targetGrade:'A',playerId:0}},state);merc.support({kind:'victory'},state);assert.equal(state.hero.hp,95);state.enemies.forEach(e=>e.hp=0);state.phase='reward';state.lootCandidates=['fire','ice','heal'];assert.equal(r.awardBattle(state).victoryHeal,4);assert.equal(r.character.hp,99);assert.equal(effectBonus(r.character,'VICTORY_HEAL','VICTORY'),4);
});
test('collection totals include 15 monsters, 15 gear, 9 scrolls and 3 boss relic entries',()=>{const {r}=make();assert.deepEqual(collectionProgress(r.data.progress).totals,{monsters:34,equipment:25,scrolls:9,bossLoot:6});assert.equal(collectionProgress(r.data.progress).total,74);});
test('discovery refuses invalid types and IDs without modifying progress',()=>{const {r}=make(),before=structuredClone(collection(r.data.progress));assert.equal(discover(r.data.progress,'equipment','invalid'),false);assert.equal(discover(r.data.progress,'invalid','skeleton'),false);assert.deepEqual(collection(r.data.progress),before);});
for(const reward of CollectionRewards)test(reward.id+' milestone claim is one-time through reload',()=>{
 const {r}=make();for(const m of AllMonsterData)discover(r.data.progress,'monsters',m.id);for(const e of EquipmentData)discover(r.data.progress,'equipment',e.id);
 assert.ok(r.claimCollection(reward.id).ok);const before=structuredClone(r.character);r.load();for(let i=0;i<3;i++)assert.equal(r.claimCollection(reward.id).ok,false);assert.deepEqual(r.character,before);
});
test('milestones cannot be claimed before threshold or during dungeon',()=>{const {r}=make();assert.equal(claimCollectionReward(r.data,'monsters-5').ok,false);for(const m of AllMonsterData)discover(r.data.progress,'monsters',m.id);r.enterDungeon();assert.equal(r.claimCollection('monsters-5').ok,false);});
for(const [id,category,ids]of [['collection-monsters','monsters',AllMonsterData.slice(0,10).map(m=>m.id)],['collection-equipment','equipment',EquipmentData.slice(0,10).map(e=>e.id)],['collection-boss','equipment',['life_seed']]])test(id+' honors prior collection, manual report and duplicate reward protection',()=>{
 const {r}=make();for(const item of ids)discover(r.data.progress,category,item);assert.ok(r.acceptQuest(id).ok);assert.ok(r.data.progress.completedQuests.includes(id));assert.ok(r.reportQuest(id).ok);const character=structuredClone(r.character);assert.equal(r.reportQuest(id).ok,false);assert.deepEqual(r.character,character);
});
test('hidden entries contain no actual title, artwork or boss strategy until discovery',()=>{const {r}=make();let html=collectionHTML(r,'','');assert.ok(!html.includes('data-art="golem"'));assert.ok(!html.includes('움직이는 석갑'));assert.ok(html.includes('???'));discover(r.data.progress,'monsters','golem');html=collectionHTML(r,'','');assert.match(html,/data-art="golem"/);assert.match(html,/움직이는 석갑/);});
test('dungeon progress shows five original types including optional spider/golem route',()=>{const {r}=make();const v=dungeonCollection(r.data.progress,r.dungeon);assert.equal(v.monsterTotal,5);assert.equal(v.boss.item,'golem_core_shield');assert.equal(v.bossFound,false);});
test('deep replay only unlocks after first clear, retains original three-story encounters',()=>{const {r}=make();assert.equal(r.enterDungeon('old-prison','deep'),false);assert.equal(r.dungeon.encounters.at(-1).enemies[0].type,'orc');r.data.progress.clearedDungeons.push('old-prison');assert.ok(r.enterDungeon('old-prison','deep'));assert.equal(r.dungeon.encounters.length,3);assert.equal(r.dungeon.encounters.at(-1).enemies[0].type,'golem');assert.doesNotThrow(()=>validateSave(r.data));});
test('malformed duplicate discoveries, counts and pity reject corrupt saves',()=>{for(const mutate of [c=>c.monsters=['skeleton','skeleton'],c=>c.defeatCounts={skeleton:-1},c=>c.bossLoot={golem:{kills:2,misses:99,acquired:false}},c=>c.claimedCollectionRewards=['unknown']]){const {r}=make();mutate(collection(r.data.progress));assert.throws(()=>validateSave(r.data),/도감/);}});
for(const grade of ['A','S'])test('real shield '+grade+' input gets +3 while only S queues special block',()=>{
 const {r}=make();r.character.inventory.items.push('golem_core_shield');r.equip('golem_core_shield');r.enterDungeon();const {state,combat}=r.createBattle(),t=state.targets.find(t=>t.side==='defense'&&t.grade===grade);combat.submit(t.solution.ids,t.solution.ops);
 assert.equal(state.actionQueue.find(a=>a.actionType==='defense').shieldGain,GameConfig.defense[grade]+3);assert.equal(state.actionQueue.some(a=>a.actionType==='block'),grade==='S');
});
for(const grade of ['B','A','S'])test('real greatsword '+grade+' input adds fire damage only for A/S',()=>{
 const {r}=make();r.character.inventory.items.push('flame_greatsword');r.equip('flame_greatsword');r.enterDungeon();const {state,combat}=r.createBattle(),t=state.targets.find(t=>t.side==='attack'&&t.grade===grade);combat.submit(t.solution.ids,t.solution.ops);
 assert.equal(state.actionQueue.find(a=>a.actionType==='attack').baseDamage,GameConfig.attack[grade]+1+(grade==='B'?0:4));
});
test('seed victory heals only missing HP and repeated receipt cannot heal again',()=>{
 const {r}=make();r.character.inventory.items.push('life_seed');r.equip('life_seed');r.character.hp=108;r.enterDungeon();const {state,combat}=r.createBattle();state.enemies.forEach(e=>e.hp=0);combat.win();const receipt=r.awardBattle(state);assert.equal(receipt.victoryHeal,2);assert.equal(r.character.hp,110);assert.equal(r.awardBattle(state),false);
});
test('collection migration preserves actual v2.7 boss checkpoint and pending calculations',()=>{
 const {r}=make(),p=r.data.progress;p.clearedDungeons=['old-prison'];p.unlockedDungeons.push('cursed-forest');p.rewardedQuests=['forest-road'];p.questProgress['forest-road']={count:1,scrolls:[]};r.enterDungeon('cursed-forest');r.run.nextEncounter=4;const {state}=r.createBattle();state.enemies[0].hp=45;state.hero.shield=80;r.captureBattle(state);
 const old=legacyV34(structuredClone(r.data));delete old.progress.collection;const cp=structuredClone(old.progress.run.bossCheckpoint),next=validateSave(old);assert.deepEqual(next.progress.run.bossCheckpoint,cp);assert.deepEqual(next.character,old.character);
});
for(const grade of ['A','S'])test('recommended Lv4 deep replay clears with actual '+grade+' arithmetic and no unique equipment',()=>{
 const result=deepSimulation('adaptive',1,grade,4);assert.equal(result.phase,'clear');assert.ok(result.hp>0);assert.ok(result.totalTurns<=40);
});

