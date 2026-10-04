const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const pw=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await pw.chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});
 page.setDefaultTimeout(15000);const frames={},errors=[],specials=new Set(),turns={};page.on('pageerror',e=>{errors.push(e.message);console.error('BROWSER ERROR',e.message)});
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const url='http://127.0.0.1:4173/?debug=1',click=async action=>page.locator(`[data-action="${action}"]:not([disabled])`).first().tap();
 const data=()=>page.evaluate(()=>structuredClone(window.dungeonDebug.rpg.data)),state=()=>page.evaluate(()=>window.dungeonDebug.state);
 const skip=async()=>{if(await page.locator('[data-action=presentation-skip]').count())await page.locator('[data-action=presentation-skip]').dispatchEvent('click');};
 const shot=async name=>page.screenshot({path:path.join(__dirname,`../preview-v22-${name}.png`),fullPage:true});
 async function frameSample(name){if(frames[name])return;const deltas=await page.evaluate(()=>new Promise(resolve=>{const samples=[];let previous=null;function sample(time){if(previous!==null)samples.push(time-previous);previous=time;if(samples.length>=45)resolve(samples);else requestAnimationFrame(sample);}requestAnimationFrame(sample);}));deltas.sort((a,b)=>a-b);frames[name]={medianMS:deltas[22],p95MS:deltas[42]};assert.ok(frames[name].p95MS<100);}
 async function quest(id,action){await page.locator(`[data-action="${action}"][data-quest="${id}"]`).tap();if(await page.locator('[data-action=rpg-level-close]').count())await page.locator('[data-action=rpg-level-close]').tap();}
 async function enter(id){await click('rpg-dungeon');await page.locator(`[data-action=rpg-dungeon-start][data-dungeon="${id}"]:not([disabled])`).first().tap();await skip();await page.waitForFunction(()=>window.dungeonDebug.timer.running);}
 async function solve(side='attack',grade='S',preferredScroll=null){
  const s=await state(),target=s.targets.find(t=>t.side===side&&t.grade===grade),root=page.locator('.input-pad[data-player="0"]');
  for(let i=0;i<target.solution.ids.length;i++){if(i)await root.locator(`[data-op="${target.solution.ops[i-1]}"]`).tap();await root.locator(`[data-dice="${target.solution.ids[i]}"]`).tap();}
  await root.locator('[data-action=submit]').tap();if(s.enemies.some(e=>e.type==='treeGuardian'))assert.equal(await page.evaluate(()=>window.dungeonDebug.audio.track),'boss-tree');
  if(await page.locator('.player-target-choice').count()){const alive=s.enemies.filter(e=>e.hp>0),e=side==='attack'?(alive.find(e=>e.type==='mushroomSpirit')||alive[0]):(alive.find(e=>e.intent.special==='poison')||alive.find(e=>e.intent.special!=='none')||alive[0]);await page.locator(`[data-action=choose-target][data-enemy="${e.id}"]`).tap();}
  await skip();
  for(let j=0;j<200;j++){
   if(await page.locator('.scroll-choice-overlay').count()){
    const ss=await state();const pick=ss.scrolls.find(x=>x.type===preferredScroll)|| (ss.hero.hp<85?ss.scrolls.find(x=>x.type==='heal'):null)||ss.scrolls.find(x=>['fire','ice','lightning','meteor','iceStorm'].includes(x.type))||ss.scrolls[0];
    await page.locator(pick?`.scroll-choice-overlay [data-type="${pick.type}"]`:'.scroll-choice-overlay [data-action=cast-skip]').first().tap();
   }
   if(await page.locator('.target-scroll-overlay').count())await page.locator('.target-scroll-overlay [data-action=scroll-target]').first().tap();
   if((await state()).phase!=='resolution')break;await page.waitForTimeout(25);
  }
  try{await page.waitForFunction(()=>window.dungeonDebug.state.phase!=='resolution')}catch(error){console.error('STUCK',JSON.stringify(await state()));await shot('failure');throw error;}const after=await state();
  for(const e of after.events)if(['guard','steal','poison','shift','block'].includes(e.kind))specials.add(e.kind);
 }
 async function finish(dungeon,adaptive=false,refreshReceipt=false){
  const counts=[],seen=new Set();let guard=0;
  while(guard++<100){
   const s=await state();assert.notEqual(s.phase,'gameover','unexpected defeat');
   if(['reward','clear'].includes(s.phase)){
    if(refreshReceipt&&!seen.has(s.encounterIndex)){
     seen.add(s.encounterIndex);const before=await data();await page.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-dungeon');await click('rpg-dungeon-start');assert.deepEqual((await data()).character,before.character);assert.deepEqual((await data()).progress.lootHistory,before.progress.lootHistory);
    }
    if(adaptive&&s.phase==='clear')await frameSample('boss-loot');
    const ss=await state(),pick=ss.lootCandidates.find(id=>id==='heal')||ss.lootCandidates.find(id=>id==='ice')||ss.lootCandidates[0];
    await page.locator(`[data-action=loot-choice][data-type="${pick}"]`).tap();
    if(s.phase==='clear'){await shot(dungeon+'-clear');break;}
    await click('next-monster');await skip();continue;
   }
   await page.waitForFunction(()=>window.dungeonDebug.timer.running);
   const ss=await state();counts[ss.encounterIndex]=(counts[ss.encounterIndex]||0)+1;
   if(adaptive&&ss.enemies.some(e=>e.type==='treeGuardian'&&e.bossPhase===2)){await frameSample('boss-phase2');await shot('boss-phase2');assert.ok(await page.locator('.treeGuardian').count());}
   if(adaptive&&ss.enemies.length===2){await frameSample('two-monsters');await shot('forest-pair');}
   const incoming=ss.enemies.filter(e=>e.hp>0).reduce((n,e)=>n+e.intent.attack,0);
   const defend=adaptive&&ss.hero.shield<incoming&&(ss.enemyTurn===1||ss.hero.hp<90||ss.enemies.some(e=>e.hp>0&&e.intent.special==='poison'));
   const p=await data(),wanted=p.progress.activeQuests.includes('magic-study')?['fire','ice','shield'].find(id=>!p.progress.questProgress['magic-study'].scrolls.includes(id)):null;
   await solve(defend?'defense':'attack','S',wanted);
  }
  assert.ok(guard<100);console.log('PASS dungeon',dungeon,counts);turns[dungeon]=counts;return await data();
 }
 // Real v2.1-shaped save, with all equipment aliases and duplicate inventory.
 const old={saveVersion:2,character:{name:'이전 모험가',level:3,exp:17,maxHP:115,hp:78,attack:14,defense:7,gold:500,scrolls:[{type:'fire',uses:2},{type:'ice',uses:1}],equipment:{weapon:'old_sword',armor:'leather_armor',accessory:null},equippedWeapon:'old_sword',equippedArmor:'leather_armor',equippedAccessory:null,inventory:{items:['steel_sword','power_ring','power_ring'],materials:[]}},progress:{clearedDungeons:['old-prison'],run:null,completedRuns:1,stats:{turns:9,blocks:1,scrolls:3,attack:{S:6,A:1,B:0,C:0},defense:{S:1,A:1,B:0,C:0}}},meta:{createdAt:'2026-10-03T01:00:00.000Z',updatedAt:'2026-10-03T02:00:00.000Z'}};
 await page.goto(url);await page.evaluate(old=>{localStorage.clear();localStorage.setItem('dungeon-rpg-adventure-save',JSON.stringify(old));},old);await page.reload();await click('rpg-enter');await click('rpg-continue');assert.deepEqual((await data()).character,old.character);assert.equal((await data()).saveVersion,4);await click('rpg-save');await page.reload();await click('rpg-enter');await click('rpg-continue');assert.deepEqual((await data()).character,old.character);console.log('PASS actual v2.1 migration with all resources, gear and duplicate inventory');
 await click('title');await click('rpg-enter');await click('rpg-new');await click('rpg-reset-confirm');await page.locator('#character-name').fill('숲 탐험가');await click('rpg-create-submit');await click('rpg-opening-skip');
 await page.evaluate(()=>{window.dungeonDebug.rpg.lootRng=()=>0;}); // deterministic drops only; no forced combat wins or resource grants.
 await click('rpg-guild');await shot('guild');for(const id of ['brain-power','perfect-math','first-adventure'])await quest(id,'rpg-quest-accept');
 assert.equal((await data()).progress.activeQuests.length,3);assert.ok(await page.locator('[data-action=rpg-quest-accept][disabled]').count());await click('rpg-town');await click('rpg-dungeon');assert.ok(await page.locator('[data-dungeon=cursed-forest][disabled]').count());await click('rpg-town');
 await enter('old-prison');await finish('prison-first',false,true);await click('rpg-return');await click('rpg-guild');
 const beforeGold=(await data()).character.gold;for(const id of ['brain-power','perfect-math','first-adventure'])await quest(id,'rpg-quest-report');assert.equal((await data()).character.gold-beforeGold,260);
 const reported=await data();await page.evaluate(()=>window.dungeonDebug.rpg.reportQuest('first-adventure'));assert.deepEqual((await data()).character,reported.character);
 await quest('forest-road','rpg-quest-accept');await quest('magic-study','rpg-quest-accept');await quest('safe-return','rpg-quest-accept');await click('rpg-town');
 // Route quest is accepted after first report, then completed during a return visit.
 await enter('old-prison');await finish('prison-route',false);await click('rpg-return');await click('rpg-guild');await quest('forest-road','rpg-quest-report');
 assert.ok((await data()).progress.unlockedDungeons.includes('cursed-forest'));
 for(const id of ['magic-study','safe-return'])if((await data()).progress.completedQuests.includes(id))await quest(id,'rpg-quest-report');
 await shot('guild-reported');await click('rpg-town');
 await click('rpg-shop-weapon');await page.locator('[data-action=rpg-buy][data-item=steel_sword]').tap();await click('rpg-town');await click('rpg-shop-armor');await page.locator('[data-action=rpg-buy][data-item=leather_armor]').tap();await click('rpg-town');await click('rpg-inventory');await page.locator('[data-action=rpg-equip][data-item=steel_sword]').first().tap();await page.locator('[data-action=rpg-equip][data-item=leather_armor]').first().tap();await click('rpg-town');
 await click('rpg-guild');await quest('iron-guardian','rpg-quest-accept');await click('rpg-town');await enter('cursed-forest');assert.ok(await page.locator('.forest-battle').count());await shot('forest-entry');await finish('forest',true,true);
 assert.equal((await data()).progress.lootHistory.filter(r=>r.dungeonId==='cursed-forest').length,5);await click('rpg-return');await click('rpg-guild');const rewardBefore=await data();assert.ok(rewardBefore.progress.completedQuests.includes('iron-guardian'));await quest('iron-guardian','rpg-quest-report');assert.equal((await data()).character.gold-rewardBefore.character.gold,90);assert.ok((await data()).character.inventory.items.includes('guardian_charm'));await click('rpg-town');const saved=await data();await click('rpg-save');await page.reload();await click('rpg-enter');await click('rpg-continue');assert.deepEqual((await data()).character,saved.character);assert.deepEqual((await data()).progress,saved.progress);
 for(const [width,height]of [[390,844],[1920,1080]]){await page.setViewportSize({width,height});await click('rpg-guild');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot('guild-'+width);await click('rpg-town');await click('rpg-dungeon');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot('dungeons-'+width);await click('rpg-town');}
 await page.goto('http://127.0.0.1:4173/dist/index.html?debug=1');await click('rpg-enter');await click('rpg-continue');assert.deepEqual((await data()).character,saved.character);await click('rpg-guild');assert.equal(await page.locator('.quest-card').count(),13);
 assert.ok(specials.has('guard')&&specials.has('block'));assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(__dirname,'../ADVENTURE-BROWSER-RESULTS.json'),JSON.stringify({pass:true,turns,frames,specials:[...specials],character:saved.character,unlocked:saved.progress.unlockedDungeons,errors},null,2));
 console.log('PASS guild / real math prison twice / quest report / drops / unlock / buy and equip / all five forest fights / boss / final reload / production / tablet and board',JSON.stringify(turns),[...specials]);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
