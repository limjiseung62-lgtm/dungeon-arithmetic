import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const out=path.join(root,'dist');await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css','combat-v2.css','presentation-v3.css','quality-v4.css','update-v1.1.css','update-v1.2.css','rpg-v2.0.css','adventure-v2.2.css','mercenary-v2.3.css','remaster-v2.4.css','story-v2.5.css','mine-v2.6.css','boss-v2.7.css','collection-v2.8.css','affinity-v2.9.css','fortress-v3.0.css','src','assets'])await cp(path.join(root,name),path.join(out,name),{recursive:true});
await writeFile(path.join(out,'.nojekyll'),'');
const html=await readFile(path.join(out,'index.html'),'utf8');if(!html.includes('src/UI.js'))throw new Error('Missing entry point');
console.log('Production static build: dist/');
