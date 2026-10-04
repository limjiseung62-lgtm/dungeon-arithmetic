const cp=require('node:child_process'),fs=require('node:fs');
const results=[];
for(const file of ['presentation-browser.cjs','quality-browser.cjs','update-v11-browser.cjs','encounter-browser.cjs','balance-browser.cjs','balance-targets.cjs','simulate-balance.mjs']){
 console.log('START',file);const r=cp.spawnSync(process.execPath,['tests/'+file],{encoding:'utf8',timeout:360000});results.push({file,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync('REMASTER-REGRESSION-RESULTS.json',JSON.stringify(results,null,2));console.log(r.stdout);if(r.status!==0){console.error(r.stderr);process.exit(1)}
}
