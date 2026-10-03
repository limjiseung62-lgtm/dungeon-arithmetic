import {encounterStats} from './BalanceSystem.js';
import {GameConfig as config} from './GameConfig.js';
import {MonsterData} from './MonsterData.js';
import {generateTurn} from './TargetGenerator.js';
import {evaluate} from './ExpressionEngine.js';
import {takeDamage} from './DefenseSystem.js';
import {useScroll,rewardScroll} from './ScrollSystem.js';
import {tickPoison} from './StatusEffectSystem.js';
import {nextIntent,SpecialNames} from './MonsterAI.js';
import {reserveAction} from './ActionQueue.js';
export class CombatSystem{
  constructor(state,rng=Math.random){this.state=state;this.rng=rng;}
  emit(kind,text,extra={}){const event={kind,text,...extra};this.state.events.push(event);return event;}
  startTurn(){
    const s=this.state;if(!['ready','enemy'].includes(s.phase))return false;
    if(s.enemyTurn===0){s.monsterMaxHP=encounterStats(s.monsterIndex,s.players).hp;if(s.monsterHP===MonsterData[s.monsterIndex].hp)s.monsterHP=s.monsterMaxHP;}
    const generated=generateTurn(this.rng,s.targets.map(t=>t.value));
    s.dice=generated.dice;s.targets=generated.targets;s.turn++;s.stats.turns++;s.enemyTurn++;
    s.duration=s.stolen?config.stolenSeconds:config.turnSeconds;s.seconds=s.duration;s.elapsed=0;s.stolen=false;
    s.specialBlocked=false;s.blockReserved=false;s.curse=false;s.shifted=false;s.blocked=s.nextBlocked;s.nextBlocked=null;
    s.actionQueue=[];s.actionsDone=Array(s.players).fill(false);s.resolutionIndex=0;s.totalDamage=0;s.resolutionStage=null;
    if(s.blocked)s.actionsDone[s.blocked.slot]=true;
    s.player=s.actionsDone.findIndex(done=>!done);s.intent=nextIntent(s);s.phase='playing';
    this.emit('roll',`TURN ${s.turn} · 새로운 주사위!`);
    if(s.actionsDone.every(Boolean))this.endTurn();return true;
  }
  assertPlayer(playerId){
    const s=this.state;
    if(s.phase!=='playing')throw new Error('입력 시간이 끝났어요. 전투를 지켜봐 주세요.');
    if(!Number.isInteger(playerId)||playerId<0||playerId>=s.players)throw new Error('올바른 플레이어를 선택하세요.');
    if(s.actionsDone[playerId])throw new Error('이미 이번 턴 행동을 완료했어요.');
    if(s.mode==='sequential'&&playerId!==s.player)throw new Error('현재 차례의 플레이어가 입력해 주세요.');
  }
  submit(ids,ops,playerId=this.state.player){
    const s=this.state;this.assertPlayer(playerId);
    const expression=evaluate(s.dice,ids,ops),target=s.targets.find(t=>t.value===expression.value);
    if(!target)throw new Error('남아 있는 공격 또는 방어 목표 숫자를 만들어 주세요.');
    if(target.used)throw new Error(`이미 ${target.claimedBy+1}P가 해결한 목표입니다.`);
    // Validate first, then synchronously lock and enqueue: no asynchronous claim gap.
    target.used=true;target.claimedBy=playerId;reserveAction(s,target,expression,playerId);
    // Prevent/reveal only the scheduled mid-input special, without applying a shield yet.
    if(target.side==='defense'&&target.grade==='S')s.curse=false;
    this.emit('reserved',`${playerId+1}P · ${target.side==='attack'?'공격':'방어'} ${target.grade} 예약`,{target:target.id,playerId});
    this.completePlayer(playerId);return expression;
  }
  completePlayer(playerId){
    const s=this.state;s.actionsDone[playerId]=true;s.player=s.actionsDone.findIndex(done=>!done);
    if(s.actionsDone.every(Boolean))this.endTurn();
  }
  pass(playerId=this.state.player){this.assertPlayer(playerId);this.emit('pass',`${playerId+1}P PASS`);this.completePlayer(playerId);}
  timeUpdate(seconds){
    const s=this.state;if(s.phase!=='playing')return;
    s.seconds=Math.max(0,seconds);s.elapsed=s.duration-s.seconds;
    if(!s.blockReserved && s.elapsed>=config.curseSeconds){
      if(s.intent.special==='curse'&&!s.curse){s.curse=true;this.emit('curse','숫자 저주! 처음 본 숫자를 기억하세요.');}
      if(s.intent.special==='shift'&&!s.shifted){s.shifted=true;for(const t of s.targets)t.position=(t.position+1)%4;this.emit('shift','골렘이 재조립됩니다! 표식이 이동해요.');}
    }
    if(s.seconds===0){this.emit('pass','시간 종료 · 남은 행동 자동 PASS');this.endTurn();}
  }
  endTurn(){
    const s=this.state;if(s.phase!=='playing')return false;
    s.actionsDone.fill(true);s.player=-1;s.seconds=0;s.phase='resolution';s.resolutionStage='actions';
    this.emit('battle','BATTLE!');return true;
  }
  applySpecial(force=false){
    const s=this.state,sp=s.intent.special;
    if(!force&&s.specialBlocked){if(sp!=='none'){s.stats.blocks++;return this.emit('block','SPECIAL BLOCKED!',{special:sp});}return this.emit('special-none','특수능력 없음');}
    if(sp==='steal')s.stolen=true;
    if(sp==='poison')s.hero.poison=config.poisonTurns;
    if(sp==='web'||sp==='stone')s.nextBlocked={slot:s.intent.slot,type:sp};
    if(sp==='curse')s.curse=true;
    if(sp==='shift'&&!s.shifted){s.shifted=true;for(const t of s.targets)t.position=(t.position+1)%4;}
    return sp!=='none'?this.emit(sp,SpecialNames[sp]):this.emit('special-none','특수능력 없음');
  }
  resolveNext(){
    const s=this.state;if(s.phase!=='resolution')return null;
    if(s.resolutionStage==='actions'){
      const action=s.actionQueue[s.resolutionIndex++];
      if(action){
        if(action.status!=='pending')return this.resolveNext();
        action.status='resolved';let event;
        if(action.actionType==='attack'){
          const before=s.monsterHP;s.monsterHP=Math.max(0,s.monsterHP-action.baseDamage);s.totalDamage+=before-s.monsterHP;
          s.stats.attack[action.targetGrade]++;
          event=this.emit('attack',`${action.playerId+1}P ⚔ DAMAGE ${action.baseDamage}`,{damage:action.baseDamage,action});
        }else if(action.actionType==='scroll'){
          const before=s.monsterHP,scroll=useScroll(s,action.scrollSlot);s.totalDamage+=before-s.monsterHP;
          event=this.emit('magic',`${action.icon} ${action.name} 발동!`,{type:action.scrollEffect,damage:scroll?.damage||0,heal:scroll?.heal||0,action});
        }else if(action.actionType==='defense'){
          s.hero.shield+=action.shieldGain;s.stats.defense[action.targetGrade]++;
          event=this.emit('defense',`${action.playerId+1}P SHIELD +${action.shieldGain}`,{shieldGain:action.shieldGain,action});
        }else{
          s.specialBlocked=true;s.curse=false;event=this.emit('barrier','SPECIAL BLOCK 준비 완료',{action});
        }
        // A lethal hit cancels later actions. Uncast scrolls retain their charge.
        if(s.monsterHP===0){for(const pending of s.actionQueue)if(pending.status==='pending')pending.status='cancelled';s.resolutionStage='total';}
        return event;
      }
      s.resolutionStage='total';
    }
    if(s.resolutionStage==='total'){
      s.resolutionStage=s.monsterHP===0?'victory':'special';return this.emit('total',`TOTAL DAMAGE ${s.totalDamage}`,{damage:s.totalDamage});
    }
    if(s.resolutionStage==='victory'){this.win();return s.events.at(-1);}
    if(s.resolutionStage==='special'){s.resolutionStage='enemy';return this.applySpecial();}
    if(s.resolutionStage==='enemy'){
      s.resolutionStage='status';const damage=takeDamage(s,s.intent.attack);
      return this.emit('enemy',`적의 공격 ${s.intent.attack} · 방어막 흡수 ${damage.absorbed} · HP −${damage.hpDamage}`,damage);
    }
    if(s.resolutionStage==='status'){
      s.resolutionStage='end';const poison=tickPoison(s);
      if(poison)return this.emit('poison',`독 피해 ${config.poisonDamage} · 남은 ${s.hero.poison}턴`,poison);
    }
    if(s.resolutionStage==='end'){
      if(s.hero.hp===0){s.phase='gameover';return this.emit('gameover','GAME OVER');}
      s.phase='enemy';return this.emit('turn-end',`TURN ${s.turn+1}`);
    }
    return null;
  }
  resolveAll(){let guard=0;while(this.state.phase==='resolution'&&guard++<50)this.resolveNext();if(guard>=50)throw new Error('전투 해결 반복 오류');}
  win(){
    const s=this.state;if(s.phase==='reward'||s.phase==='clear')return;
    rewardScroll(s,MonsterData[s.monsterIndex].reward);
    s.phase=s.monsterIndex===MonsterData.length-1?'clear':'reward';this.emit('victory',`${MonsterData[s.monsterIndex].name} 격파!`);
  }
  nextMonster(){
    const s=this.state;if(s.phase!=='reward')return;
    s.monsterIndex++;s.monsterMaxHP=encounterStats(s.monsterIndex,s.players).hp;s.monsterHP=s.monsterMaxHP;s.enemyTurn=0;
    s.hero.shield=0;s.blocked=null;s.nextBlocked=null;s.stolen=false;s.curse=false;s.phase='ready';this.startTurn();
  }
}

