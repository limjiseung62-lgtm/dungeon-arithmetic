import {initMorale,moraleKills,tickMorale,fortressSpecial,fortressRelicBonus} from './MoraleSystem.js';
import {initBoss,prepareBoss,bossArmor,bossDamage,pressureBoss,bossSpecial,blockBoss,tickBoss,stoppedBossHeat} from './BossBattleSystem.js';
import {inMine,mineSpecial,mineAttackDamage,tickMine,raiseHeat,bossPhase} from './HeatSystem.js';
import {attackDamage,mitigateAttack,battleEncounters} from './BattleContext.js';
import {EncounterData,createEncounter,livingEnemies,syncEncounter,enemyIntent} from './EncounterData.js';
import {applyStatus} from './StatusEffectSystem.js';
import {encounterStats} from './BalanceSystem.js';
import {GameConfig as config} from './GameConfig.js';
import {ScrollData} from './ScrollData.js';
import {MonsterData} from './MonsterData.js';
import {monsterAt} from './MonsterRegistry.js';
import {generateTurn} from './TargetGenerator.js';
import {evaluate} from './ExpressionEngine.js';
import {takeDamage} from './DefenseSystem.js';
import {useScroll,rewardScroll,generateLoot} from './ScrollSystem.js';
import {tickPoison} from './StatusEffectSystem.js';
import {nextIntent,SpecialNames} from './MonsterAI.js';
import {reserveAction} from './ActionQueue.js';
export class CombatSystem{
  constructor(state,rng=Math.random,lootRng=Math.random){this.state=state;this.rng=rng;this.lootRng=lootRng;}
  configureEncounter(index=0,data=battleEncounters(this.state)[index]){
    const s=this.state;s.encounterIndex=index;if(inMine(s))s.heatPoints=0;s.encounter=data;s.enemies=createEncounter(data,s.players,index);s.enemies.forEach(initBoss);initMorale(s);s.monsterIndex=s.enemies[0].monsterIndex;s.enemyTurn=0;s.phase='ready';s.choices={};s.blockedList=[];s.nextBlockedList=[];s.nextBlocked=null;s.blocked=null;s.stolen=false;s.stolenDuration=null;s.curse=false;s.shifted=false;syncEncounter(s);return s.enemies;
  }
  assignTarget(action,enemy){action.enemyId=enemy.id;action.enemyName=enemy.name;if(action.actionType==='attack')action.baseDamage=attackDamage(this.state,action.targetGrade,bossArmor(enemy,monsterAt(enemy.monsterIndex).armor));}
  enemy(id){return this.state.enemies?.find(e=>e.id===id);}
  currentEnemy(){return this.state.enemies?.[this.state.enemyResolutionIndex||0];}
  awaitingChoices(){return Object.keys(this.state.choices||{}).length>0;}
  chooseTarget(playerId,enemyId){
    const s=this.state,choice=s.choices?.[playerId],enemy=this.enemy(enemyId);
    if(s.phase!=='playing'||!choice||!enemy||enemy.hp<=0||choice.kind==='block'&&enemy.intent.special==='none')return false;
    for(const a of choice.actions)this.assignTarget(a,enemy);
    delete s.choices[playerId];if(choice.kind==='block'){s.blockReserved=true;s.blockReservedIds.add(enemyId);if(!livingEnemies(s).some(e=>e.intent.special==='curse'&&!s.blockReservedIds.has(e.id)))s.curse=false;}
    if(!choice.editing)this.completePlayer(playerId);else if(s.actionsDone.every(Boolean))this.endTurn();return true;
  }
  changeTarget(playerId,enemyId){
    const s=this.state,e=this.enemy(enemyId);if(s.phase!=='playing'||!e||e.hp<=0||s.choices?.[playerId])return false;
    const actions=s.actionQueue.filter(a=>a.playerId===playerId&&a.status==='pending'&&a.actionType==='attack');if(!actions.length)return false;
    actions.forEach(a=>this.assignTarget(a,e));return true;
  }
  chooseScrollTarget(action,id){const e=this.enemy(id);if(!action||action.status!=='pending'||!e||e.hp<=0)return false;action.enemyId=e.id;action.enemyName=e.name;return true;}
  resolveTarget(action){
    const s=this.state;if(!s.enemies)return null;let e=this.enemy(action.enemyId);if(!e||e.hp<=0){const old=e;e=livingEnemies(s)[0];if(e){action.retargeted=old?`${old.name}이 이미 쓰러져 ${e.name}으로 공격 대상을 변경합니다!`:null;action.enemyId=e.id;action.enemyName=e.name;}}return e;
  }
  emit(kind,text,extra={}){const event={kind,text,...extra};if(this.supportHook)event.support=this.supportHook(event,this.state);const morale=moraleKills(this.state);if(morale==='적의 사기가 꺾였습니다!')event.moraleBroken=true;this.state.events.push(event);return event;}
  startTurn(){
    const s=this.state;if(!['ready','enemy'].includes(s.phase))return false;
    if(!s.enemies&&s.enemyTurn===0){s.monsterMaxHP=encounterStats(s.monsterIndex,s.players).hp;if(s.monsterHP===monsterAt(s.monsterIndex).hp)s.monsterHP=s.monsterMaxHP;}
    const generated=generateTurn(this.rng,s.targets.map(t=>t.value));
    s.dice=generated.dice;s.targets=generated.targets;s.turn++;s.stats.turns++;s.enemyTurn++;
    s.duration=s.stolen?(s.stolenDuration||config.stolenSeconds):config.turnSeconds;s.seconds=s.duration;s.elapsed=0;s.stolen=false;s.stolenDuration=null;
    s.scrollStop=false;s.scrollWeaken=0;s.specialBlocked=false;s.blockReserved=false;s.curse=false;s.shifted=false;s.blocked=s.nextBlocked;s.blockedList=s.nextBlockedList?.length?s.nextBlockedList:(s.blocked?[s.blocked]:[]);s.nextBlocked=null;s.nextBlockedList=[];s.blockReservedIds=new Set();s.blockedIds=new Set();s.choices={};
    s.actionQueue=[];s.actionsDone=Array(s.players).fill(false);s.resolutionIndex=0;s.totalDamage=0;s.resolutionStage=null;
    for(const b of s.blockedList)s.actionsDone[b.slot]=true;
    s.player=s.actionsDone.findIndex(done=>!done);s.intent=nextIntent(s);if(s.enemies){for(const e of s.enemies){e.weaken=0;prepareBoss(s,e);e.intent=enemyIntent(s,e);}s.intent=s.enemies[0].intent;}s.phase='playing';s.mineStatusResolved=false;
    this.emit('roll',`TURN ${s.turn} · 새로운 주사위!`);
    if(s.actionsDone.every(Boolean))this.endTurn();return true;
  }
  assertPlayer(playerId){
    const s=this.state;
    if(s.phase!=='playing')throw new Error('입력 시간이 끝났어요. 전투를 지켜봐 주세요.');
    if(!Number.isInteger(playerId)||playerId<0||playerId>=s.players)throw new Error('올바른 플레이어를 선택하세요.');
    if(s.choices?.[playerId])throw new Error('먼저 공격 또는 차단 대상을 선택하세요.');
    if(s.actionsDone[playerId])throw new Error('이미 이번 턴 행동을 완료했어요.');
    if(s.mode==='sequential'&&playerId!==s.player)throw new Error('현재 차례의 플레이어가 입력해 주세요.');
  }
  submit(ids,ops,playerId=this.state.player){
    const s=this.state;this.assertPlayer(playerId);
    const expression=evaluate(s.dice,ids,ops),target=s.targets.find(t=>t.value===expression.value);
    if(!target)throw new Error('남아 있는 공격 또는 방어 목표 숫자를 만들어 주세요.');
    if(target.used)throw new Error(`이미 ${target.claimedBy+1}P가 해결한 목표입니다.`);
    // Validate first, then synchronously lock and enqueue: no asynchronous claim gap.
    target.used=true;target.claimedBy=playerId;const start=s.actionQueue.length;reserveAction(s,target,expression,playerId);
    const actions=s.actionQueue.slice(start),kind=target.side==='attack'?'attack':target.grade==='S'?'block':null;
    if(s.enemies&&kind){const eligible=livingEnemies(s).filter(e=>kind==='attack'||e.intent.special!=='none');const selected=actions.filter(a=>kind==='attack'?a.actionType==='attack':a.actionType==='block');
      if(eligible.length>1){s.choices[playerId]={kind,actions:selected};if(kind==='block')s.blockReserved=false;}
      else if(eligible.length===1){for(const a of selected)this.assignTarget(a,eligible[0]);if(kind==='block')s.blockReservedIds.add(eligible[0].id);}
    }
    // Prevent/reveal only the scheduled mid-input special, without applying a shield yet.
    if(target.side==='defense'&&target.grade==='S'&&!s.choices?.[playerId]&&(!s.enemies||!livingEnemies(s).some(e=>e.intent.special==='curse'&&!s.blockReservedIds.has(e.id))))s.curse=false;
    this.emit('reserved',`${playerId+1}P · ${target.side==='attack'?'공격':'방어'} ${target.grade} 예약`,{target:target.id,playerId});
    if(!s.choices?.[playerId])this.completePlayer(playerId);return expression;
  }
  completePlayer(playerId){
    const s=this.state;s.actionsDone[playerId]=true;s.player=s.actionsDone.findIndex(done=>!done);
    if(s.actionsDone.every(Boolean))this.endTurn();
  }
  pass(playerId=this.state.player){this.assertPlayer(playerId);this.emit('pass',`${playerId+1}P PASS`);this.completePlayer(playerId);}
  timeUpdate(seconds){
    const s=this.state;if(s.phase!=='playing')return;
    if(this.awaitingChoices())return;
    s.seconds=Math.max(0,seconds);s.elapsed=s.duration-s.seconds;
    if(this.awaitingChoices())return;
    if(s.elapsed>=config.curseSeconds){
      const intents=s.enemies?livingEnemies(s).filter(e=>!s.blockReservedIds.has(e.id)).map(e=>e.intent):s.blockReserved?[]:[s.intent];
      if(intents.some(i=>i.special==='curse')&&!s.curse){s.curse=true;this.emit('curse','숫자 저주! 처음 본 숫자를 기억하세요.');}
      if(intents.some(i=>i.special==='shift')&&!s.shifted){s.shifted=true;for(const t of s.targets)t.position=(t.position+1)%4;this.emit('shift','골렘이 재조립됩니다! 표식이 이동해요.');}
    }
    if(s.seconds===0){this.emit('pass','시간 종료 · 남은 행동 자동 PASS');this.endTurn();}
  }
  endTurn(){
    const s=this.state;if(s.phase!=='playing'||this.awaitingChoices())return false;
    s.actionsDone.fill(true);s.player=-1;s.seconds=0;s.phase='resolution';s.resolutionStage='actions';s.enemyResolutionIndex=0;
    this.emit('battle','BATTLE!');return true;
  }
  applySpecial(force=false){
    const s=this.state,e=s.enemies?this.currentEnemy():null,intent=e?.intent||s.intent,sp=intent.special;
    const extra={special:sp,enemyId:e?.id,monster:e?.monsterIndex};
    if(e&&e.hp<=0)return this.emit('special-none','쓰러진 적은 행동하지 않습니다',extra);
    if(!force&&s.scrollStop)return this.emit('block','시간정지 · 특수 행동 억제',extra);
    if(!force&&(s.enemies?s.blockedIds.has(e?.id):s.specialBlocked)){if(sp!=='none'){blockBoss(e);s.stats.blocks++;return this.emit('block','SPECIAL BLOCKED!',extra);}return this.emit('special-none','특수능력 없음',extra);}
    if(bossSpecial(s,e,sp)){syncEncounter(s);}else if(fortressSpecial(s,e,sp)){syncEncounter(s);}else if(mineSpecial(s,e,sp)){}else if(sp==='guard'&&e){e.hp=Math.min(e.maxHP,e.hp+6);syncEncounter(s);}else applyStatus(s,sp,intent);
    return sp!=='none'?this.emit(sp,SpecialNames[sp],extra):this.emit('special-none','특수능력 없음',extra);
  }
  resolveNext(){
    const s=this.state;if(s.phase!=='resolution')return null;
    if(s.resolutionStage==='actions'){
      const action=s.actionQueue[s.resolutionIndex++];
      if(action){
        if(action.status!=='pending')return this.resolveNext();
        action.status='resolved';let event;
        if(action.actionType==='attack'){
          const before=s.monsterHP,e=this.resolveTarget(action);let amount=s.enemies?attackDamage(s,action.targetGrade,bossArmor(e,monsterAt(e.monsterIndex).armor)):action.baseDamage;const mineHit=e?mineAttackDamage(s,e,action.targetGrade,amount):{amount,breakDamage:0};amount=bossDamage(e,mineHit.amount+fortressRelicBonus(s,e,action.targetGrade));action.breakDamage=mineHit.breakDamage;action.baseDamage=amount;if(e)e.hp=Math.max(0,e.hp-amount);else s.monsterHP=Math.max(0,s.monsterHP-amount);syncEncounter(s);s.totalDamage+=before-s.monsterHP;
          const bossBreak=pressureBoss(e,action.targetGrade);action.bossBreak=bossBreak;s.stats.attack[action.targetGrade]++;
          event=this.emit('attack',`${action.playerId+1}P ⚔ DAMAGE ${action.baseDamage}`,{damage:action.baseDamage,bossBreak:action.bossBreak,breakDamage:action.breakDamage||0,enemyId:action.enemyId,action,retargeted:action.retargeted});
        }else if(action.actionType==='scroll'){
          const before=s.monsterHP;if(['SINGLE_ENEMY','RANDOM_ENEMIES','ALL_ENEMIES'].includes(action.targetType))this.resolveTarget(action);const boost=this.scrollModifier?.(action,s)||0;const scroll=useScroll(s,action.scrollSlot,action.enemyId,boost);s.totalDamage+=before-s.monsterHP;
          event=this.emit('magic',`${action.icon} ${action.name} 발동!`,{type:action.scrollEffect,damage:scroll?.damage||0,heal:scroll?.heal||0,shieldGain:scroll?.shield||0,hits:scroll?.hits||1,impacts:scroll?.impacts||[],enemyId:action.enemyId,action,mercenaryBoost:scroll?boost:0,retargeted:action.retargeted});
        }else if(action.actionType==='defense'){
          s.hero.shield+=action.shieldGain;s.stats.defense[action.targetGrade]++;
          event=this.emit('defense',`${action.playerId+1}P SHIELD +${action.shieldGain}`,{shieldGain:action.shieldGain,action});
        }else{
          s.specialBlocked=true;if(action.enemyId)s.blockedIds.add(action.enemyId);s.curse=false;event=this.emit('barrier','SPECIAL BLOCK 준비 완료',{action});
        }
        // A lethal hit cancels later actions. Uncast scrolls retain their charge.
        if(s.monsterHP===0){for(const pending of s.actionQueue)if(pending.status==='pending')pending.status='cancelled';s.resolutionStage='total';}
        return event;
      }
      s.resolutionStage='total';
    }
    if(s.resolutionStage==='total'){
      s.resolutionStage=s.monsterHP===0?'victory':s.enemies?'enemy':'special';return this.emit('total',`TOTAL DAMAGE ${s.totalDamage}`,{damage:s.totalDamage});
    }
    if(s.resolutionStage==='victory'){this.win();return s.events.at(-1);}
    if(s.resolutionStage==='special'){
      const event=this.applySpecial();if(s.enemies)s.enemyResolutionIndex++;s.resolutionStage='enemy';return event;
    }
    if(s.resolutionStage==='enemy-next'){s.enemyResolutionIndex++;s.resolutionStage='enemy';}
    if(s.resolutionStage==='enemy'){
      if(s.enemies){while(this.currentEnemy()?.hp===0)s.enemyResolutionIndex++;if(!this.currentEnemy()||s.hero.hp===0){s.resolutionStage='status';return this.resolveNext();}}
      const e=this.currentEnemy(),intent=e?.intent||s.intent;
      s.resolutionStage=s.enemies?'special':'status';const incoming=s.scrollStop?0:mitigateAttack(s,Math.round(intent.attack*(1-(e?.weaken||s.scrollWeaken||0))));const damage=takeDamage(s,incoming,'enemy');
      return this.emit('enemy',`${e?e.name+' · ':''}적의 공격 ${damage.absorbed+damage.hpDamage} · 방어막 흡수 ${damage.absorbed} · HP −${damage.hpDamage}`,{...damage,attack:damage.absorbed+damage.hpDamage,suppressed:!!s.scrollStop,enemyId:e?.id,monster:e?.monsterIndex});
    }
    if(s.resolutionStage==='status'){
      s.resolutionStage='end';const poison=tickPoison(s);
      if(poison)return this.emit('poison',`독 피해 ${config.poisonDamage} · 남은 ${s.hero.poison}턴`,poison);
    }
    if(s.resolutionStage==='end'){
      if(inMine(s)&&!s.mineStatusResolved){s.mineStatusResolved=true;const damage=tickMine(s);if(damage)return this.emit('burn',`화상 ${damage.burnDamage} · 열기 ${damage.heatDamage} 피해`,damage);}
      if(s.hero.hp===0){s.phase='gameover';return this.emit('gameover','GAME OVER');}
      const heatStopped=stoppedBossHeat(s);tickBoss(s);tickMorale(s);if(inMine(s)&&!heatStopped){const boss=s.enemies.find(e=>e.hp>0&&e.type==='flameGiant');raiseHeat(s,boss&&bossPhase(boss)>=2?2:1);}s.phase='enemy';return this.emit('turn-end',`TURN ${s.turn+1}`);
    }
    return null;
  }
  resolveAll(){let guard=0;while(this.state.phase==='resolution'&&guard++<50)this.resolveNext();if(guard>=50)throw new Error('전투 해결 반복 오류');}
  win(){
    const s=this.state;if(s.phase==='reward'||s.phase==='clear')return;
    if(inMine(s))s.heatPoints=0;s.lootCandidates=generateLoot(s,this.lootRng);s.lootChosen=false;
    s.phase=(s.enemies?s.encounterIndex===battleEncounters(s).length-1:s.monsterIndex===MonsterData.length-1)?'clear':'reward';this.emit('victory',`${s.encounter?.name||monsterAt(s.monsterIndex).name} · 전투 승리!`);
  }
  chooseReward(type){const s=this.state;if(!['reward','clear'].includes(s.phase)||s.lootChosen||!s.lootCandidates?.includes(type))return false;rewardScroll(s,type);s.lootChosen=true;s.lootAcquired=type;return true;}
  chooseScroll(action,index){if(!action||action.status!=='pending'||action.actionType!=='scroll')return false;if(index===null){action.status='cancelled';action.skipped=true;return true;}const slot=this.state.scrolls[index];if(!slot||slot.uses<1)return false;Object.assign(action,{scrollSlot:slot,scrollEffect:slot.type,...ScrollData[slot.type]});return true;}
  nextMonster(){
    const s=this.state;if(s.phase!=='reward')return;
    if(!s.lootChosen&&s.lootCandidates?.length)this.chooseReward(s.lootCandidates[0]);
    if(s.enemies){s.hero.shield=0;this.configureEncounter(s.encounterIndex+1);this.startTurn();return;}
    s.monsterIndex++;s.monsterMaxHP=encounterStats(s.monsterIndex,s.players).hp;s.monsterHP=s.monsterMaxHP;s.enemyTurn=0;
    s.hero.shield=0;s.blocked=null;s.nextBlocked=null;s.stolen=false;s.curse=false;s.phase='ready';this.startTurn();
  }
}
