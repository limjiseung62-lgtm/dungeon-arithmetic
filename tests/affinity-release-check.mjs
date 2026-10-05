import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const json=f=>JSON.parse(fs.readFileSync(f,'utf8')),unit=fs.readFileSync('UNIT-RESULTS-v2.9.txt','utf8');
assert.match(unit,/tests 476/);assert.match(unit,/pass 476/);assert.match(unit,/fail 0/);
const regression=json('REGRESSION-RESULTS-v2.9.json');assert.equal(regression.length,21);assert.equal(new Set(regression.map(r=>r.file)).size,21);assert.ok(regression.every(r=>r.status===0));
for(const f of ['AFFINITY-BROWSER-RESULTS-v2.9.json','AFFINITY-EFFECTS-BROWSER-RESULTS-v2.9.json','AFFINITY-INVARIANTS-v2.9.json'])assert.equal(json(f).passed,true);
const invariant=json('AFFINITY-INVARIANTS-v2.9.json');assert.equal(invariant.unchangedAssets,75);assert.equal(invariant.unchangedBalanceAndMathFiles.length,27);
const balance=json('AFFINITY-BALANCE-RESULTS-v2.9.json');assert.equal(balance.personal.length,30);assert.equal(balance.comparison.length,114);assert.ok(balance.personal.every(r=>r.turns>0&&r.hp>0));
for(const name of fs.readdirSync('src').filter(n=>n.endsWith('.js'))){execFileSync(process.execPath,['--check','src/'+name],{stdio:'pipe'});assert.equal(fs.readFileSync('src/'+name,'utf8'),fs.readFileSync('dist/src/'+name,'utf8'),name+' production out of date');}
const html=fs.readFileSync('dist/index.html','utf8');assert.match(html,/v2.9/);for(const [,css]of html.matchAll(/href="([^"]+\.css)"/g)){assert.ok(fs.existsSync(path.join('dist',css)));assert.equal(fs.readFileSync(css,'utf8'),fs.readFileSync(path.join('dist',css),'utf8'));}assert.ok(fs.existsSync('dist/.nojekyll'));
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();assert.equal(git('branch','--show-current'),'update/v2.9');for(const t of invariant.tagsBeforeV29)assert.equal(git('rev-parse',t.ref),t.object);assert.equal(invariant.tagsBeforeV29.length,12);assert.equal(git('rev-parse','v2.8^{}'),'8850aad0a705e07206ddb848b0098fd88bd76348');
assert.equal(git('diff','--name-only','v2.8','--','assets'),'');
const report={passed:true,version:'2.9.0',unitTests:476,baselineUnitTestsRetained:412,newUnitTests:64,browserSuites:21,baselineBrowserSuites:19,newBrowserSuites:2,personalCombatScenarios:30,relationshipBalanceScenarios:114,productionBuild:'passed; source files and linked CSS verified',assetsPreserved:75,previousTagsPreserved:12,recoveryCommit:git('rev-parse','v2.8^{}'),branch:'update/v2.9',targetLocalTag:'v2.9',remotePush:false,publicDeployment:false,checkedAt:new Date().toISOString()};
fs.writeFileSync('RELEASE-CHECK-v2.9.json',JSON.stringify(report,null,2));console.log('PASS v2.9 release candidate: 476 unit / 21 browser / 144 combat scenarios / production / 75 assets / 12 previous tags');
