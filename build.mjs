import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const out=path.join(root,'dist');await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css','combat-v2.css','presentation-v3.css','quality-v4.css','update-v1.1.css','update-v1.2.css','rpg-v2.0.css','src','assets'])await cp(path.join(root,name),path.join(out,name),{recursive:true});
await writeFile(path.join(out,'.nojekyll'),'');
const html=await readFile(path.join(out,'index.html'),'utf8');if(!html.includes('src/UI.js'))throw new Error('Missing entry point');
console.log('Production static build: dist/');
