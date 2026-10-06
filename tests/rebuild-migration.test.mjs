import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateSave,migrateSave,SaveSystem} from '../src/SaveSystem.js';
import {RPGConfig} from '../src/RPGConfig.js';
const original=JSON.parse(readFileSync(new URL('./fixtures/v34-trained-active.json',import.meta.url)));
test('real v3.4 active save keeps resources, quests, story, six relationships and battle checkpoint exactly',()=>{
 const before=structuredClone(original),next=validateSave(original);
 assert.equal(before.saveVersion,4);assert.equal(next.saveVersion,5);
 assert.deepEqual(next.character,before.character);
 for(const key of ['story','campaign','storyCompleted','endingSeen','collection','activeQuests','completedQuests','rewardedQuests','questProgress','questEventIds','lootHistory','dungeonClearHistory','unlockedDungeons','clearedDungeons'])assert.deepEqual(next.progress[key],before.progress[key],key);
 for(const [id,record]of Object.entries(before.progress.mercenaryRelations))assert.deepEqual(next.progress.mercenaryRelations[id],record,id);
 for(const [key,value]of Object.entries(before.progress.run))assert.deepEqual(next.progress.run[key],value,key);
 assert.deepEqual(next.progress.ownedMercenaries,['rowen','bram']);assert.deepEqual(next.progress.activeParty,['rowen']);
 assert.deepEqual(next.progress.run.partyState.counts.rowen,before.progress.mercenaryContractState.counts);
 assert.deepEqual(next.progress.run.partyState.eventIds,before.progress.mercenaryContractState.eventIds);
 assert.deepEqual(migrateSave(next),next);assert.deepEqual(original,before);
});
test('first migration archives the exact old serialized save and later saves never replace it',()=>{
 const raw=JSON.stringify(original,null,1),values=new Map([[RPGConfig.saveKey,raw]]),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},system=new SaveSystem(storage),next=system.load().data;
 assert.ok(system.save(next).ok);assert.equal(values.get(RPGConfig.migrationArchiveKey),raw);
 next.character.gold++;assert.ok(system.save(next).ok);assert.equal(values.get(RPGConfig.migrationArchiveKey),raw);
 assert.equal(system.load().data.character.gold,original.character.gold+1);
});
test('archive write failure leaves the existing v3.4 save intact',()=>{
 const raw=JSON.stringify(original),values=new Map([[RPGConfig.saveKey,raw]]),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>{if(k===RPGConfig.migrationArchiveKey)throw Error('quota');values.set(k,v);}},system=new SaveSystem(storage);
 assert.equal(system.save(validateSave(original)).ok,false);assert.equal(values.get(RPGConfig.saveKey),raw);
});
test('real v3.4 completed ending retains final record, resources and active companion without reopening the story',()=>{const raw=JSON.parse(readFileSync(new URL('./fixtures/v34-ending.json',import.meta.url))),before=structuredClone(raw),next=validateSave(raw);assert.equal(next.saveVersion,5);assert.deepEqual(next.character,before.character);for(const key of ['storyCompleted','endingSeen','finalRecord','endingCompanion','campaign','collection','rewardedQuests','dungeonClearHistory','lootHistory'])assert.deepEqual(next.progress[key],before.progress[key],key);assert.equal(next.progress.storyCompleted,true);assert.equal(next.progress.endingSeen,true);assert.ok(next.progress.ownedMercenaries.includes('kain'));assert.deepEqual(next.progress.activeParty,['kain']);for(const [id,v]of Object.entries(before.progress.mercenaryRelations))assert.deepEqual(next.progress.mercenaryRelations[id],v);assert.deepEqual(migrateSave(next),next);assert.deepEqual(raw,before);});
test('recovered v3.4 backup is archived exactly before subsequent v3.5 backups replace it',()=>{const raw=JSON.stringify(original,null,2),values=new Map([[RPGConfig.saveKey,'{broken'],[RPGConfig.backupKey,raw]]),system=new SaveSystem({getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}),loaded=system.load();assert.equal(loaded.status,'recovered');assert.ok(system.save(loaded.data).ok);assert.equal(values.get(RPGConfig.migrationArchiveKey),raw);loaded.data.character.gold++;assert.ok(system.save(loaded.data).ok);assert.equal(values.get(RPGConfig.migrationArchiveKey),raw);assert.equal(system.load().data.character.gold,original.character.gold+1);});
