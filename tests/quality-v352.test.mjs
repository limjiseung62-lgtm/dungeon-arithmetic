import test from 'node:test';
import assert from 'node:assert/strict';
import {focusedCoopPlan,defendingStudents} from '../src/StudentFocusPresentation.js';
import {weaponPlan} from '../src/WeaponPresentationData.js';
import {runAttackS35} from '../src/AttackS35Timeline.js';
for(const [rank,stop,read] of [['C',50,300],['B',80,320],['A',110,340],['S',160,360]])test('focused CLASS '+rank+' gives each student a readable separate contact',()=>{
 const plan=focusedCoopPlan(weaponPlan('SWORD',rank),rank,true);
 assert.equal(plan[0].stage,'focus');assert.ok(plan[0].ms>=250&&plan[0].ms<=450);
 assert.equal(plan.find(p=>p.stage==='contact').ms,stop);
 assert.equal(plan.find(p=>p.stage==='damage').ms,read);
 assert.equal(plan.filter(p=>p.stage==='contact').length,1);
});
test('four students finish in five to eight seconds including focus and group result',()=>{
 for(const ranks of [['C','B','A','S'],['S','S','A','S'],['S','S','S','S']]){
  const total=ranks.flatMap((r,i)=>focusedCoopPlan(weaponPlan('SWORD',r),r,i===3)).reduce((n,p)=>n+p.ms,0)+300+450;
  assert.ok(total>=5000&&total<=8000,String(total));
 }
});
test('focus cancellation before contact commits nothing; later cancellation cannot commit twice',async()=>{
 const plan=focusedCoopPlan(weaponPlan('SWORD','S'),'S',true);
 for(let cutoff=0;cutoff<plan.length;cutoff++){
  let valid=true,commits=0,index=0;
  await runAttackS35({plan,valid:()=>valid,resolve:()=>{commits++;return {damage:1};},stage:()=>{},wait:async()=>{if(index++===cutoff)valid=false;}});
  assert.equal(commits,cutoff>=plan.findIndex(p=>p.stage==='contact')?1:0);
 }
});
test('reduced effects retain student focus, hit stop and numeric reading time',()=>{
 const normal=focusedCoopPlan(weaponPlan('STAFF','S'),'S',true),simple=focusedCoopPlan(weaponPlan('STAFF','S'),'S',true,true);
 for(const phase of ['focus','contact','damage','restore'])assert.equal(simple.find(p=>p.stage===phase).ms,normal.find(p=>p.stage===phase).ms);
 assert.ok(simple.reduce((n,p)=>n+p.ms,0)<normal.reduce((n,p)=>n+p.ms,0));
});
test('defense focus identifies actual contributors without changing shared shield accounting',()=>{
 const state={hero:{shield:27},coopRound:{contributions:[{playerId:0,damage:30,shield:0},{playerId:1,shield:20},{playerId:3,shield:7}]},actionQueue:[{playerId:1,actionType:'defense',targetGrade:'S'},{playerId:3,actionType:'defense',targetGrade:'B'}]},before=JSON.stringify(state);
 assert.deepEqual(defendingStudents(state),[{playerId:1,rank:'S'},{playerId:3,rank:'B'}]);assert.equal(JSON.stringify(state),before);
 assert.deepEqual(defendingStudents({}),[]);
});
