const fs=require('fs'),assert=require('assert/strict'),pw=require(process.env.USERPROFILE+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await pw.chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1280,height:900}}),errors=[],cases=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 const click=async a=>p.locator('[data-action="'+a+'"]:not([disabled])').first().click(),skip=async()=>p.locator('[data-action=presentation-skip]').evaluateAll(es=>es.forEach(e=>e.click()));
 async function prepare(boss,unique=true){
  await p.goto('http://127.0.0.1:4173/?debug=1');await p.evaluate(async({boss,unique})=>{
   localStorage.clear();localStorage.setItem('dungeon-settings',JSON.stringify({reducedMotion:true,sound:false}));
   const r=window.dungeonDebug.rpg,{characterStats}=await import('./src/RPGConfig.js');r.create('장비 검증');r.finishOpening();Object.assign(r.character,{level:10,exp:0,...characterStats(10),hp:145,gold:1000});const pr=r.data.progress;
   pr.clearedDungeons=['old-prison','cursed-forest'];pr.unlockedDungeons=['old-prison','cursed-forest','burning-mine'];pr.story.mineInvestigated=true;pr.rewardedQuests=['forest-road'];pr.questProgress['forest-road']={count:1,scrolls:[]};
   if(unique){pr.collection.bossLoot[boss]={kills:1,misses:0,acquired:false};r.enterDungeon(boss==='golem'?'old-prison':boss==='treeGuardian'?'cursed-forest':'burning-mine',boss==='golem'?'deep':undefined);r.run.nextEncounter=r.dungeon.encounters.length-1;r.run.completed=Array.from({length:r.run.nextEncounter},(_,i)=>i);}
   else{r.character.inventory.items=['golem_core_shield','life_seed','flame_greatsword'];r.equip('golem_core_shield');r.equip('life_seed');r.equip('flame_greatsword');r.enterDungeon();r.run.nextEncounter=boss==='skeleton'?0:1;}
   r.save();
  },{boss,unique});await p.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-dungeon');await click('rpg-dungeon-start');await skip();await p.waitForFunction(()=>window.dungeonDebug.timer.running);
 }
 async function solve(side,grade){
  const t=await p.evaluate(({side,grade})=>window.dungeonDebug.state.targets.find(t=>t.side===side&&t.grade===grade),{side,grade}),pad=p.locator('.input-pad[data-player="0"]');
  for(let i=0;i<t.solution.ids.length;i++){if(i)await pad.locator('[data-op="'+t.solution.ops[i-1]+'"]').click();await pad.locator('[data-dice="'+t.solution.ids[i]+'"]').click();}await pad.locator('[data-action=submit]').click();
  for(let i=0;i<200;i++){await skip();if(await p.locator('.scroll-choice-overlay [data-action=cast-choice]').count())await p.locator('.scroll-choice-overlay [data-action=cast-choice]').first().click();if(await p.locator('.target-scroll-overlay [data-action=scroll-target]').count())await p.locator('.target-scroll-overlay [data-action=scroll-target]').first().click();const phase=await p.evaluate(()=>window.dungeonDebug.state.phase);if(['reward','clear'].includes(phase)||phase==='playing'&&await p.evaluate(()=>window.dungeonDebug.timer.running))return;await p.waitForTimeout(25);}throw Error('resolution timeout');
 }
 for(const [boss,item]of [['golem','golem_core_shield'],['treeGuardian','life_seed'],['flameGiant','flame_greatsword']]){
  await prepare(boss);await p.evaluate(()=>{const d=window.dungeonDebug;d.state.enemies[0].hp=1;d.rpg.lootRng=()=>0;});await solve('attack','A');assert.ok(await p.locator('.boss-loot-discovery').count());const row=await p.evaluate(boss=>window.dungeonDebug.rpg.data.progress.collection.bossLoot[boss],boss);assert.deepEqual(row,{kills:2,misses:0,acquired:true});assert.ok(await p.evaluate(item=>window.dungeonDebug.rpg.character.inventory.items.includes(item),item));cases.push({boss,probabilityAcquisition:true,realGrade:'A'});
 }
 await prepare('skeleton',false);await p.evaluate(()=>{window.dungeonDebug.state.enemies[0].hp=1;window.dungeonDebug.state.hero.hp=80;});await solve('attack','A');
 const attack=await p.evaluate(()=>window.dungeonDebug.state.events.findLast(e=>e.kind==='attack'));assert.equal(attack.damage,37);assert.equal(await p.evaluate(()=>window.dungeonDebug.rpg.character.hp),84);
 await prepare('goblin',false);await solve('defense','A');let defense=await p.evaluate(()=>({action:window.dungeonDebug.state.events.findLast(e=>e.kind==='defense'),queue:window.dungeonDebug.state.actionQueue}));assert.equal(defense.action.shieldGain,29);assert.equal(defense.queue.some(a=>a.actionType==='block'),false);
 await prepare('goblin',false);await solve('defense','S');defense=await p.evaluate(()=>({action:window.dungeonDebug.state.events.findLast(e=>e.kind==='defense'),queue:window.dungeonDebug.state.actionQueue,events:window.dungeonDebug.state.events}));assert.equal(defense.action.shieldGain,29);assert.ok(defense.events.some(e=>e.kind==='barrier')); assert.ok(defense.events.some(e=>e.kind==='block'&&e.special==='steal'));
 // Real guild completion uses an already recorded collection without extra grinding.
 await p.evaluate(()=>{const r=window.dungeonDebug.rpg;r.run.status='defeat';r.character.hp=0;r.save();});await p.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-guild');await p.locator('[data-action=rpg-quest-accept][data-quest=collection-boss]').click();assert.ok(await p.locator('[data-action=rpg-quest-report][data-quest=collection-boss]').count());const gold=await p.evaluate(()=>window.dungeonDebug.rpg.character.gold);await p.locator('[data-action=rpg-quest-report][data-quest=collection-boss]').click();assert.equal(await p.evaluate(()=>window.dungeonDebug.rpg.character.gold),gold+60);await p.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-guild');assert.equal(await p.locator('[data-action=rpg-quest-report][data-quest=collection-boss]').count(),0);
 assert.deepEqual(errors,[]);fs.writeFileSync('COLLECTION-EFFECTS-BROWSER-v2.8.json',JSON.stringify({passed:true,cases,realGreatswordDamage:attack.damage,realSeedHeal:4,realShieldA:29,realShieldS:29,onlyDefenseSBlocksSpecial:true,realCollectionQuestReport:true,errors},null,2));await b.close();console.log('PASS actual probability drops / attack and defense equipment effects / S-only block / collection quest report');
})().catch(e=>{console.error(e);process.exit(1)});

