const fs=require('fs'),assert=require('assert/strict'),pw=require(process.env.USERPROFILE+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await pw.chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1280,height:900},hasTouch:true}),errors=[],results=[];
page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
await page.addInitScript(()=>localStorage.setItem('dungeon-settings',JSON.stringify({reducedMotion:true,sound:false})));
const click=async a=>page.locator('[data-action="'+a+'"]:not([disabled])').first().click();
const skip=async()=>page.locator('[data-action=presentation-skip]').evaluateAll(es=>es.forEach(e=>e.click()));
const data=()=>page.evaluate(()=>structuredClone(window.dungeonDebug.rpg.data));
const shot=async name=>{await page.evaluate(()=>Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));await page.screenshot({path:'preview-v28-'+name+'.png',fullPage:true});};
async function settle(){for(let i=0;i<160;i++){await skip();if(await page.locator('.scroll-choice-overlay [data-action=skip-scroll]').count())await page.locator('.scroll-choice-overlay [data-action=skip-scroll]').click();else if(await page.locator('.scroll-choice-overlay [data-action=cast-choice]').count())await page.locator('.scroll-choice-overlay [data-action=cast-choice]').first().click();if(await page.locator('.target-scroll-overlay [data-action=scroll-target]').count())await page.locator('.target-scroll-overlay [data-action=scroll-target]').first().click();const phase=await page.evaluate(()=>window.dungeonDebug.state.phase);if(['reward','clear','gameover'].includes(phase))return phase;if(phase==='playing'&&await page.evaluate(()=>window.dungeonDebug.timer.running))return phase;await page.waitForTimeout(25);}throw Error('resolution timeout');}
async function solve(grade='A'){
 await page.waitForFunction(()=>window.dungeonDebug.timer.running);const t=await page.evaluate(g=>window.dungeonDebug.state.targets.find(t=>t.side==='attack'&&t.grade===g),grade),pad=page.locator('.input-pad[data-player="0"]');
 for(let i=0;i<t.solution.ids.length;i++){if(i)await pad.locator('[data-op="'+t.solution.ops[i-1]+'"]').click();await pad.locator('[data-dice="'+t.solution.ids[i]+'"]').click();}
 await pad.locator('[data-action=submit]').click();await settle();
}
await page.goto('http://127.0.0.1:4173/?debug=1&v=2.8');await click('rpg-enter');await page.locator('#character-name').fill('도감 탐험가');await click('rpg-create-submit');await click('rpg-opening-skip');await click('rpg-collection');
assert.equal(await page.locator('.collection-entry[data-known=true]').count(),1);assert.equal(await page.locator('.collection-entry[data-known=false]').count(),65);assert.equal(await page.locator('[data-collection-id=golem] img').count(),0);await shot('hidden-book');
await page.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-dungeon');await click('rpg-dungeon-start');await skip();await page.waitForFunction(()=>window.dungeonDebug.timer.running);
assert.deepEqual((await data()).progress.collection.monsters,['skeleton']);
let turns=0;while(turns++<60){const phase=await settle();if(phase==='gameover')throw Error('first prison defeat');if(['reward','clear'].includes(phase)){await click('loot-choice');if(phase==='clear'){await click('rpg-return');if(await page.locator('.act-two-scene').count())await click('rpg-act-skip');break;}await click('next-monster');await skip();}else await solve('S');}
assert.ok(turns<60);assert.equal((await data()).progress.collection.defeatCounts.skeleton,1);await click('rpg-collection');assert.equal(await page.locator('[data-collection-id=skeleton]').getAttribute('data-known'),'true');await page.locator('[data-collection-id=skeleton] summary').click();await shot('first-discovery');
// Keep all subsequent bosses at their genuine last-hit state. Input, reward ledger,
// refresh, drops and equipment use the real application; RNG is deterministic.
await click('rpg-town');await page.evaluate(async()=>{
 const r=window.dungeonDebug.rpg,{characterStats}=await import('./src/RPGConfig.js');Object.assign(r.character,{level:10,exp:0,...characterStats(10),hp:145,gold:2000});
 const p=r.data.progress;p.clearedDungeons=['old-prison','cursed-forest'];p.unlockedDungeons=['old-prison','cursed-forest','burning-mine'];p.story.mineInvestigated=true;p.rewardedQuests=['forest-road'];p.questProgress['forest-road']={count:1,scrolls:[]};r.save();
});
for(const [boss,dungeon,item]of [['golem','old-prison','golem_core_shield'],['treeGuardian','cursed-forest','life_seed'],['flameGiant','burning-mine','flame_greatsword']]){
 const rows=[];
 for(let kill=1;kill<=5;kill++){
  await click('rpg-dungeon');
  if(boss==='golem')await click('rpg-deep-start');else await page.locator('[data-action=rpg-dungeon-start][data-dungeon="'+dungeon+'"]').click();
  await skip();await page.waitForFunction(()=>window.dungeonDebug.timer.running);
  await page.evaluate(()=>{const d=window.dungeonDebug;d.timer.stop();d.rpg.run.nextEncounter=d.rpg.dungeon.encounters.length-1;d.rpg.run.completed=Array.from({length:d.rpg.run.nextEncounter},(_,i)=>i);d.rpg.run.bossCheckpoint=null;d.rpg.lootRng=()=>.99;d.rpg.save();});
  await page.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-dungeon');await click('rpg-dungeon-start');await skip();await page.waitForFunction(()=>window.dungeonDebug.timer.running);
  assert.equal(await page.evaluate(()=>window.dungeonDebug.state.enemies[0].type),boss);
  await page.evaluate(()=>{const d=window.dungeonDebug;d.state.enemies[0].hp=1;d.state.hero.shield=0;d.rpg.lootRng=()=>.99;});
  await solve('A');await page.locator('.rpg-result').waitFor();
  const after=await data(),b=after.progress.collection.bossLoot[boss];assert.equal(b.kills,kill);assert.equal(b.acquired,kill===5);
  assert.equal(after.character.inventory.items.includes(item),kill===5);
  rows.push({kill,misses:b.misses,acquired:b.acquired,grade:'A'});
  if(kill===5){await page.waitForTimeout(750);assert.ok(await page.locator('.boss-loot-discovery').count());await shot(boss+'-loot');}
  const before=structuredClone(after.character),receipt=after.progress.run.pendingLoot.receipt;await page.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-dungeon');await click('rpg-dungeon-start');
  assert.deepEqual((await data()).character,before);assert.deepEqual((await data()).progress.run.pendingLoot.receipt,receipt);assert.equal((await data()).progress.collection.bossLoot[boss].kills,kill);
  await click('loot-choice');await click('rpg-return');if(await page.locator('.act-two-scene').count())await click('rpg-act-skip');
 }
 results.push({boss,pity:rows,actualFinalHitInput:true,receiptRefreshNoReplay:true});
 await click('rpg-inventory');await page.locator('[data-action=rpg-equip][data-item="'+item+'"]').click();assert.ok(Object.values((await data()).character.equipment).includes(item));await shot(boss+'-equipped');await click('rpg-town');
}
const effects=await page.evaluate(async()=>{const r=window.dungeonDebug.rpg,{createRPGContext}=await import('./src/RPGConfig.js'),ctx=createRPGContext(r.character);return {attackA:ctx.attackGradeBonus('A'),attackB:ctx.attackGradeBonus('B'),shieldA:ctx.defenseGradeBonus('A'),maxHP:r.character.maxHP,level:r.character.level};});assert.deepEqual(effects,{attackA:2,attackB:0,shieldA:3,maxHP:100+(effects.level-1)*5+10,level:effects.level});
// Real next victory verifies the seed's committed heal, not only its tooltip.
await click('rpg-dungeon');await page.locator('[data-action=rpg-dungeon-start][data-dungeon=old-prison]').click();await skip();await page.waitForFunction(()=>window.dungeonDebug.timer.running);
await page.evaluate(()=>{const d=window.dungeonDebug;d.state.hero.hp=80;d.state.enemies[0].hp=1;});await solve('A');assert.equal((await data()).progress.run.pendingLoot.receipt.victoryHeal,4);assert.equal((await data()).character.hp,84);
await click('loot-choice');await click('next-monster');await skip();await page.waitForFunction(()=>window.dungeonDebug.timer.running);
await page.evaluate(()=>{const d=window.dungeonDebug;d.state.hero.hp=0;d.state.phase='gameover';d.rpg.onBattleEvent({kind:'gameover'},d.state);});await page.reload();await click('rpg-enter');await click('rpg-continue');
await click('rpg-collection');await shot('progress-book');const gold=(await data()).character.gold;
for(const id of ['monsters-5','total-25']){const button=page.locator('[data-reward="'+id+'"]');if(await button.isEnabled())await button.click();}
const claimed=await data();assert.ok(claimed.character.gold>gold);await page.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-collection');assert.equal((await data()).character.gold,claimed.character.gold);assert.deepEqual((await data()).progress.collection,claimed.progress.collection);
for(const width of [390,768,1920]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width);await shot('book-'+width);}
await page.setViewportSize({width:1280,height:900});await click('rpg-town');await click('rpg-dungeon');await shot('replay-progress');assert.match(await page.locator('.dungeon-selector').innerText(),/지역 수집 기록/);assert.equal(await page.locator('[data-action=rpg-deep-start]').count(),1);
await page.goto('http://127.0.0.1:4173/dist/index.html?debug=1');await click('rpg-enter');await click('rpg-continue');await click('rpg-collection');await shot('production');assert.ok(await page.locator('[data-collection-id=life_seed] image').first().evaluate(async e=>{const i=new Image();i.src=e.getAttribute('href');await i.decode();return i.naturalWidth>0;}));
await click('title');await click('setup');await click('story');await click('start');await skip();await page.waitForFunction(()=>window.dungeonDebug.timer.running);assert.equal(await page.evaluate(()=>window.dungeonDebug.state.battleContext.mode),'class');assert.equal(await page.evaluate(()=>window.dungeonDebug.state.battleContext.attackGradeBonus),undefined);
assert.deepEqual(errors,[]);fs.writeFileSync('COLLECTION-BROWSER-RESULTS-v2.8.json',JSON.stringify({passed:true,firstPrisonFullClear:true,turns,bosses:results,effects,seedActualVictoryHeal:4,refreshPersistence:true,rewardsNoDuplicate:true,viewports:[390,768,1280,1920],production:true,classIsolation:true,errors},null,2));await browser.close();console.log('PASS v2.8 encyclopedia / actual inputs for all boss first-kill, misses, pity / equipment / heal / rewards / reload / production / CLASS');
})().catch(e=>{console.error(e);process.exit(1)});



