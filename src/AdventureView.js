import {artHTML} from './AssetManifest.js';
import {QuestData,QuestConfig} from './QuestData.js';
import {questStatus} from './QuestSystem.js';
import {DungeonData,dungeonById} from './DungeonData.js';
import {canEnterDungeon} from './DungeonSystem.js';
import {equipmentById,RarityNames} from './EquipmentData.js';
import {ScrollData} from './ScrollData.js';
import {monsterArt} from './AssetManager.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dungeonName=id=>id==='any'?'모든 던전':dungeonById(id)?.name;
export function rewardText(r){return `⭐ ${r.exp||0} EXP · 💰 ${r.gold||0}G${r.scroll?' · 📜 '+ScrollData[r.scroll].name:''}${r.equipment?' · '+equipmentById(r.equipment).name:''}${r.unlock?' · 🌲 숲 해금':''}`;}
function questCard(q,p){
 const status=questStatus(p,q.id),v=p.questProgress[q.id]?.count||0,locked=q.prerequisites?.some(id=>!p.rewardedQuests.includes(id));
 return `<article class="quest-card status-${status}" data-quest="${q.id}"><small>${dungeonName(q.dungeon)} · ${q.difficulty}</small><h3>${q.name}</h3><p>${q.description}</p><div class="quest-count">${v} / ${q.target} <span>${status==='COMPLETED'?'완료 보고 가능!':status==='REWARDED'?'✓ 보상 받음':'목표 진행'}</span></div><div class="quest-track"><i style="width:${v/q.target*100}%"></i></div><p class="quest-reward">${rewardText(q.reward)}</p>${status==='AVAILABLE'?`<button class="primary" data-action="rpg-quest-accept" data-quest="${q.id}" ${locked||p.activeQuests.length>=QuestConfig.maxActive?'disabled':''}>${locked?'첫 번째 모험 보고 필요':'수락'}</button>`:status==='COMPLETED'?`<button class="primary" data-action="rpg-quest-report" data-quest="${q.id}">완료 보고</button>`:''}</article>`;
}
export function guildHTML(session,header,warning){
 const p=session.data.progress;
 return `<main class="rpg-shell guild-shell">${header}<section class="guild-panel">${artHTML("guild",{className:"shop-environment",eager:true})}<div class="eyebrow">모험가 길드</div><h1>이번 모험의 목표를 골라 보세요</h1><p>진행 중 의뢰 ${p.activeQuests.length} / ${QuestConfig.maxActive} · 수락한 이후의 행동만 기록됩니다. 조건을 채우면 귀환 후 보고해요.</p>${session.run?'<p class="rpg-notice">중단한 던전을 먼저 마쳐 주세요. 수락과 보고는 귀환 후 가능합니다.</p>':''}${[['COMPLETED','완료 보고'],['ACTIVE','진행 중'],['AVAILABLE','새로운 의뢰'],['REWARDED','보고한 의뢰']].map(([status,label])=>`<section class="guild-section"><h2>${label}</h2><div class="quest-grid">${QuestData.filter(q=>questStatus(p,q.id)===status).map(q=>questCard(q,p)).join('')||'<p class="empty-queue">이곳에 의뢰가 표시됩니다.</p>'}</div></section>`).join('')}</section>${warning}</main>`;
}
export function dungeonSelectorHTML(session,header,warning){
 const p=session.data.progress,run=session.run;
 return `<main class="rpg-shell dungeon-selector">${header}${run?`<div class="resume-note"><b>${dungeonName(run.dungeonId)} · ${run.pendingLoot?'받지 못한 전리품':run.status==='defeat'?'패배 후 귀환':run.status==='clear'?'클리어 후 귀환':'중단한 모험'}</b><p>현재 HP와 사용한 두루마리가 유지됩니다. 중단한 전투는 다시 시작합니다.</p><button class="primary" data-action="${run.status==='defeat'?'rpg-return':'rpg-dungeon-start'}" data-dungeon="${run.dungeonId}">모험 이어가기 →</button></div>`:''}<div class="dungeon-grid">${DungeonData.map(d=>{const unlocked=canEnterDungeon(p,d.id);return `<section class="dungeon-entry-card ${d.id==='cursed-forest'?'forest-entry':''}">${artHTML(d.id==='cursed-forest'?'forest':'prison',{className:"dungeon-landscape"})}<div class="eyebrow">권장 레벨 ${d.recommendedLevel}+ · ${d.encounters.length}개 전투</div><h1>${d.id==='cursed-forest'?'🌲':'🏚'} ${d.name}</h1><p>${d.description}</p><div class="dungeon-enemies">${[...new Set(d.encounters.flatMap(e=>e.enemies.map(e=>e.type)))].slice(0,3).map(type=>`<div>${monsterArt(type)}</div>`).join('')}</div><div class="dungeon-reward-preview">클리어 추가 보상 · ⭐ ${d.clearReward.exp} EXP · 💰 ${d.clearReward.gold}G</div><p>${unlocked?'HP와 두루마리는 다음 전투로 이어집니다.':'🔒 첫 번째 모험 보고 → 숲으로 가는 길 수락 → 두루마리 사용 → 완료 보고'}</p><button class="primary" data-action="rpg-dungeon-start" data-dungeon="${d.id}" ${!unlocked||run?'disabled':''}>${unlocked?'입장 →':'🔒 잠김'}</button></section>`;}).join('')}</div>${warning}</main>`;
}
export function questTrackerHTML(session){
 const p=session.data.progress,ids=[...p.activeQuests,...p.completedQuests];
 return `<details class="quest-tracker"><summary>📜 퀘스트 · ${p.activeQuests.length}개 진행 중 · ${p.completedQuests.length}개 보고 가능</summary><div>${ids.map(id=>{const q=QuestData.find(q=>q.id===id);return `<span>${q.name} <b>${p.questProgress[id].count}/${q.target} ${p.completedQuests.includes(id)?'✓ 보고 가능':''}</b></span>`;}).join('')||'<span>길드에서 의뢰를 수락해 주세요.</span>'}</div><small role="status">${esc(session.questNotice)}</small></details>`;
}
export function dropsHTML(drops){
 if(!drops)return '';
 return `<section class="loot-summary"><h3>전리품 획득!</h3><div><span>💰 ${drops.gold}G</span>${drops.scrolls.map(type=>`<span>${artHTML(type,{label:ScrollData[type].name})}${ScrollData[type].name}</span>`).join('')}${drops.equipment.map(id=>{const e=equipmentById(id);return `<span class="drop-${e.rarity}">${artHTML(e.id,{label:e.name})} ${e.name} [${RarityNames[e.rarity]}]</span>`;}).join('')}</div><small>가방에 지급 완료 · 골드는 위 전투 보상과 같습니다.</small></section>`;
}
