const path=require('node:path');let pw;try{pw=require('playwright')}catch{pw=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))}
const assert=require('node:assert/strict');
(async()=>{const browser=await pw.chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://127.0.0.1:4173/dist/index.html?debug=1');
await page.locator('[data-action=setup]').click();await page.locator('[data-players="4"]').click();await page.locator('[data-action=story]').click();await page.locator('[data-action=start]').click();await page.locator('[data-action=presentation-skip]').click();await page.waitForFunction(()=>window.dungeonDebug.timer.running);
const result=await page.evaluate(async()=>{const s=window.dungeonDebug.state;const {CombatSystem}=await import('./src/CombatSystem.js');s.phase='reward';s.hero.hp=82;s.hero.shield=30;new CombatSystem(s).nextMonster();return {hp:s.hero.hp,shield:s.hero.shield,index:s.monsterIndex}});assert.deepEqual(result,{hp:82,shield:0,index:1});
for(const file of ['dungeon-v2.png','skeleton-v2.png','goblin-v2.png','orc-v2.png','spider-v2.png','golem-v2.png',...require('node:fs').readdirSync(path.join(__dirname,'../assets/audio')).filter(n=>n.endsWith('.wav')).map(n=>'audio/'+n)]){const r=await page.request.get('http://127.0.0.1:4173/dist/assets/'+file);assert.equal(r.status(),200);assert.ok((await r.body()).length>100)}
for(const viewport of [{width:1024,height:768},{width:1920,height:1080}]){await page.setViewportSize(viewport);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)}
assert.deepEqual(errors,[]);console.log('PASS production dist starts; transition HP82/shield0; tablet/board width; no errors');await browser.close()})().catch(e=>{console.error(e);process.exit(1)});


