import {cp,mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const outputArgument=process.argv.indexOf('--out');
const out=outputArgument>=0?path.resolve(process.argv[outputArgument+1]):path.join(root,'dist');await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css','combat-v2.css','presentation-v3.css','quality-v4.css','update-v1.1.css','update-v1.2.css','rpg-v2.0.css','adventure-v2.2.css','mercenary-v2.3.css','remaster-v2.4.css','story-v2.5.css','mine-v2.6.css','boss-v2.7.css','collection-v2.8.css','affinity-v2.9.css','fortress-v3.0.css','chaos-v3.1.css','canyon-v3.2.css','castle-v3.3.css','battle-v3.4.css','final-v3.4.css','pov-v3.5.css','attack-s-v3.5.css','roster-v35.css','combat-rebuild-v35.css','legendary-v35.css','start-screen-v35.css','class-coop-v35.css','mobile-v3.5.1.css','enemy-v3.5.1.css','src','assets'])await cp(path.join(root,name),path.join(out,name),{recursive:true});
await writeFile(path.join(out,'.nojekyll'),'');
const uiPath=path.join(out,'src','UI.js'),ui=await readFile(uiPath,'utf8');
if(!ui.includes('const BUILD_DEBUG_ALLOWED=true;'))throw new Error('Missing explicit development debug guard');
await writeFile(uiPath,ui.replace('const BUILD_DEBUG_ALLOWED=true;','const BUILD_DEBUG_ALLOWED=false;'));
const html=await readFile(path.join(out,'index.html'),'utf8');if(!html.includes('src/UI.js'))throw new Error('Missing entry point');
async function sourceModules(directory,prefix='src'){
 const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const relative=prefix+'/'+entry.name;if(entry.isDirectory())result.push(...await sourceModules(path.join(directory,entry.name),relative));else if(entry.name.endsWith('.js'))result.push(relative);}return result.sort();
}
const modules=await sourceModules(path.join(root,'src')),styles=(await readdir(root)).filter(name=>name.endsWith('.css')).sort(),version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
const digest=createHash('sha256').update(version);for(const name of [...styles,...modules])digest.update(name).update(await readFile(path.join(root,name)));
const fingerprint=digest.digest('hex').slice(0,12),hashed=name=>name.replace(/\.(js|css)$/,'.'+fingerprint+'.$1'),manifest={version,fingerprint,entry:hashed('src/UI.js'),styles:styles.map(hashed),modules:modules.map(hashed)};
for(const name of styles)await writeFile(path.join(out,hashed(name)),await readFile(path.join(out,name)));
for(const name of modules){const source=await readFile(path.join(out,name),'utf8'),built=source.replace(/(['"])(\.\.?\/[^'"]+\.js)\1/g,(_,quote,specifier)=>quote+hashed(specifier)+quote);await writeFile(path.join(out,hashed(name)),built);}
await writeFile(path.join(out,'index.html'),html.replace(/\b(href|src)=(['"])([^'"]+\.(?:css|js))\2/g,(_,attribute,quote,name)=>attribute+'='+quote+hashed(name)+quote));
await writeFile(path.join(out,'cache-manifest.json'),JSON.stringify(manifest,null,2));
console.log('Production static build: dist/');
