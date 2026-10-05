const fs=require('node:fs'),assert=require('node:assert/strict'),pw=require(process.env.USERPROFILE+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await pw.chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1280,height:900},hasTouch:true}),errors=[],results=[];
 page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const click=async action=>page.locator(`[data-action="${action}"]:not([disabled])`).first().click();
 const skip=()=>page.locator('[data-action=presentation-skip]').evaluateAll(es=>es.forEach(e=>e.click()));
 const st=()=>page.evaluate(()=>{const s=window.dungeonDebug.state;return {phase:s?.phase,hp:s?.hero.hp,maxHP:s?.battleContext.heroMaxHP,turn:s?.turn,enemies:s?.enemies.map(e=>({id:e.id,hp:e.hp,maxHP:e.maxHP,phase:e.boss?.phase,breaks:e.boss?.breaks})),stats:s?.stats,events:s?.events};});
 const data=()=>page.evaluate(()=>structuredClone(window.dungeonDebug.rpg.data));
 const shot=async name=>{await page.evaluate(()=>Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));await page.screenshot({path:'preview-v29-'+name+'.png',fullPage:true});};
 async function settle(scroll='heal'){
  for(let i=0;i<250;i++){
   await skip();const choices=page.locator('.scroll-choice-overlay [data-action=cast-choice]');
   if(await choices.count()){const a=await choices.evaluateAll((es,type)=>{const r=window.dungeonDebug.state;return es.find(e=>r.scrolls[Number(e.dataset.scroll)]?.type===type)?.dataset.scroll??es[0].dataset.scroll;},scroll);await page.locator('.scroll-choice-overlay [data-action=cast-choice][data-scroll="'+a+'"]').click();}
   else if(await page.locator('.scroll-choice-overlay [data-action=cast-skip]').count())await page.locator('.scroll-choice-overlay [data-action=cast-skip]').click();
   if(await page.locator('.target-scroll-overlay [data-action=scroll-target]').count())await page.locator('.target-scroll-overlay [data-action=scroll-target]').first().click();
   const s=await st();if(['reward','clear','gameover'].includes(s.phase))return s.phase;
   if(s.phase==='playing'&&await page.evaluate(()=>window.dungeonDebug.timer.running))return 'playing';await page.waitForTimeout(25);
  }throw Error('resolution timeout');
 }
 async function solve(side,grade,scroll='heal'){
  await page.waitForFunction(()=>window.dungeonDebug.timer.running);const t=await page.evaluate(({side,grade})=>window.dungeonDebug.state.targets.find(t=>t.side===side&&t.grade===grade),{side,grade}),pad=page.locator('.input-pad[data-player="0"]');
  for(let i=0;i<t.solution.ids.length;i++){if(i)await pad.locator('[data-op="'+t.solution.ops[i-1]+'"]').click();await pad.locator('[data-dice="'+t.solution.ids[i]+'"]').click();}await pad.locator('[data-action=submit]').click();
  if(await page.locator('[data-action=choose-target]').count())await page.locator('[data-action=choose-target]').first().click();return settle(scroll);
 }
 await page.addInitScript(()=>localStorage.setItem('dungeon-settings',JSON.stringify({reducedMotion:true,sound:false})));
 await page.goto('http://127.0.0.1:4173/?debug=1&v=2.9');await click('rpg-enter');await page.locator('#character-name').fill('인연 모험가');await click('rpg-create-submit');await click('rpg-opening-skip');await click('rpg-mercenaries');
 assert.equal(await page.locator('.relationship-summary').count(),6);await shot('guild');await click('rpg-companions');assert.equal(await page.locator('.companion-record-card').count(),6);await shot('records');
 await page.locator('[data-action=rpg-companion-record][data-mercenary=rowen]').click();assert.equal(await page.locator('.companion-chapters .locked').count(),2);assert.equal(await page.locator('[data-action=rpg-personal-start]').count(),0);await shot('rowen-stranger');
 // Prepared v2.8 character/gear; relationship starts empty. Two complete prison
 // adventures use real input and ordinary progression to unlock trust.
 await page.evaluate(async()=>{const r=window.dungeonDebug.rpg,{characterStats}=await import('./src/RPGConfig.js');Object.assign(r.character,{level:5,exp:0,...characterStats(5),hp:120,gold:20000});r.character.inventory.items=['steel_sword','leather_armor'];r.equip('steel_sword');r.equip('leather_armor');r.save();});
 for(let run=0;run<2;run++){
  await click('rpg-mercenaries');await page.locator('[data-action=rpg-mercenary-hire][data-mercenary=rowen]').click();await click('rpg-town');await click('rpg-dungeon');await page.locator('[data-action=rpg-dungeon-start][data-dungeon=old-prison]').click();await click('rpg-party-depart');await skip();
  let turns=0;for(;turns<70;turns++){const phase=await settle();if(phase==='gameover')throw Error('prison defeat');if(['reward','clear'].includes(phase)){await click('loot-choice');if(phase==='clear'){await shot('trust-clear-'+run);await click('rpg-return');break;}await click('next-monster');await skip();}else await solve('attack','S','fire');}assert.ok(turns<70);
 }
 assert.equal((await data()).progress.mercenaryRelations.rowen.affinityLevel,2);assert.equal((await data()).progress.mercenaryRelations.rowen.completedDungeonsTogether,2);results.push({actualPrisonClears:2,trustStage:2});
 // Six separate fixtures prepare prior genuine trust, unlocked regions and normal
 // owned gear; personal fights below never alter enemies/HP or bypass input.
 const base=await data();
 for(const id of ['rowen','bram','sera','luna','kain','elia']){
  await page.evaluate(async({base,id})=>{const r=window.dungeonDebug.rpg,{characterStats}=await import('./src/RPGConfig.js'),{blankRelationships}=await import('./src/AffinitySystem.js');r.data=structuredClone(base);Object.assign(r.character,{level:7,exp:0,...characterStats(7),gold:20000});r.character.maxHP=r.stats().maxHP;r.character.hp=r.character.maxHP;r.character.scrolls=[{type:'heal',uses:9},{type:'fire',uses:9},{type:'shield',uses:9},{type:'cleanse',uses:9}];const p=r.data.progress;p.run=null;p.activeMercenary=null;p.mercenaryContractState=null;p.activeQuests=[];p.completedQuests=[];p.rewardedQuests=['forest-road'];p.questProgress={'forest-road':{count:1,scrolls:[]}};p.questEventIds=[];p.clearedDungeons=['old-prison','cursed-forest'];p.unlockedDungeons=['old-prison','cursed-forest','burning-mine'];p.story.mineInvestigated=true;p.mercenaryRelations=blankRelationships();Object.assign(p.mercenaryRelations[id],{affinityLevel:2,affinityProgress:3,personalQuestUnlocked:true,unlockedDialogues:[1,2]});r.save();}, {base,id});
  await click('rpg-mercenaries');await page.locator('[data-action=rpg-companion-record][data-mercenary='+id+']').click();assert.equal(await page.locator('.companion-chapters .locked').count(),1);await shot(id+'-trusted');await click('rpg-quest-accept');await click('rpg-mercenaries');await page.locator('[data-action=rpg-mercenary-hire][data-mercenary='+id+']').click();await page.locator('[data-action=rpg-companion-record][data-mercenary='+id+']').click();await click('rpg-personal-start');
  assert.ok(await page.locator('.companion-story-overlay').count());await shot(id+'-intro');
  if(id==='rowen'){await page.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-dungeon');await click('rpg-dungeon-start');assert.ok(await page.locator('.companion-story-overlay').count());}
  await click('rpg-personal-intro-done');await skip();let turns=0,breakSeen=false,casts=0;
  for(;turns<80;turns++){
   const phase=await settle();if(phase==='gameover')throw Error(id+' trial defeat '+JSON.stringify(await st()));if(phase==='clear')break;
   const s=await st();breakSeen ||= s.enemies.some(e=>e.breaks>0);
   let side='attack',grade='S',scroll=s.hp<s.maxHP*.65?'heal':'fire';
   if(id==='bram'&&turns<2){side='defense';grade='A';}
   if(id==='kain'){grade='A';scroll='heal';if(s.hp<s.maxHP*.55||turns%3===2){side='attack';grade='S';scroll='heal';}if(s.enemies[0].hp/s.enemies[0].maxHP<=.3){side='attack';grade='A';}}
   await solve(side,grade,scroll);
  }
  assert.ok(turns<80);await page.locator('.rpg-result').waitFor();const beforeReport=await data(),q=beforeReport.progress.questProgress['personal-'+id];assert.equal(q.count,1,id+' quest progress');assert.equal(beforeReport.progress.mercenaryRelations[id].affinityLevel,2);casts=beforeReport.progress.run.stats.scrolls;
  await shot(id+'-victory');const receipt=beforeReport.progress.run.pendingLoot.receipt;await page.reload();await click('rpg-enter');await click('rpg-continue');await click('rpg-dungeon');await click('rpg-dungeon-start');assert.deepEqual((await data()).progress.run.pendingLoot.receipt,receipt);await click('loot-choice');await click('rpg-return');await click('rpg-mercenaries');await page.locator('[data-action=rpg-companion-record][data-mercenary='+id+']').click();const gold=(await data()).character.gold;await click('rpg-quest-report');assert.ok(await page.locator('.awakening-skill').count());await shot(id+'-awakening');await click('rpg-companion-story-close');const after=await data();assert.equal(after.character.gold,gold+60);assert.equal(after.progress.mercenaryRelations[id].affinityLevel,3);assert.equal(after.progress.mercenaryRelations[id].awakenedSkillUnlocked,true);assert.equal(await page.locator('.companion-chapters .locked').count(),0);
  await click('rpg-companion-replay');await click('rpg-companion-story-close');assert.equal((await data()).character.gold,after.character.gold);await shot(id+'-true-companion');results.push({id,turns,casts,actualInput:true,awake:true,receiptReloadNoReplay:true});
 }
 for(const [width,height]of [[390,844],[768,1024],[1920,1080]]){await page.setViewportSize({width,height});await click('rpg-companions');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot('records-'+width);await page.locator('[data-action=rpg-companion-record][data-mercenary=elia]').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot('biography-'+width);await page.locator('[data-action=rpg-companion-replay][data-chapter=finish]').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot('awakening-'+width);await click('rpg-companion-story-close');}
 await page.goto('http://127.0.0.1:4173/dist/index.html?debug=1');assert.match(await page.title(),/v3\.2/);await click('rpg-enter');await click('rpg-continue');await click('rpg-mercenaries');await click('rpg-companions');assert.equal(await page.locator('.companion-record-card').count(),6);assert.deepEqual(errors,[]);fs.writeFileSync('AFFINITY-BROWSER-RESULTS-v2.9.json',JSON.stringify({passed:true,fixture:'prepared prior trust / owned gear, full unmodified personal fights and actual arithmetic UI',results,errors},null,2));await browser.close();console.log('PASS v2.9 real trust loop, six actual personal fights, report/awakening, resume/replay, responsive and production');
})().catch(e=>{console.error(e);process.exit(1)});
