const path=require('node:path');let playwright;try{playwright=require('playwright');}catch{playwright=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const {chromium}=playwright,assert=require('node:assert/strict');const output=name=>path.join(__dirname,'..',name);
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 async function start(mode='sequential',count=4){await page.goto('http://127.0.0.1:4173/?debug=1');await page.locator('[data-action=setup]').tap();await page.locator(`[data-players="${count}"]`).tap();await page.locator(`[data-mode="${mode}"]`).tap();await page.locator('[data-action=story]').tap();await page.locator('[data-action=start]').tap();await page.waitForFunction(()=>window.dungeonDebug.timer.running);}
 const state=()=>page.evaluate(()=>window.dungeonDebug.state);
 const root=p=>page.locator(`.input-pad[data-player="${p}"]`);
 async function typeSolution(player,t){for(let i=0;i<t.solution.ids.length;i++){if(i)await root(player).locator(`[data-op="${t.solution.ops[i-1]}"]`).tap();await root(player).locator(`[data-dice="${t.solution.ids[i]}"]`).tap();}}
 async function solve(p,side,grade){const t=(await state()).targets.find(t=>t.side===side&&t.grade===grade);await typeSolution(p,t);await root(p).locator('[data-action=submit]').tap();return t;}
 async function waitTurn(turn){await page.waitForFunction(n=>window.dungeonDebug.state.phase==='playing'&&window.dungeonDebug.state.turn===n,turn,{timeout:30000});await page.waitForTimeout(600);}
 async function speed(){await page.locator('[data-action=debug-toggle]').tap();await page.locator('#debug-animation').selectOption('.25').catch(()=>page.locator('#debug-animation').selectOption('0.25'));await page.locator('[data-action=debug-toggle]').tap();}
 await start();assert.equal((await state()).monsterHP,230);assert.equal(await page.locator('.input-pad').count(),1);assert.equal(await page.locator('.monster-image').count(),1);assert.equal(await page.locator('.combatant.hero').count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),768);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),1024);
 await page.screenshot({path:output('preview-v2-tablet.png'),fullPage:true});
 for(let turn=1;turn<=3;turn++){
   const before=(await state()).monsterHP;const first=await solve(0,'attack','C');assert.equal((await state()).monsterHP,before);assert.equal((await state()).actionQueue.length,1);assert.equal(await page.locator(`[data-target="${first.id}"]`).textContent().then(t=>t.includes('1P ✓')),true);
   await solve(1,'defense','S');assert.equal((await state()).hero.shield,turn===1?0:(turn-1)*18);
   await solve(2,'attack','S');assert.equal((await state()).scrolls[0].uses,4-turn);assert.equal((await state()).monsterHP,before);
   await solve(3,'attack','A');assert.equal(await page.locator('.input-pad').count(),0);assert.equal((await state()).phase,'resolution');
   if(turn===1){await page.locator('.fx-scroll-open').waitFor();await page.screenshot({path:output('preview-v2-scroll.png'),fullPage:true});await page.locator('.fx-magic').waitFor();await page.screenshot({path:output('preview-v2-fireball.png'),fullPage:true});}
   if(turn<3){await waitTurn(turn+1);assert.equal((await state()).monsterHP,before-86);assert.ok((await state()).targets.every(t=>!t.used));}
   else await page.getByRole('heading',{name:'스켈레톤 병사 격파!'}).waitFor({timeout:30000});
 }
 console.log('PASS sequential: 4 players, three full turns, deferred damage/shields/scrolls, claimed marks, separate scroll scene, counterattack, regenerated targets');
 // Continue a complete campaign with animations still going through the same director.
 await page.locator('[data-action=next-monster]').tap();await page.waitForFunction(()=>window.dungeonDebug.timer.running);await speed();
 let guard=0,plannedTurn=-1,planned=[];
 while((await state()).phase!=='clear'&&guard++<650){
   const s=await state();
   if(s.phase==='playing'){
     const p=s.player;if(plannedTurn!==s.turn){plannedTurn=s.turn;planned=await page.evaluate(async()=>{const {plan}=await import('/tests/BalanceStrategies.js');return plan(window.dungeonDebug.state,'adaptive').map(t=>t.id);});}
     const targetId=planned.shift(),t=s.targets.find(t=>t.id===targetId);
     if(t)await solve(p,t.side,t.grade);else await root(p).locator('[data-action=pass]').tap();
   }else if(s.phase==='reward'){await page.locator('[data-action=next-monster]').tap();await page.waitForFunction(()=>window.dungeonDebug.timer.running);}
   else if(s.phase==='resolution'||s.phase==='enemy'){await page.evaluate(()=>window.dungeonDebug.skip());await page.waitForTimeout(400);}
   else throw Error('Unexpected phase '+s.phase);
 }
 await page.getByRole('heading',{name:'던전 탐험 성공!'}).waitFor({timeout:30000});assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('dungeon-last-team')).clear));
 await page.screenshot({path:output('preview-v2-clear.png'),fullPage:true});console.log('PASS full campaign: all five monsters, state effects, final clear and saved team record');
 // Four genuinely independent, simultaneously active pads, including multi-contact touch.
 await page.setViewportSize({width:1920,height:1080});await start('simultaneous');assert.equal(await page.locator('.input-pad').count(),4);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),1080);await page.screenshot({path:output('preview-v2-board.png'),fullPage:true});
 const client=await page.context().newCDPSession(page);const points=[];
 for(let p=0;p<4;p++){const box=await root(p).locator('[data-dice="0"]').boundingBox();points.push({x:box.x+box.width/2,y:box.y+box.height/2,id:p+1});}
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.deepEqual(await page.evaluate(()=>window.dungeonDebug.pads.map(p=>p.ids)),[[0],[0],[0],[0]]);
 for(let p=0;p<4;p++)await root(p).locator('[data-op="+"]').tap();
 const snapshots=await page.evaluate(()=>window.dungeonDebug.pads.map(p=>JSON.stringify(p)));await root(0).locator('[data-action=reset]').tap();
 assert.deepEqual(await page.evaluate(()=>window.dungeonDebug.pads.slice(1).map(p=>JSON.stringify(p))),snapshots.slice(1));
 for(let p=1;p<4;p++)await root(p).locator('[data-action=reset]').tap();
 const target=(await state()).targets.find(t=>t.id==='attack-C');for(let p=0;p<4;p++)await typeSolution(p,target);
 const before=(await state()).monsterHP,seconds=(await state()).seconds;
 await root(2).locator('[data-action=submit]').tap();assert.equal((await state()).monsterHP,before);assert.equal((await state()).targets.find(t=>t.id===target.id).claimedBy,2);
 // Submitting in P3 must not clear any other student's expression.
 assert.equal(await page.evaluate(()=>window.dungeonDebug.pads[0].ids.length),target.solution.ids.length);
 await root(0).locator('[data-action=submit]').tap();assert.match(await root(0).locator('[data-message]').textContent(),/이미 3P/);assert.equal((await state()).actionsDone[0],false);assert.equal((await state()).actionQueue.length,1);
 assert.ok((await state()).seconds<=seconds);assert.ok((await state()).seconds>seconds-10);
 for(const p of [0,1,3])await root(p).locator('[data-action=reset]').tap();
 await solve(0,'attack','S');await solve(1,'defense','S');await solve(3,'attack','A');
 await page.locator('.fx-enemy').waitFor({timeout:30000});assert.equal(await page.locator('.fx-enemy .hurt-vignette').count(),0,'full absorption must not show a direct hit');
 await waitTurn(2);assert.equal((await state()).monsterHP,before-86);
 console.log('PASS simultaneous: four-contact touch, independent dice/operator/reset, contested target keeps action, single shared timer, one queue and fully absorbed counterattack');
 // Explicit special blocking scene and death mid-queue.
 await speed();await page.locator('[data-action=debug-toggle]').tap();await page.locator('#debug-select-monster').selectOption('1');await page.waitForFunction(()=>window.dungeonDebug.timer.running);await page.locator('[data-action=debug-toggle]').tap();
 await solve(0,'defense','S');for(const p of [1,2,3])await root(p).locator('[data-action=pass]').tap();await page.locator('.special-sequence.blocked').waitFor({timeout:10000});assert.equal((await state()).stolen,false);assert.equal((await state()).specialBlocked,true);assert.equal((await state()).stats.blocks,1);
 await waitTurn((await state()).turn+1).catch(async()=>{await page.waitForFunction(()=>window.dungeonDebug.state.phase==='playing');});
 const blockState=await state();assert.equal(blockState.duration,60);assert.ok(blockState.events.some(e=>e.kind==='enemy'));
 await page.locator('[data-action=debug-toggle]').tap();await page.locator('#debug-monster').fill('5');await page.locator('#debug-monster').dispatchEvent('change');await page.locator('[data-action=debug-toggle]').tap();
 const hp=(await state()).hero.hp,charges=(await state()).scrolls[0].uses;await solve(0,'attack','C');await solve(1,'attack','S');await root(2).locator('[data-action=pass]').tap();await root(3).locator('[data-action=pass]').tap();await page.getByRole('heading',{name:'고블린 도적 격파!'}).waitFor({timeout:10000});assert.equal((await state()).hero.hp,hp);assert.equal((await state()).scrolls[0].uses,charges);
 console.log('PASS special block, normal attack preserved, lethal queue cancels counterattack and preserves uncast scroll');
 // Real timer code, accelerated browser clock, not a direct engine call.
 await start('simultaneous');await page.clock.install();
 // Restart after installing the fake clock so deadline and interval share the clock.
 await page.locator('[data-action=settings]').tap();await page.locator('[data-action=title]').tap();await page.locator('[data-action=setup]').tap();await page.locator('[data-action=story]').tap();await page.locator('[data-action=start]').tap();await page.evaluate(()=>window.dungeonDebug.skip());await page.waitForFunction(()=>window.dungeonDebug.timer.running);
 await page.clock.fastForward(31000);assert.equal((await state()).seconds,29);assert.ok(await page.locator('.combat-target.hinted').count()>0);await page.clock.fastForward(29000);assert.equal((await state()).phase,'resolution');assert.ok((await state()).actionsDone.every(Boolean));assert.equal(await page.locator('.input-pad').count(),0);
 console.log('PASS shared 60-second timer: all four automatic passes and cinematic phase; 30-second weak hints');
 // Student URL keeps debug API hidden and loads all artwork successfully.
 await page.goto('http://127.0.0.1:4173/');assert.equal(await page.evaluate(()=>typeof window.dungeonDebug),'undefined');assert.equal(await page.locator('.debug').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS no fatal browser/console errors');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});



