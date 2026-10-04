import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {EquipmentData} from '../src/EquipmentData.js';
import {BossLootConfig} from '../src/CollectionSystem.js';
const base='v2.7',root=process.cwd(),git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:20*1024*1024});
const old=await import('data:text/javascript;base64,'+Buffer.from(git('show',base+':src/EquipmentData.js')).toString('base64'));
assert.deepEqual(EquipmentData.slice(0,12),old.EquipmentData);
const stable=['src/RPGConfig.js','src/CombatSystem.js','src/ActionQueue.js','src/DefenseSystem.js','src/BossBattleData.js','src/BossBattleSystem.js','src/BossCheckpoint.js','src/BalanceSystem.js','src/MonsterData.js','src/ForestMonsterData.js','src/MineMonsterData.js','src/EncounterData.js','src/MercenarySystem.js','src/MercenaryData.js','src/LootData.js','src/ExpressionEngine.js','src/TargetGenerator.js'];
for(const file of stable)assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),git('show',base+':'+file).replace(/\r\n/g,'\n'),file+' changed');
const assets=git('ls-tree','-r','--name-only',base,'assets').trim().split('\n');
for(const file of assets){const current=git('hash-object',file).trim(),original=git('rev-parse',base+':'+file).trim();assert.equal(current,original,file+' asset changed');}
const oldTests=git('ls-tree','-r','--name-only',base,'tests').trim().split('\n').filter(f=>f.endsWith('.test.mjs'));
for(const file of oldTests){const oldCount=(git('show',base+':'+file).match(/\btest\(/g)||[]).length,newCount=(fs.readFileSync(file,'utf8').match(/\btest\(/g)||[]).length;assert.ok(newCount>=oldCount,file+' tests removed');}
assert.ok(BossLootConfig.chance>=.2&&BossLootConfig.chance<=.3);assert.equal(BossLootConfig.guaranteedReplay,4);
const tags=git('show-ref','--tags').trim().split('\n').map(s=>{const [object,ref]=s.split(' ');return {ref,object};});
fs.writeFileSync('COLLECTION-INVARIANTS-v2.8.json',JSON.stringify({passed:true,base,unchangedCoreFiles:stable,unchangedOriginalEquipment:12,unchangedAssets:assets.length,allOldUnitTestFilesPreserved:oldTests.length,tagsBeforeV28:tags,dropChance:BossLootConfig.chance,pityReplayLimit:BossLootConfig.guaranteedReplay,root},null,2));
console.log('PASS existing equipment, boss/CLASS/calculation balance, '+assets.length+' old assets, all old test files and tag snapshot');
