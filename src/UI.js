import {EncounterData,livingEnemies,syncEncounter,intentText} from './EncounterData.js';
import {encounterStats} from './BalanceSystem.js';
import {displayText} from './LocalizedText.js';
import {createState} from './GameState.js';
import {GameConfig as config} from './GameConfig.js';
import {CombatSystem} from './CombatSystem.js';
import {MonsterData} from './MonsterData.js';
import {ScrollConfig,ScrollData} from './ScrollData.js';
import {rewardScroll,generateLoot} from './ScrollSystem.js';
import {SpecialNames} from './MonsterAI.js';
import {TimerSystem} from './TimerSystem.js';
import {monsterArt,equipment} from './AssetManager.js';
import {actionLabel} from './ActionQueue.js';
import {createPads,inputDice,inputOperator,eraseInput,resetPad,previewPad} from './InputPadSystem.js';
import {BattleDirector} from './BattleDirector.js';
import {AudioManager} from './AudioManager.js';
import {SequencePlayer,DialogueSystem,MonsterSpecialSequence,PresentationTiming} from './Presentation.js';
import {VisualEffects} from './VisualEffects.js';
const app=document.querySelector('#app'),dev=new URLSearchParams(location.search).get('debug')==='1';
let screen='title',players=2,mode='sequential',storyIndex=0,state=null,combat=null,pads=[],rolling=false;
let settingsOpen=false,debugOpen=false,selection=null,rollHandle=null,director=null,lastSaved=null,sequence=null,presentationPhase="idle",seenSpecial=null,lowHPSeen=false;
let sound=true,hints=true,animationScale=1,reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches,scrollChoice=null,targetScrollChoice=null;const specialHistory=new Map();
try{const prefs=JSON.parse(localStorage.getItem('dungeon-settings')||'{}');sound=prefs.sound??true;hints=prefs.hints??true;reducedMotion=prefs.reducedMotion??reducedMotion;}catch{}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const timer=new TimerSystem(onTick),effects=new VisualEffects(beep);
const story=[['✧','어느 평범한 교실에서…','"아! 수학 너무 싫어!"\n"사칙연산 같은 거 안 하면 안 돼?"\n그 순간, 교실이 눈부시게 빛났습니다.'],['♜','마왕의 던전에 오신 것을 환영한다','"수학이 싫다고? 그렇다면 살아남아 보아라!"\n"몬스터들을 쓰러뜨리지 못한다면\n원래 세계로 돌아갈 수 없다!"'],['⚔','네 친구의 힘이 하나로 연결되었다','용사 한 명의 힘을 함께 나눠 쓰세요.\n계산에 성공하면 행동이 예약됩니다.\n모두의 준비가 끝나면 함께 싸웁니다!']];
const audio=new AudioManager();
try{const prefs=JSON.parse(localStorage.getItem('dungeon-audio')||'{}');for(const key of Object.keys(audio.channels))if(prefs[key])audio.configure(key,prefs[key]);}catch{}
function beep(kind='tap',options={}){if(sound)audio.play(kind,options);}
function presentationStage(phase){if(phase==='special-intro')effects.clear();presentationPhase=phase;const shell=document.querySelector('.game-shell');if(shell)shell.dataset.presentation=phase;document.querySelector('.battle-stage')?.classList.toggle('special-focus',phase.startsWith('special'));}
function newSequence(){sequence?.cancel();sequence=new SequencePlayer({scale:()=>animationScale,stage:presentationStage,sound:beep});return sequence;}
function skipPresentation(){sequence?.skip();director?.skip();}
function presentationControls(){if(!document.querySelector('.presentation-controls'))document.querySelector('.battle-stage')?.insertAdjacentHTML('beforeend','<div class="presentation-controls"><button data-action="dialogue-next">다음 ▷</button><button data-action="presentation-skip">연출 건너뛰기</button></div>');}
function cancel(){if(targetScrollChoice){targetScrollChoice.resolve(null);targetScrollChoice=null;}if(scrollChoice){scrollChoice.resolve(null);scrollChoice=null;}document.querySelectorAll('.scroll-choice-overlay,.target-scroll-overlay,.edit-target-overlay').forEach(e=>e.remove());sequence?.cancel();sequence=null;presentationPhase="idle";timer.stop();clearTimeout(rollHandle);director?.cancel();director=null;effects.clear();}
function title(){cancel();audio.playBGM('dungeon');state=null;settingsOpen=false;screen='title';render();}
function startGame(){cancel();state=createState(players,mode);combat=new CombatSystem(state);if(!(dev&&new URLSearchParams(location.search).has('legacy')))combat.configureEncounter(0);specialHistory.clear();screen='battle';settingsOpen=false;lastSaved=null;beginTurn();}
async function beginTurn(alreadyStarted=false){timer.stop();selection=null;if(!alreadyStarted)combat.startTurn();pads=createPads(state.players);rolling=state.phase==='playing';seenSpecial=null;render();
 if(!rolling){runResolution();return;}const current=state,p=newSequence(),dialogue=new DialogueSystem(p,audio);presentationControls();presentationStage('encounter');audio.setMood('input');audio.playBGM(state.monsterIndex===4?'boss':state.enemyTurn===1?'dungeon':'battle');
 if(state.enemyTurn===1){lowHPSeen=false;await dialogue.show(MonsterData[state.monsterIndex].dialogues.encounter);}if(p.cancelled||state!==current)return;
 presentationStage('turn-start');effects.show({kind:'turn-end',text:`${state.turn}턴 · 제한시간 ${state.duration}초`});beep('roll');await p.wait(PresentationTiming.turn);if(p.cancelled||state!==current)return;
 effects.clear();rolling=false;presentationStage('input');render();audio.setMood('input');timer.start(state.duration);
}
function render(){
 if(screen==='title')app.innerHTML=`<main class="start-screen v2-start"><div class="start-content"><div class="eyebrow">하나의 용사 · 한 팀으로 떠나는 모험</div><h1>던전탈출<span>사칙연산</span></h1><p>세 개의 주사위로 함께 준비하고,<br>마법과 검으로 던전을 돌파하세요.</p><div class="start-sigil">${equipment('shield')}</div><button class="primary" data-action="setup">게임 시작 →</button><div class="start-tags"><span>1–4인 로컬 협동</span><span>태블릿 / 전자칠판</span><span>1인칭 던전 전투</span></div></div></main>`;
 else if(screen==='setup')app.innerHTML=`<main class="start-screen v2-start"><section class="setup-card"><div class="eyebrow" style="color:#85724d">함께 모험할 준비</div><h2 style="margin-top:12px">어떻게 함께 플레이하나요?</h2><p>하나의 용사, 하나의 공동 타이머.<br>함께 계산하고 행동을 예약하세요.</p><div class="mode-choices"><button data-mode="sequential" class="${mode==='sequential'?'active':''}" aria-pressed="${mode==='sequential'}"><b>📱 태블릿 순차 플레이</b><small>큰 패드 하나로 1P → 2P → 3P → 4P</small></button><button data-mode="simultaneous" class="${mode==='simultaneous'?'active':''}" aria-pressed="${mode==='simultaneous'}"><b>🖥 전자칠판 동시 플레이</b><small>각자 독립 패드로 동시에 준비</small></button></div><div class="number-choices">${[1,2,3,4].map(n=>`<button class="${players===n?'active':''}" data-players="${n}" aria-pressed="${players===n}">${n}<small>${n===1?'혼자 모험':'명 함께'}</small></button>`).join('')}</div><button class="primary" data-action="story">던전으로 출발 →</button><div style="margin-top:12px"><button class="edit-key" data-action="title">돌아가기</button></div></section></main>`;
 else if(screen==='story'){const [symbol,heading,copy]=story[storyIndex];app.innerHTML=`<main class="story-screen v2-start"><section class="story-card"><div class="story-symbol">${symbol}</div><h2>${heading}</h2><div class="story-copy">${copy}</div><div class="story-controls"><button class="skip" data-action="start">건너뛰고 전투 시작</button><span class="story-progress">${storyIndex+1} / 3</span><button class="primary" data-action="story-next">${storyIndex===2?'첫 번째 전투 →':'다음 →'}</button></div></section></main>`;}
 else renderBattle();
 if(settingsOpen)app.insertAdjacentHTML('beforeend',settingsHTML());
}
function targetHTML(t){
 const cursed=state.curse&&(!state.blockReserved||state.enemies)&&['S','A'].includes(t.grade)&&!t.used;
 const hinted=hints&&state.seconds<=config.hintSeconds&&t.solution.ids.length===3&&!t.used;
 return `<button class="combat-target ${t.side} mark-${t.position} ${t.used?'claimed':''} ${cursed?'cursed':''} ${hinted?'hinted':''} ${selection===t.id?'selected':''}" data-target="${t.id}" data-grade="${t.grade}" ${t.used?'disabled':''} aria-label="${t.side==='attack'?'공격':'방어'} ${t.grade} ${cursed?'가려진 숫자':t.value}${t.used?` ${t.claimedBy+1}P 예약 완료`:''}"><small>${t.side==='attack'?'⚔':'🛡'} ${t.grade}</small><strong>${cursed?'?':t.value}</strong><span>${t.used?`${t.claimedBy+1}P ✓`:hinted?'◆ ◆ ◆':''}</span></button>`;
}
function queueHTML(){return state.actionQueue.length?state.actionQueue.map(a=>`<li class="queue-item ${a.status}" data-order="${a.order}"><span class="queue-player p${a.playerId}">${a.playerId+1}P</span><span>${actionLabel(a)}${a.enemyName?` → ${escape(a.enemyName)}`:''}</span>${a.actionType==='attack'&&state.phase==='playing'&&livingEnemies(state).length>1&&!state.choices?.[a.playerId]?`<button class="target-edit" data-action="change-target" data-player-id="${a.playerId}">대상 변경</button>`:''}<i>${a.status==='resolved'?'✓':a.status==='cancelled'?'취소':'·'}</i></li>`).join(''):'<li class="empty-queue">함께 작전을 준비하세요.<br>계산에 성공하면 여기에 쌓여요.</li>';}
function enemyCards(){return state.enemies.map((e,i)=>`<article class="enemy-card ${e.hp===0?'fallen':''}" data-enemy-id="${e.id}" data-index="${i}"><header><b>${escape(e.name)}</b><span data-enemy-hp>${e.hp} / ${e.maxHP}</span></header><div class="hp-track"><div class="hp-fill" data-enemy-bar style="width:${e.hp/e.maxHP*100}%"></div></div><div class="enemy-body"><div class="enemy-shadow"></div>${monsterArt(e.type)}</div><div class="enemy-plan"><b>⚔ 일반 공격 ${e.intent?.attack||0}</b><span>${escape(intentText(e))}</span><small>${e.enrage?'⚠ 강화 '+e.enrage+'단계':'기본 상태'}${e.weaken?' · 공격 약화':''}</small><em data-enemy-badges>${state.actionQueue.filter(a=>a.enemyId===e.id&&['attack','block'].includes(a.actionType)).map(a=>`${a.playerId+1}P ${a.actionType==='block'?'✨ 차단':'⚔'}`).join(' · ')}</em></div></article>`).join('');}
function targetChoiceHTML(playerId,choice){const enemies=livingEnemies(state).filter(e=>choice.kind==='attack'||e.intent.special!=='none');return `<div class="player-target-choice" role="group" aria-label="${playerId+1}P 대상 선택"><b>${choice.kind==='block'?'막을 특수 공격을 선택하세요!':'공격할 몬스터를 선택하세요!'}</b><small>계산 시간은 잠시 멈춥니다.</small><div>${enemies.map(e=>`<button data-action="choose-target" data-player-id="${playerId}" data-enemy="${e.id}">${escape(e.name)}<small>${choice.kind==='block'?escape(intentText(e)):`HP ${e.hp} · 검 피해 ${Math.max(1,config.attack[choice.actions[0]?.targetGrade||'A']-MonsterData[e.monsterIndex].armor)}`}</small></button>`).join('')}</div></div>`;}
function syncChoiceTimer(){if(combat.awaitingChoices())timer.pause();else if(state.phase==='playing'&&!rolling&&!document.querySelector('.inventory-overlay'))timer.resume();}
function chooseScrollEnemy(action){const alive=livingEnemies(state);if(alive.length<=1){if(alive[0])combat.chooseScrollTarget(action,alive[0].id);return Promise.resolve();}return new Promise(resolve=>{targetScrollChoice={action,resolve};const host=document.createElement('div');host.className='overlay target-scroll-overlay';host.innerHTML=`<section class="modal"><h2>${action.scrollEffect==='lightning'?'번개를 시작할 몬스터를 선택하세요!':'공격할 몬스터를 선택하세요!'}</h2><p>계산 시간은 흐르지 않아요.</p><div class="scroll-cards">${alive.map(e=>`<button class="scroll-card" data-action="scroll-target" data-enemy="${e.id}"><strong>${escape(e.name)}</strong><p>HP ${e.hp} / ${e.maxHP}</p></button>`).join('')}</div></section>`;app.append(host);host.querySelector('button')?.focus();});}
function renderBattle(){
 const s=state,m=MonsterData[s.monsterIndex],resolving=s.phase==='resolution'||s.phase==='enemy';
 const active=s.phase==='playing'&&!rolling;
 app.innerHTML=`<main class="game-shell ${s.mode==='simultaneous'?'board':'tablet'} ${resolving?'cinematic':''}" data-phase="${s.phase}"><header class="game-header"><div class="brand"><span>⚔</span>던전탈출 사칙연산</div><div class="journey">${(s.enemies?EncounterData:MonsterData).map((item,i)=>`<span class="${i===(s.encounterIndex??s.monsterIndex)?'current':i<(s.encounterIndex??s.monsterIndex)?'done':''}">${i<(s.encounterIndex??s.monsterIndex)?'✓':i+1}<small>${item.name}</small></span>`).join('<i></i>')}</div><div class="top-actions"><button class="icon-button" data-action="sound">${sound?'♪ 효과음 켜짐':'♪ 효과음 꺼짐'}</button><button class="icon-button" data-action="settings">⚙ 규칙</button>${dev?'<button class="icon-button" data-action="debug-toggle">DEBUG</button>':''}</div></header>
 <section class="battle-heading"><div><div class="eyebrow">던전 ${String((s.encounterIndex??s.monsterIndex)+1).padStart(2,'0')} / ${s.enemies?'06':'05'} · ${s.mode==='simultaneous'?'동시 준비':'순차 준비'}</div><h1>${s.encounter?.name||m.name}</h1></div><div class="enemy-hp"><div><span>${s.enemies?`남은 적 ${livingEnemies(s).length}마리`:m.subtitle}</span><b id="monster-hp-text">${s.monsterHP} / ${s.monsterMaxHP}</b></div><div class="hp-track"><div id="monster-hp-bar" class="hp-fill" style="width:${Math.min(100,s.monsterHP/s.monsterMaxHP*100)}%"></div></div></div><div class="shared-clock"><span>턴 <b>${String(s.turn).padStart(2,'0')}</b></span><div class="timer" id="timer" role="timer"><b id="seconds">${resolving?'⚔':String(s.seconds).padStart(2,'0')}</b><small>${resolving?'전투':'초 · 공동'}</small></div></div></section>
 <section class="battle-stage ${s.monsterHP<=s.monsterMaxHP*.5?'wounded':' '} ${s.hero.poison?'poisoned':''}" aria-label="용사의 1인칭 던전 전투" data-effect="idle"><div class="stage-shade"></div><div class="stage-mist"></div>${s.enemies?`<div class="enemy-roster" id="monster" data-count="${s.enemies.length}">${enemyCards()}</div>${!resolving?`<div class="shared-attack-targets">${s.targets.filter(t=>t.side==='attack').sort((a,b)=>a.position-b.position).map(targetHTML).join('')}</div>`:''}`:`<div class="enemy-presence" id="monster"><div class="enemy-shadow"></div>${monsterArt(m.id)}${!resolving?s.targets.filter(t=>t.side==='attack').map(targetHTML).join(''):''}</div>`}<div class="foreground-shield">${equipment('shield')}</div><div class="foreground-sword">${equipment('sword')}</div>
 ${!resolving?`<div class="enemy-intent ${s.enemies?'multi-intent-summary':''}"><small>적의 다음 행동</small><strong>⚔ 일반 공격 ${s.enemies?livingEnemies(s).reduce((n,e)=>n+e.intent.attack,0):s.intent.attack}</strong><span>${s.enemies?'각 적의 행동 예고를 확인하세요':s.blockReserved&&s.intent.special!=='none'?'✨ 특수 차단 예약됨':SpecialNames[s.intent.special]}</span></div><aside class="action-ledger"><div class="eyebrow">예약한 행동</div><h2>이번 턴 행동 <span>${s.actionsDone.filter(Boolean).length}/${s.players}</span></h2><ol>${queueHTML()}</ol></aside><div class="defense-targets"><div class="defense-caption">🛡 방어 목표</div><div>${s.targets.filter(t=>t.side==='defense').sort((a,b)=>a.position-b.position).map(targetHTML).join('')}</div></div><div class="battle-guidance">⚔ 공통 목표를 해결한 뒤 공격 대상을 고르세요</div>`:`<div class="cinematic-top"><div class="eyebrow">우리 팀의 전투</div><h2 id="current-action">함께 준비한 힘을 펼칩니다</h2></div><div class="cinematic-queue"><ol id="resolution-queue">${queueHTML()}</ol></div>`}</section>
 <section class="team-hud"><div class="hero-health"><div><b>♥ 공동 HP</b><span id="hero-hp-text">${s.hero.hp} / ${config.heroHP}</span></div><div class="hp-track"><div id="hero-hp-bar" class="hp-fill" style="width:${s.hero.hp/config.heroHP*100}%"></div></div></div><div class="shield-value">🛡 방어막 <b id="shield-value">${s.hero.shield}</b></div><button class="scroll-summary icon-button" data-action="inventory" aria-label="보유 두루마리 정보">${s.scrolls.map(slot=>`${ScrollData[slot.type].icon} ×${slot.uses}`).join(' · ')||'📜 없음'}</button><label class="scroll-label">📜<select id="scroll-select" class="scroll-select" aria-label="공동 스크롤 선택" ${!s.scrolls.length||!active?'disabled':''}>${s.scrolls.length?s.scrolls.map((slot,i)=>`<option value="${i}" ${i===s.scrollIndex?'selected':''}>${ScrollData[slot.type].name} · ${slot.uses}회</option>`).join(''):'<option>스크롤 없음</option>'}</select></label><div class="team-status" id="team-status">${s.hero.poison?`☠ 독 ${s.hero.poison}턴`:s.specialBlocked?'✨ 특수 차단':'하나의 용사 · 함께 싸워요'}</div></section>
 ${!resolving?`<section class="pad-deck ${s.mode==='simultaneous'?'multi-pad':'single-pad'}" aria-label="${s.mode==='simultaneous'?'플레이어별 독립 입력 패드':'공용 순차 입력 패드'}">${(s.mode==='simultaneous'?Array.from({length:s.players},(_,i)=>i):[Math.max(0,s.player)]).map(padHTML).join('')}</section><footer class="game-tip"><span>${rolling?'주사위를 굴리는 중…':'성공은 예약! 모든 준비가 끝나면 전투가 시작됩니다.'}</span><span>${hints&&s.seconds<=30?'◆ ◆ ◆ = 주사위 세 개 힌트':'왼쪽 → 오른쪽 계산 · 공동 60초'}</span></footer>`:'<footer class="cinematic-footer">우리의 공격을 순서대로 해결합니다 · 공격 S는 스크롤까지!</footer>'}</main>`;
 if(!resolving)for(let i=0;i<s.players;i++)updatePad(i);
 if(dev&&debugOpen)app.insertAdjacentHTML('beforeend',debugHTML());
 if(s.mode==='sequential')for(const [id,choice]of Object.entries(s.choices||{}))if(choice.editing)app.insertAdjacentHTML('beforeend',`<div class="overlay edit-target-overlay"><section class="modal target-edit-modal"><h2>${Number(id)+1}P 공격 대상 변경</h2>${targetChoiceHTML(Number(id),choice)}</section></div>`);
 if(['reward','clear','gameover'].includes(s.phase))app.insertAdjacentHTML('beforeend',resultHTML());
}
function padHTML(playerId){
 const s=state,done=s.actionsDone[playerId],block=(s.blockedList||[]).find(b=>b.slot===playerId)|| (s.blocked?.slot===playerId?s.blocked:null),blocked=!!block;
 return `<section class="input-pad p${playerId} ${done?'done':''} ${blocked?block.type:''}" data-player="${playerId}"><div class="pad-title"><b>${s.mode==='sequential'?`${playerId+1}P 차례 · ${s.players}명`:`${playerId+1}P`}</b><span>${blocked?(block.type==='web'?'거미줄에 묶였습니다.':'석화되었습니다.'):done?'준비 완료 ✓':s.mode==='simultaneous'?'동시에 계산 중':'당신의 차례'}</span>${s.mode==='sequential'?`<div class="pad-players">${Array.from({length:s.players},(_,i)=>`<i class="${s.actionsDone[i]?'complete':''} ${s.blocked?.slot===i?s.blocked.type:''} ${i===playerId?'current':''}">${i+1}P</i>`).join('')}</div>`:''}</div><div class="pad-expression" data-expression></div><div class="pad-steps" data-steps></div><div class="pad-keys"><div class="pad-dice">${s.dice.map((n,i)=>`<button class="dice-button" data-dice="${i}" aria-label="${playerId+1}P ${config.diceSides[i]}면 주사위 ${n}"><small>${config.diceSides[i]}면</small>${n}</button>`).join('')}</div><div class="pad-operators">${['+','−','×','÷'].map(op=>`<button class="operator-button" data-op="${op}" aria-label="${playerId+1}P ${op}">${op}</button>`).join('')}</div><div class="pad-tools"><button data-action="erase">⌫ 지우기</button><button data-action="reset">초기화</button></div><div class="pad-submit"><button data-action="submit">${done?'예약 완료 ✓':'제출 →'}</button><button data-action="pass">넘기기</button></div></div><div class="pad-message" data-message role="status"></div>${s.choices?.[playerId]?targetChoiceHTML(playerId,s.choices[playerId]):''}</section>`;
}
function updatePad(playerId){
 const root=document.querySelector(`.input-pad[data-player="${playerId}"]`);if(!root)return;
 const pad=pads[playerId],s=state,done=s.actionsDone[playerId],active=s.phase==='playing'&&!rolling&&!done&&!s.choices?.[playerId]&&(s.mode==='simultaneous'||s.player===playerId),preview=previewPad(pad,s.dice);
 root.querySelector('[data-expression]').textContent=preview.expression||(done?'✓ 준비 완료':'주사위를 눌러 시작하세요');
 root.querySelector('[data-expression]').classList.toggle('empty',!preview.expression);
 root.querySelector('[data-steps]').textContent=preview.steps||'최소 2개 · 주사위는 한 번씩';
 root.querySelector('[data-message]').textContent=pad.message;root.querySelector('[data-message]').classList.toggle('error',pad.error);
 root.querySelectorAll('[data-dice]').forEach(b=>{const used=pad.ids.includes(Number(b.dataset.dice));b.classList.toggle('used',used);b.disabled=!active||used||pad.ids.length===3||(pad.ids.length>0&&pad.pending===null);});
 root.querySelectorAll('[data-op]').forEach(b=>{b.classList.toggle('selected',pad.pending===b.dataset.op);b.disabled=!active||pad.ids.length===0||pad.ids.length===3;});
 root.querySelector('[data-action="submit"]').disabled=!active||pad.ids.length<2||pad.pending!==null;
 root.querySelectorAll('[data-action="erase"],[data-action="reset"],[data-action="pass"]').forEach(b=>b.disabled=!active);
}
function submitPad(playerId){
 const pad=pads[playerId];if(rolling||pad.pending!==null||pad.ids.length<2)return;
 try{const e=combat.submit(pad.ids,pad.ops,playerId);pad.message=`${e.expression} = ${e.value} · 예약 완료`;pad.error=false;beep('reserved');syncChoiceTimer();render();if(state.phase==='resolution')runResolution();}
 catch(err){beep("wrong");pad.message=err.message;pad.error=true;updatePad(playerId);}
}
function scrollCard(type,index,action){const d=ScrollData[type],slot=state.scrolls[index];return `<button class="scroll-card rarity-${d.rarity}" data-action="${action}" data-scroll="${index}" data-type="${type}"><span>${d.icon}</span><small>${ScrollConfig.rarityNames[d.rarity]}</small><strong>${d.name}</strong><p>${d.description}</p><b>${action==='loot-choice'?d.uses:slot?.uses}회</b></button>`;}
function selectScroll(action){timer.stop();return new Promise(resolve=>{scrollChoice={action,resolve};const host=document.createElement('div');host.className='overlay scroll-choice-overlay';host.innerHTML=`<section class="modal scroll-choice" role="dialog" aria-modal="true" aria-label="사용할 두루마리를 선택하세요"><div class="eyebrow">공격 S · 팀 공용 자원</div><h2>사용할 두루마리를 선택하세요!</h2><p>계산 시간은 흐르지 않아요. 함께 의논하세요.</p><div class="scroll-cards">${state.scrolls.map((s,i)=>scrollCard(s.type,i,'cast-choice')).join('')}</div><button class="secondary" data-action="cast-skip">이번에는 사용하지 않기</button></section>`;app.append(host);host.querySelector('button')?.focus();});}
function runResolution(){
 if(state.phase!=='resolution'||director)return;
 timer.stop();rolling=false;settingsOpen=false;render();const p=newSequence(),dialogue=new DialogueSystem(p,audio);presentationControls();presentationStage('battle');audio.setMood('battle');audio.playBGM(state.monsterIndex===4?'boss':'battle');
 director=new BattleDirector(combat,{effects:event=>{document.documentElement.style.setProperty('--swing-time',`${.3*animationScale}s`);effects.show(event);},update:updateResolution,scale:()=>animationScale,audio,selectScroll:async action=>{const index=await selectScroll(action);combat.chooseScroll(action,index);if(index!==null&&state.enemies&&(['SINGLE_ENEMY','RANDOM_ENEMIES'].includes(action.targetType)||action.scrollEffect==='meteor'))await chooseScrollEnemy(action);},beforeEnemy:async()=>{presentationStage("monster-attack");if(!state.enemies&&state.enemyTurn%3===0)await dialogue.show(MonsterData[state.monsterIndex].dialogues.attack);},
 special:async commit=>{const actor=combat.currentEnemy(),view=actor?{...state,intent:actor.intent}:state,blocked=actor?state.blockedIds.has(actor.id)||state.scrollStop:state.specialBlocked;if(!actor&&seenSpecial===blocked){commit();return;}const key=`${actor?.monsterIndex??state.monsterIndex}:${view.intent.special}:${Math.min(3,1+Math.floor((state.enemyTurn-1)/4))}`;const compact=specialHistory.has(key);specialHistory.set(key,true);await new MonsterSpecialSequence(p,dialogue,audio).play({state:view,monster:MonsterData[actor?.monsterIndex??state.monsterIndex],blocked,commit,compact:compact||!!state.enemies&&state.enemies.length>1});presentationStage("battle");},
 dialogue:async event=>{const m=MonsterData[state.monsterIndex];if(event.kind==='victory'){audio.playBGM('victory');await dialogue.show(m.dialogues.defeat);}else if(event.kind==='gameover')audio.playBGM('gameover');else if(event.kind==='attack'&&!lowHPSeen&&state.monsterHP>0&&state.monsterHP<state.monsterMaxHP*.5){lowHPSeen=true;await dialogue.show(m.dialogues.lowHP);}},finish:()=>{
   director=null;effects.clear();saveResult();if(state.phase==='enemy')beginTurn();else render();
 }});director.run().catch(err=>{console.error(err);director=null;});
}
function updateEnemyCards(event){if(!state.enemies)return;for(const e of state.enemies){const card=document.querySelector(`[data-enemy-id="${e.id}"]`);if(!card)continue;card.querySelector('[data-enemy-hp]').textContent=`${e.hp} / ${e.maxHP}`;card.querySelector('[data-enemy-bar]').style.width=`${e.hp/e.maxHP*100}%`;card.classList.toggle('fallen',e.hp===0);card.querySelector('.enemy-plan>b').textContent=`⚔ 일반 공격 ${state.scrollStop?0:Math.round(e.intent.attack*(1-(e.weaken||0)))}`;card.querySelector('.enemy-plan>small').textContent=(e.enrage?'⚠ 강화 '+e.enrage+'단계':'기본 상태')+(e.weaken?' · 공격 약화':'');card.querySelector('[data-enemy-badges]').textContent=state.blockedIds.has(e.id)?'✨ 이번 특수 공격 차단':'';}}
function updateResolution(event){
 presentationStage(({attack:'player-resolution',magic:'player-resolution',defense:'player-resolution',barrier:'player-resolution',enemy:'monster-attack',poison:'status-effect',total:'total',victory:'victory','turn-end':'turn-end',block:'special-block'}[event.kind])||presentationPhase);
 const s=state,m=MonsterData[s.monsterIndex];
 document.querySelector('#monster-hp-text').textContent=`${s.monsterHP} / ${s.monsterMaxHP}`;updateEnemyCards(event);document.querySelector('#monster-hp-bar').style.width=`${Math.min(100,s.monsterHP/s.monsterMaxHP*100)}%`;
 document.querySelector('#hero-hp-text').textContent=`${s.hero.hp} / ${config.heroHP}`;document.querySelector('#hero-hp-bar').style.width=`${s.hero.hp/config.heroHP*100}%`;document.querySelector('#shield-value').textContent=s.hero.shield;
 document.querySelector('#current-action').textContent=displayText(event.retargeted||event.text);
 document.querySelector('#resolution-queue').innerHTML=queueHTML();
 const current=document.querySelector(`#resolution-queue [data-order="${event.action?.order}"]`);current?.classList.add('now');current?.scrollIntoView({block:'nearest'});
 document.querySelector('#team-status').textContent=s.hero.poison?`☠ 독 ${s.hero.poison}턴`:s.specialBlocked?'✨ 특수 차단 완료':'모두의 준비가 하나의 힘으로';
 const select=document.querySelector('#scroll-select');select.innerHTML=s.scrolls.length?s.scrolls.map((slot,i)=>`<option value="${i}" ${i===s.scrollIndex?'selected':''}>${ScrollData[slot.type].name} · ${slot.uses}회</option>`).join(''):'<option>스크롤 없음</option>';
}
async function onTick(seconds){
 if(screen!=='battle'||state?.phase!=='playing'||rolling)return;
 const danger=state.enemies?livingEnemies(state).find(e=>['curse','shift'].includes(e.intent.special)&&!state.blockReservedIds.has(e.id)):null;const special=danger?.intent.special||state.intent.special;
 if(state.duration-seconds>=config.curseSeconds&&['curse','shift'].includes(special)&&seenSpecial===null&&!combat.awaitingChoices()){
  timer.pause();rolling=true;for(let i=0;i<state.players;i++)updatePad(i);const current=state,p=newSequence(),dialogue=new DialogueSystem(p,audio),blocked=danger?state.blockReservedIds.has(danger.id):state.blockReserved;seenSpecial=blocked;presentationControls();
  await new MonsterSpecialSequence(p,dialogue,audio).play({state:danger?{...state,intent:danger.intent}:state,monster:MonsterData[danger?.monsterIndex??state.monsterIndex],blocked,commit:()=>{if(!p.cancelled)combat.timeUpdate(seconds);}});
  if(p.cancelled||state!==current)return;rolling=false;presentationStage('input');render();audio.setMood('input');syncChoiceTimer();return;
 }
 const previous={curse:state.curse,shift:state.shifted,hint:state.seconds<=30};combat.timeUpdate(seconds);
 if(seconds<=10&&seconds%5===0&&state.warningSecond!==seconds){state.warningSecond=seconds;beep('warning');}
 if(state.phase==='resolution'){runResolution();return;}
 if(previous.curse!==state.curse||previous.shift!==state.shifted||previous.hint!==(seconds<=30))render();
 else{document.querySelector('#seconds').textContent=String(seconds).padStart(2,'0');document.querySelector('#timer').classList.toggle('low',seconds<=15);}
}
function settingsHTML(){return `<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-label="설정과 게임 규칙"><div class="eyebrow">계산하고 · 예약하고 · 함께 전투</div><h2>함께 모험하는 방법</h2><label class="settings-row">화면 흔들림 감소<input id="motion-toggle" type="checkbox" ${reducedMotion?'checked':''}></label><label class="settings-row">30초 주사위 개수 힌트<input id="hint-toggle" type="checkbox" ${hints?'checked':''}></label>${['BGM','SFX'].map(key=>`<label class="settings-row">${key==='BGM'?'배경음악':'효과음'}<input data-audio-toggle="${key}" type="checkbox" ${audio.channels[key].enabled?'checked':''}></label><label class="settings-row">${key==='BGM'?'배경음악':'효과음'} 음량<input data-audio-volume="${key}" type="range" min="0" max="1" step=".05" value="${audio.channels[key].volume}"></label>`).join('')}<div class="guide">① 주사위 2개 또는 3개를 한 번씩 사용해요.<br>② 누른 순서대로 왼쪽에서 오른쪽으로 계산해요.<br>③ 공격·방어 목표를 만들면 <b>행동이 예약</b>돼요.<br>④ 모두 끝나거나 시간이 다 되면 함께 싸워요.<br>⑤ 공격 S는 A급 검격 뒤 두루마리를 선택하거나 아껴둬요.<br>⑥ 방어 S는 방어막 + 선택한 적의 특수능력 하나 차단.<br>공격 대상을 먼저 쓰러뜨리면 그 적의 행동이 취소됩니다.<br>⑦ 일반 공격은 방어막 → HP 순서로 처리해요.<br><br>동시 모드에서는 먼저 제출한 친구가 목표를 잠가요.<br>잠긴 목표에 실패해도 행동권은 남아요.<br><small>설정을 보는 동안에도 공동 타이머는 흐릅니다.</small></div><div class="modal-actions"><button class="secondary" data-action="title">타이틀로</button><button class="primary" data-action="settings-close">계속하기 →</button></div></section></div>`;}
function resultHTML(){
 const s=state,m=MonsterData[s.monsterIndex];
 if(s.phase==='reward'||(s.phase==='clear'&&!s.lootChosen)){return `<div class="overlay"><section class="modal reward-modal" role="dialog" aria-modal="true" aria-label="전투 승리"><div class="medal">✦</div><div class="eyebrow">함께 이룬 승리</div><h2>${s.enemies?`${s.encounter?.name||m.name} · 전투 승리!`:`${m.name} 격파!`}</h2><p>우리의 준비가 하나의 힘이 되었습니다.</p><h3>전리품 · 세 가지 중 하나를 선택하세요</h3><div class="scroll-cards loot-cards">${s.lootChosen?`<div class="reward-scroll rarity-${ScrollData[s.lootAcquired].rarity}">${ScrollData[s.lootAcquired].icon} ${ScrollData[s.lootAcquired].name} 획득!</div>`:s.lootCandidates.map((type,i)=>scrollCard(type,i,'loot-choice')).join('')}</div><p>공동 HP ${s.hero.hp} · 방어막 ${s.hero.shield}<br>HP는 이어지고 다음 전투의 방어막은 0이 됩니다.</p><div class="modal-actions"><button class="primary" data-action="next-monster" ${!s.lootChosen?'disabled':''}>${s.enemies?EncounterData[s.encounterIndex+1]?.name:MonsterData[s.monsterIndex+1]?.name||'모험 결과'} 만나러 가기 →</button></div></section></div>`;}
 const clear=s.phase==='clear';return `<div class="overlay"><section class="modal reward-modal" role="dialog" aria-modal="true" aria-label="팀 결과"><div class="medal">${clear?'✧':'♜'}</div><div class="eyebrow">우리 팀의 모험</div><h2>${clear?'던전 탐험 성공!':'게임 오버'}</h2><p>${clear?'골렘을 쓰러뜨리고 마지막 문을 열었습니다.<br>하지만 던전 깊은 곳에서 더욱 강력한 기운이 느껴진다…':'우리 용사가 잠시 쓰러졌어요.<br>함께 작전을 세우고 다시 도전해 보세요.'}</p><div class="records"><div><b>${s.stats.turns}</b>총 턴</div><div><b>${s.stats.blocks}</b>특수 차단</div><div><b>${s.stats.scrolls}</b>스크롤 사용</div><div><b>${s.hero.hp}</b>남은 HP</div></div><div class="grade-record">⚔ 팀 공격 ${['S','A','B','C'].map(g=>`${g} ${s.stats.attack[g]}회`).join(' · ')}<br>🛡 팀 방어 ${['S','A','B','C'].map(g=>`${g} ${s.stats.defense[g]}회`).join(' · ')}</div><p style="margin-top:12px;font-size:10px">이번 팀 기록은 이 브라우저에 저장됩니다.</p><div class="modal-actions"><button class="secondary" data-action="title">타이틀로</button><button class="primary" data-action="start">함께 다시 도전 →</button></div></section></div>`;
}
function saveResult(){if(['clear','gameover'].includes(state.phase)&&lastSaved!==state){lastSaved=state;try{localStorage.setItem('dungeon-last-team',JSON.stringify({date:new Date().toISOString(),clear:state.phase==='clear',players:state.players,mode:state.mode,hp:state.hero.hp,...state.stats}));}catch{}}}
function debugHTML(){
 const s=state;return `<aside class="debug"><details open><summary>DEVELOPMENT · Debug Panel</summary><div class="debug-note">?debug=1 전용 · ${s.phase} · 주사위 ${s.dice.join(' / ')}</div><table><tbody>${s.targets.map(t=>`<tr><td>${t.side==='attack'?'공격':'방어'} ${t.grade}</td><td>${t.value}</td><td>${t.solution.expression}</td></tr>`).join('')}</tbody></table><div class="debug-controls"><button data-debug="regenerate">목표 재생성</button><button data-debug="end">입력 즉시 종료</button><button data-debug="special">특수능력 강제 실행</button><button data-debug="time30">30초 힌트</button><button data-debug="time40">20초 경과</button><button data-debug="time0">시간 종료</button></div><div class="debug-controls">${Object.entries(ScrollData).map(([id,d])=>`<button data-debug="give-${id}">${d.name} 획득</button>`).join('')}<button data-debug="give-all">모든 두루마리</button><button data-debug="attack-s">공격 S 예약</button><button data-debug="finisher">마지막 일격</button><button data-debug="variation">검격·연속공격 테스트</button><button data-debug="half-hp">HP 50%</button>${Object.keys(ScrollConfig.rarityWeights).map(r=>`<button data-debug="loot-${r}">${ScrollConfig.rarityNames[r]} 전리품</button>`).join('')}</div><div class="debug-controls">${EncounterData.map((e,i)=>`<button data-debug="encounter-${i}">${e.name}</button>`).join('')}<label>직접 조합<select id="debug-count"><option value="1">1마리</option><option value="2" selected>2마리</option><option value="3">3마리</option></select></label>${[0,1,2].map(i=>`<select id="debug-kind-${i}" aria-label="${i+1}번째 적 종류">${MonsterData.map((m,n)=>`<option value="${m.id}" ${n===i?'selected':''}>${m.name}</option>`).join('')}</select>`).join('')}<button data-debug="custom">조합 생성</button><button data-debug="triple">오크 + 고블린 2마리</button><button data-debug="all-one">모든 적 HP 1</button><button data-debug="enrage">모든 적 강화</button><button data-debug="defense-s">방어 S 예약</button><button data-debug="finish-encounter">전투 즉시 승리</button><button data-debug="chain">연쇄번개 테스트</button><button data-debug="storm">얼음폭풍 테스트</button></div>${(s.enemies||[]).map(e=>`<label>${e.name} HP<input type="number" data-debug-enemy="${e.id}" value="${e.hp}" min="0"></label><button data-debug="special-enemy-${e.id}">${e.name} 특수기</button><select data-debug-special="${e.id}" aria-label="${e.name} 특수능력">${Object.entries(SpecialNames).map(([key,name])=>`<option value="${key}" ${e.intent.special===key?'selected':''}>${name}</option>`).join('')}</select><button data-debug="enrage-enemy-${e.id}">${e.name} 강화</button>`).join('')}<label>용사 HP<input type="number" id="debug-hero" value="${s.hero.hp}" min="0" max="${config.heroHP}"></label><label>몬스터 HP<input type="number" id="debug-monster" value="${s.monsterHP}" min="0"></label><label>방어막<input type="number" id="debug-shield" value="${s.hero.shield}" min="0"></label><label>스크롤 횟수<input type="number" id="debug-scroll" value="${s.scrolls[s.scrollIndex]?.uses||0}" min="0"></label><label>몬스터 선택<select id="debug-select-monster">${MonsterData.map((m,i)=>`<option value="${i}" ${i===s.monsterIndex?'selected':''}>${m.name}</option>`).join('')}</select></label><label>연출 속도<select id="debug-animation"><option value="1" ${animationScale===1?'selected':''}>기본</option><option value="0.25" ${animationScale===.25?'selected':''}>4배속</option></select></label></details></aside>`;
}
function preferences(){try{localStorage.setItem('dungeon-settings',JSON.stringify({sound,hints,reducedMotion}));}catch{}}
function handleButton(button){
 if(!button||button.disabled)return;
 if(button.dataset.action==='choose-target'){if(combat.chooseTarget(Number(button.dataset.playerId),button.dataset.enemy)){syncChoiceTimer();render();if(state.phase==='resolution')runResolution();}return;}
 if(button.dataset.action==='change-target'){const id=Number(button.dataset.playerId),a=state.actionQueue.find(a=>a.playerId===id&&a.actionType==='attack');if(a&&state.phase==='playing'){state.choices[id]={kind:'attack',actions:[a],editing:true};timer.pause();render();}return;}
 if(button.dataset.action==='scroll-target'){const choice=targetScrollChoice;if(choice&&combat.chooseScrollTarget(choice.action,button.dataset.enemy)){targetScrollChoice=null;document.querySelector('.target-scroll-overlay,.edit-target-overlay')?.remove();choice.resolve(button.dataset.enemy);}return;}

 if(button.dataset.action==='cast-choice'||button.dataset.action==='cast-skip'){if(!scrollChoice)return;const choice=scrollChoice;scrollChoice=null;document.querySelector('.scroll-choice-overlay')?.remove();choice.resolve(button.dataset.action==='cast-skip'?null:Number(button.dataset.scroll));return;}
 if(button.dataset.action==='inspect-scroll')return;
 if(button.dataset.action==='loot-choice'){if(combat.chooseReward(button.dataset.type)){beep('reserved');render();}return;}
 if(!audio.active)audio.activate();document.documentElement.classList.toggle('reduced-motion',reducedMotion);
 if(button.dataset.action==='presentation-skip'){skipPresentation();return;}
 if(button.dataset.action==='dialogue-next'){sequence?.advance();return;}
 if(button.dataset.players){players=Number(button.dataset.players);render();return;}
 if(button.dataset.mode){mode=button.dataset.mode;render();return;}
 const root=button.closest('.input-pad'),playerId=root?Number(root.dataset.player):null,pad=playerId!==null?pads[playerId]:null;
 if(root&&(state.phase!=='playing'||rolling||state.actionsDone[playerId]||(state.mode==='sequential'&&playerId!==state.player)))return;
 if(button.dataset.dice!==undefined){if(inputDice(pad,Number(button.dataset.dice)))beep('number');updatePad(playerId);return;}
 if(button.dataset.op){inputOperator(pad,button.dataset.op);beep('operator');updatePad(playerId);return;}
 if(button.dataset.target){selection=button.dataset.target;document.querySelectorAll('[data-target]').forEach(t=>t.classList.toggle('selected',t.dataset.target===selection));return;}
 if(button.dataset.debug){handleDebug(button.dataset.debug);return;}
 switch(button.dataset.action){
 case 'inventory':timer.pause();app.insertAdjacentHTML('beforeend',`<div class="overlay inventory-overlay"><section class="modal scroll-choice" role="dialog" aria-modal="true" aria-label="보유 두루마리"><h2>우리 팀의 두루마리</h2><div class="scroll-cards">${state.scrolls.map((s,i)=>scrollCard(s.type,i,'inspect-scroll')).join('')||'<p>보유한 두루마리가 없어요.</p>'}</div><button class="primary" data-action="inventory-close">계속하기</button></section></div>`);break;
 case 'inventory-close':document.querySelector('.inventory-overlay')?.remove();syncChoiceTimer();break;
 case 'setup':screen='setup';render();beep();break;
 case 'story':screen='story';storyIndex=0;render();break;
 case 'story-next':if(++storyIndex===3)startGame();else render();break;
 case 'start':startGame();break;
 case 'title':title();break;
 case 'sound':sound=!sound;audio.configure('SFX',{enabled:sound});preferences();if(!director)render();break;
 case 'settings':settingsOpen=true;if(!director)render();else app.insertAdjacentHTML('beforeend',settingsHTML());break;
 case 'settings-close':settingsOpen=false;if(director)document.querySelector('.overlay')?.remove();else render();break;
 case 'debug-toggle':debugOpen=!debugOpen;if(!director)render();break;
 case 'erase':eraseInput(pad);updatePad(playerId);break;
 case 'reset':resetPad(pad);updatePad(playerId);break;
 case 'submit':submitPad(playerId);break;
 case 'pass':try{combat.pass(playerId);pad.message='넘기기 · 친구들을 응원해 주세요.';render();if(state.phase==='resolution')runResolution();}catch(err){pad.message=err.message;pad.error=true;updatePad(playerId);}break;
 case 'next-monster':cancel();combat.nextMonster();beginTurn(true);break;
 }
}
// Handle each touch pointer independently. Suppress the browser's synthetic follow-up click.
const activeTouches=new Map();
app.addEventListener('click',event=>{
 if(event.isTrusted&&(event.pointerType==='touch'||event.sourceCapabilities?.firesTouchEvents)){event.preventDefault();return;}
 handleButton(event.target.closest('button'));
});
app.addEventListener('pointerdown',event=>{
 if(event.pointerType!=='touch')return;const button=event.target.closest('button');
 if(button&&!button.disabled){activeTouches.set(event.pointerId,{button,x:event.clientX,y:event.clientY});button.classList.add('pressed');}
});
app.addEventListener('pointerup',event=>{
 const touch=activeTouches.get(event.pointerId);if(!touch)return;activeTouches.delete(event.pointerId);touch.button.classList.remove('pressed');
 if(Math.hypot(event.clientX-touch.x,event.clientY-touch.y)<25){event.preventDefault();handleButton(touch.button);}
});
app.addEventListener('pointercancel',event=>{activeTouches.get(event.pointerId)?.button.classList.remove('pressed');activeTouches.delete(event.pointerId);});
app.addEventListener('change',event=>{
 const el=event.target;if(el.dataset.audioToggle||el.dataset.audioVolume){const key=el.dataset.audioToggle||el.dataset.audioVolume;audio.configure(key,el.dataset.audioToggle?{enabled:el.checked}:{volume:Number(el.value)});localStorage.setItem('dungeon-audio',JSON.stringify(audio.channels));return;}if(el.id==='scroll-select'){state.scrollIndex=Number(el.value);return;}
 if(el.id==='motion-toggle'){reducedMotion=el.checked;document.documentElement.classList.toggle('reduced-motion',reducedMotion);preferences();return;}if(el.id==='hint-toggle'){hints=el.checked;preferences();return;}
 if(el.id==='sound-toggle'){sound=el.checked;preferences();return;}
 if(!dev)return;if(el.id==='debug-count'||el.id.startsWith('debug-kind-'))return;const value=Math.max(0,Number(el.value)||0);
 if(el.id==='debug-animation'){animationScale=value;return;}
 if(el.id==='debug-hero'){state.hero.hp=Math.min(config.heroHP,value);if(value===0){cancel();state.phase='gameover';saveResult();}}
 if(el.dataset.debugSpecial){const enemy=combat.enemy(el.dataset.debugSpecial);if(enemy){enemy.forcedSpecial=el.value;enemy.intent.special=el.value;}}
 if(el.dataset.debugEnemy){const enemy=combat.enemy(el.dataset.debugEnemy);if(enemy)enemy.hp=value;syncEncounter(state);if(state.monsterHP===0){cancel();combat.win();saveResult();}}
 if(el.id==='debug-monster'){if(state.enemies){state.enemies.forEach(e=>e.hp=value);syncEncounter(state);}else state.monsterHP=value;if(value===0){cancel();combat.win();saveResult();}}
 if(el.id==='debug-shield')state.hero.shield=value;
 if(el.id==='debug-scroll'){if(!state.scrolls.length&&value>0)state.scrolls.push({type:'fire',uses:value});else if(state.scrolls.length){if(value===0)state.scrolls.splice(state.scrollIndex,1);else state.scrolls[state.scrollIndex].uses=value;}}
 if(el.id==='debug-select-monster'){cancel();state.enemies=null;state.encounter=null;state.encounterIndex=null;state.choices={};state.monsterIndex=value;state.monsterMaxHP=encounterStats(value,state.players).hp;state.monsterHP=state.monsterMaxHP;state.enemyTurn=0;state.nextBlocked=null;state.phase='ready';beginTurn();return;}
 if(!director)render();
});
function handleDebug(action){
 if(!dev||!state)return;
 if(action==='custom'){const count=Number(document.querySelector('#debug-count').value),enemies=Array.from({length:count},(_,i)=>({type:document.querySelector(`#debug-kind-${i}`).value,hpModifier:count===1?1:count===2?.65:.45,attackModifier:count===1?1:count===2?.6:.4}));cancel();combat.configureEncounter(0,{id:'custom',name:'직접 고른 적 조합',enemies,rewardModifier:1});beginTurn();return;}
 if(action.startsWith('enrage-enemy-')){const e=combat.enemy(action.slice(13));if(e){e.forcedEnrage=2;e.enrage=2;e.intent.seconds=30;e.intent.locks=2;render();}return;}
 if(action.startsWith('encounter-')||action==='triple'){cancel();const i=action==='triple'?3:Number(action.slice(10));combat.configureEncounter(i,action==='triple'?{id:'triple',name:'오크와 고블린 경비대',rewardModifier:1.15,enemies:[{type:'orc',hpModifier:.5,attackModifier:.45},{type:'goblin',hpModifier:.4,attackModifier:.4},{type:'goblin',hpModifier:.4,attackModifier:.4}]}:EncounterData[i]);beginTurn();return;}
 if(action==='all-one'){state.enemies?.forEach(e=>e.hp=1);syncEncounter(state);render();return;}
 if(action==='finish-encounter'){cancel();state.enemies?.forEach(e=>e.hp=0);state.monsterHP=0;combat.win();render();return;}
 if(action==='enrage'){state.enemies?.forEach(e=>{e.forcedEnrage=2;e.enrage=2;e.intent.seconds=30;e.intent.locks=2;});render();return;}
 if(action.startsWith('special-enemy-')){const e=combat.enemy(action.slice(14));if(e){const old=state.enemyResolutionIndex;state.enemyResolutionIndex=state.enemies.indexOf(e);combat.applySpecial(true);state.enemyResolutionIndex=old;render();effects.show(state.events.at(-1));}return;}
 if(action==='defense-s'){const t=state.targets.find(t=>t.side==='defense'&&t.grade==='S'&&!t.used);if(t){combat.submit(t.solution.ids,t.solution.ops,state.player<0?0:state.player);syncChoiceTimer();render();}return;}
 if(action==='chain'||action==='storm'){rewardScroll(state,action==='chain'?'lightning':'iceStorm');state.scrollIndex=state.scrolls.findIndex(s=>s.type===(action==='chain'?'lightning':'iceStorm'));action='attack-s';}

 if(action.startsWith('give-')){const id=action.slice(5);for(const type of id==='all'?Object.keys(ScrollData):[id])rewardScroll(state,type);render();return;}
 if(action.startsWith('loot-')){cancel();state.lootCandidates=generateLoot(state,Math.random,action.slice(5));state.lootChosen=false;state.phase='reward';render();return;}
 if(action==='variation'){if(state.phase!=='playing')return;for(const grade of ['C','B','A','S']){const t=state.targets.find(t=>t.side==='attack'&&t.grade===grade&&!t.used);if(!t||state.phase!=='playing')break;combat.submit(t.solution.ids,t.solution.ops,state.player<0?state.actionsDone.findIndex(x=>!x):state.player);}syncChoiceTimer();render();if(!combat.awaitingChoices()){combat.endTurn();runResolution();}return;}
 if(action==='half-hp'){if(state.enemies){state.enemies.forEach(e=>e.hp=Math.round(e.maxHP*.5));syncEncounter(state);}else state.monsterHP=Math.round(state.monsterMaxHP*.5);render();return;}
 if(action==='finisher'){if(state.enemies){state.enemies.forEach(e=>e.hp=1);syncEncounter(state);}else state.monsterHP=1;}
 if(action==='attack-s'||action==='finisher'){if(state.phase!=='playing')return;const t=state.targets.find(t=>t.side==='attack'&&t.grade==='S'&&!t.used);if(t)combat.submit(t.solution.ids,t.solution.ops,state.player<0?0:state.player);syncChoiceTimer();render();if(!combat.awaitingChoices()){combat.endTurn();runResolution();}return;}
 if(action==='regenerate'){cancel();state.phase='ready';beginTurn();return;}
 if(action==='end'){syncChoiceTimer();render();if(!combat.awaitingChoices()){combat.endTurn();runResolution();}return;}
 if(action==='special'){combat.applySpecial(true);render();effects.show(state.events.at(-1));return;}
 const seconds={time30:30,time40:state.duration-20,time0:0}[action];if(seconds!==undefined&&state.phase==='playing'){timer.start(seconds);onTick(seconds);}
}
let focusedPlayer=0;
app.addEventListener('pointerdown',event=>{const pad=event.target.closest('.input-pad');if(pad)focusedPlayer=Number(pad.dataset.player);});
app.addEventListener('focusin',event=>{const pad=event.target.closest('.input-pad');if(pad)focusedPlayer=Number(pad.dataset.player);});
 document.addEventListener('keydown',event=>{
 if(screen!=='battle'||settingsOpen||document.querySelector('.inventory-overlay,.scroll-choice-overlay,.target-scroll-overlay,.edit-target-overlay')||event.target.matches('input,select')||state.phase!=='playing'||rolling)return;
 const playerId=state.mode==='sequential'?state.player:focusedPlayer,root=document.querySelector(`.input-pad[data-player="${playerId}"]`);if(!root||state.actionsDone[playerId])return;
 if(['1','2','3'].includes(event.key))root.querySelector(`[data-dice="${Number(event.key)-1}"]`).click();
 else if(['+','-','*','/'].includes(event.key))root.querySelector(`[data-op="${{'+':'+','-':'−','*':'×','/':'÷'}[event.key]}"]`).click();
 else if(event.key==='Enter'){event.preventDefault();submitPad(playerId);}else if(event.key==='Backspace'){event.preventDefault();eraseInput(pads[playerId]);updatePad(playerId);}
});
 if(dev)window.dungeonDebug={get state(){return state;},get combat(){return combat;},get pads(){return pads;},get timer(){return timer;},get audio(){return audio;},get presentation(){return presentationPhase;},skip:skipPresentation};
 render();
