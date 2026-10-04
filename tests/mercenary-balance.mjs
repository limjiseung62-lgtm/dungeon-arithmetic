import {writeFile} from 'node:fs/promises';
import {forestSimulation} from './forest-balance.mjs';
import {MercenaryData} from '../src/MercenaryData.js';
const results=[];for(const member of [null,...MercenaryData.map(m=>m.id)])for(const policy of ['attack','adaptive'])for(const grade of ['A','S'])for(let seed=1;seed<=5;seed++)results.push(forestSimulation(policy,seed,grade,4,member));
const summary=[];for(const member of [null,...MercenaryData.map(m=>m.id)])for(const policy of ['attack','adaptive'])for(const grade of ['A','S']){
 const rows=results.filter(r=>r.mercenaryId===member&&r.policy===policy&&r.grade===grade),clears=rows.filter(r=>r.phase==='clear');
 summary.push({member:member||'none',policy,grade,clears:clears.length,total:rows.length,cost:MercenaryData.find(m=>m.id===member)?.hireCost||0,turns:clears.map(r=>r.totalTurns),hp:clears.map(r=>r.hp),supports:rows.map(r=>r.supports)});
}
await writeFile(new URL('../MERCENARY-BALANCE-RESULTS.json',import.meta.url),JSON.stringify({scenarios:results.length,level:4,gear:['steel_sword','leather_armor'],summary,results},null,2));console.log(JSON.stringify(summary,null,2));
