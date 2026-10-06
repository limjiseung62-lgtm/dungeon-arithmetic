import {SpecialNames} from './MonsterAI.js';
import {encounterStats} from './BalanceSystem.js';
import {AllMonsterData} from './MonsterRegistry.js';
import {EquipmentData,equipmentById,RarityNames} from './EquipmentData.js';
import {ScrollData,ScrollConfig} from './ScrollData.js';
import {DungeonData} from './DungeonData.js';
import {BossBattleData} from './BossBattleData.js';
import {LootTable} from './LootData.js';
import {artHTML} from './AssetManifest.js';
import {collection,collectionProgress,CollectionRewards,BossLootData} from './CollectionSystem.js';
const region=id=>id==='demonKing'?'마왕의 왕좌':id==='golem'||id==='spider'?'지하감옥 심층':DungeonData.find(d=>d.encounters.some(e=>e.enemies.some(m=>m.type===id)))?.name||'오래된 지하감옥';
const sources=(category,id)=>category==='equipment'&&equipmentById(id)?.bossOnly?BossBattleData[BossLootData.find(b=>b.item===id).boss].name+' 재도전':(category==='equipment'?'마을 상점 · ':'전투 승리 선택 · ')+[...new Set(Object.entries(LootTable).filter(([,t])=>t[category==='equipment'?'equipment':'scrolls'].includes(id)).map(([m])=>region(m)))].join(' · ');
const labels={monsters:'몬스터',equipment:'장비',scrolls:'두루마리',bossLoot:'보스 전리품'};
function monsterDetail(m,c){
 const b=BossBattleData[m.id],stats=encounterStats(AllMonsterData.findIndex(v=>v.id===m.id),1),strategy=b?.weakness||({skeleton:'방어를 쌓으며 공격 목표를 차근차근 풀어요.',goblin:'시간이 줄기 전에 식을 준비하고 방어 S로 시간 훔치기를 막아요.',orc:'숫자가 숨기기 전에 기억하고 방어 S로 저주를 막아요.',spider:'독과 봉쇄는 방어 S 또는 정화로 대응해요.'}[m.id])||'특수기 예고를 확인하고 공격과 방어를 나누어 준비해요.';
 return '<p>'+m.subtitle+'</p><p>1인 기본 HP '+stats.hp+' · 방어 '+(m.armor||0)+' · 특수 패턴 '+(b?b.patterns.flat().map(p=>p.label).filter((v,i,a)=>a.indexOf(v)===i).join(' / '):(m.specials||[]).filter(v=>v!=='none').map(v=>SpecialNames[v]||v).join(' / ')||'없음')+'</p><small>실제 HP는 전투 조합에 따라 달라져요.</small><p>공략 · '+strategy+'</p><b>처치 '+(c.defeatCounts[m.id]||0)+'회</b>'+(b?'<ol>'+b.phases.map((phase,i)=>'<li><b>'+ (i+1)+'단계 · '+phase.title+'</b><p>'+phase.hint+'</p></li>').join('')+'</ol><small>BREAK · '+b.meter+' '+b.limit+' → '+b.duration+'턴 · 피해 +35%</small>':'');
}
function entryHTML(category,item,c){
 const key=category==='bossLoot'?'equipment':category,known=c[key].includes(item.id),name=item.name;
 const hint=category==='monsters'?region(item.id):category==='bossLoot'?region(BossLootData.find(b=>b.item===item.id).boss):'모험 중 발견';
 return '<details class="collection-entry '+(known?'discovered':'undiscovered')+'" data-collection-id="'+item.id+'" data-known="'+known+'"><summary><div class="collection-art">'+(known?artHTML(item.id,{label:name}):'<span class="unknown-relic" aria-label="아직 발견하지 못한 기록">?</span>')+'</div><div><small>'+hint+'</small><h3>'+(known?name:'???')+'</h3><span>'+(known?'발견 완료 · 펼쳐 보기':'미발견')+'</span></div></summary><div class="collection-detail">'+(!known?'<p>이 지역을 탐험하면 새로운 기록을 발견할 수 있어요.</p>':category==='monsters'?monsterDetail(item,c):'<b>['+(category==='scrolls'?ScrollConfig.rarityNames[item.rarity]:RarityNames[item.rarity])+']</b><p>'+item.description+'</p><p>획득처 · '+sources(key,item.id)+'</p>'+(category==='bossLoot'?'<p>첫 처치는 기록과 일반 보상 · 이후 25% 확률, 네 번째 재처치까지 확정 · 이미 획득하면 일반 전리품만 지급</p>':''))+'</div></details>';
}
export function collectionHTML(session,header,warning){
 const p=session.data.progress,c=collection(p),v=collectionProgress(p),catalog={monsters:AllMonsterData,equipment:EquipmentData,scrolls:Object.entries(ScrollData).map(([id,s])=>({id,...s})),bossLoot:BossLootData.map(b=>equipmentById(b.item))};
 return '<main class="rpg-shell collection-shell">'+header+'<section class="collection-heading"><div class="eyebrow">바람빛 마을의 모험 기록</div><h1>📖 모험 도감</h1><p>세계를 발견하고 기록해요. 수집은 선택이에요. 장비를 팔아도 발견 기록은 남아요.</p><strong>전체 '+v.percent+'% · '+v.found+' / '+v.total+'</strong><div class="collection-progress"><i style="width:'+v.percent+'%"></i></div><small>보스 장비는 장비와 보스 전리품 양쪽에 기록됩니다. 옛 저장의 처치 횟수는 정확한 기록이 있는 이후부터 셉니다.</small></section><nav class="collection-tabs" aria-label="도감 종류">'+Object.keys(catalog).map(k=>'<a href="#collection-'+k+'">'+labels[k]+' '+v.counts[k]+'/'+v.totals[k]+'</a>').join('')+'</nav><section class="collection-rewards"><h2>작은 수집 보상</h2>'+CollectionRewards.map(r=>{const done=c.claimedCollectionRewards.includes(r.id),ready=(r.category==='percent'?v.percent:v.counts[r.category])>=r.target;return '<div><span>'+r.label+' · '+(r.gold?r.gold+'G':r.exp?r.exp+' EXP':'치유 두루마리')+'</span><button class="secondary" data-action="rpg-collection-claim" data-reward="'+r.id+'" '+(done||!ready||session.run?'disabled':'')+'>'+(done?'✓ 지급 완료':ready?'보상 받기':'발견 중')+'</button></div>';}).join('')+'</section>'+Object.entries(catalog).map(([key,items])=>'<section id="collection-'+key+'" class="collection-category"><h2>'+labels[key]+' <small>'+v.counts[key]+' / '+v.totals[key]+'</small></h2><div class="collection-grid">'+items.map(item=>entryHTML(key,item,c)).join('')+'</div></section>').join('')+warning+'</main>';
}

