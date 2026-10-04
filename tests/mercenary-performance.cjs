const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const pw=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async()=>{
 const browser=await pw.chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1024,height:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?debug=1');await page.locator('[data-action=setup]').click();await page.locator('[data-players="1"]').click();await page.locator('[data-action=story]').click();await page.locator('[data-action=start]').click();await page.locator('[data-action=presentation-skip]').dispatchEvent('click');await page.waitForFunction(()=>window.dungeonDebug.timer.running);await page.evaluate(()=>window.dungeonDebug.timer.pause());
 const samples=await page.evaluate(async()=>{
  const {MercenaryData}=await import('./src/MercenaryData.js'),{showMercenarySupport}=await import('./src/MercenaryPresentation.js'),rows=[];
  // Isolated renderer profiling. No screenshot or simultaneous other browser tests during sampling.
  for(const m of MercenaryData){const img=new Image();img.src=m.battleAsset;await img.decode();const effect=m.effect==='adaptive'?'shield':m.effect;
   const event={mercenaryId:m.id,effect,value:m.effectValue,enemyId:window.dungeonDebug.state.enemies[0].id,text:m.name+' 지원!',compact:false};showMercenarySupport(event,document.querySelector('.battle-stage'),null);
   const deltas=await new Promise(resolve=>{let prev=null;const a=[];function frame(t){if(prev!==null)a.push(t-prev);prev=t;if(a.length<60)requestAnimationFrame(frame);else resolve(a);}requestAnimationFrame(frame);});
   deltas.sort((a,b)=>a-b);rows.push({member:m.id,medianMS:deltas[30],p95MS:deltas[57],maxMS:deltas.at(-1),samples:60});document.querySelector('.mercenary-support')?.remove();
  }return rows;
 });
 assert.deepEqual(errors,[]);for(const r of samples)assert.ok(r.p95MS<100,JSON.stringify(r));fs.writeFileSync(path.join(__dirname,'../MERCENARY-PERFORMANCE-RESULTS.json'),JSON.stringify({pass:true,method:'Edge headless 1024x768; live battle stage; isolated MercenaryPresentation, predecoded hired artwork, default speed1; no screenshot during60frames; no rule changes to CLASS',samples,errors},null,2));console.log('PASS isolated six animation renderer',JSON.stringify(samples));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
