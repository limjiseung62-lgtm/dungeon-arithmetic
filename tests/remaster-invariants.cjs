const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const git=process.env.GIT_EXEC_PATH?path.join(process.env.GIT_EXEC_PATH,'git.exe'):'git';
const run=(...args)=>cp.execFileSync(git,args),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const display=new Set(['AssetManager.js','AssetManifest.js','RPGView.js','AdventureView.js','MercenaryPresentation.js','UI.js','VisualEffects.js']);
const frozen=run('ls-tree','-r','--name-only','v2.3','src').toString().trim().split('\n').filter(f=>!display.has(path.basename(f)));
const files=frozen.map(f=>{const before=run('show','v2.3:'+f).toString().replace(/\r\n/g,'\n'),after=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');assert.equal(after,before,f+' rule code changed');return {file:f,sha256:hash(before)};});
const mercenaries=['rowen','bram','sera','luna','kain','elia'].map(id=>{const f='assets/mercenaries/'+id+'.webp',before=run('show','v2.3:'+f);assert.equal(hash(fs.readFileSync(f)),hash(before));return {id,sha256:hash(before)};});
const tags=['v2.0','v2.1','v2.2','v2.3'].map(tag=>({tag,commit:run('rev-list','-1',tag).toString().trim()}));
fs.writeFileSync('REMASTER-INVARIANTS.json',JSON.stringify({pass:true,baseline:'v2.3',files,mercenaries,tags},null,2));console.log('PASS',files.length,'rule/data files unchanged; six companion images byte-identical; historical tags preserved');
