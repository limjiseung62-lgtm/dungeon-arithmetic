import {GameConfig} from './GameConfig.js';
export const PresentationTiming=GameConfig.presentation;
export class SequencePlayer{
 constructor({scale=()=>1,stage=()=>{},sound=()=>{}}={}){Object.assign(this,{scale,stage,sound});this.pending=new Set();this.cancelled=false;this.skipped=false;}
 wait(ms){if(this.skipped||this.cancelled)return Promise.resolve();return new Promise(resolve=>{const item={resolve};item.handle=setTimeout(()=>{this.pending.delete(item);resolve();},ms*this.scale());this.pending.add(item);});}
 advance(){for(const item of this.pending){clearTimeout(item.handle);item.resolve();}this.pending.clear();}
 skip(){this.skipped=true;this.advance();}
 cancel(){this.cancelled=true;this.advance();}
}
export class DialogueSystem{
 constructor(player,audio){this.player=player;this.audio=audio;}
 async show(line){if(!line||this.player.cancelled)return;const host=document.querySelector('.battle-stage');if(!host)return;const bubble=document.createElement('button');bubble.className='monster-dialogue';bubble.dataset.action='dialogue-next';const speaker=document.createElement('small'),text=document.createElement('strong');speaker.textContent=line.speaker;text.textContent=line.text;bubble.append(speaker,text);host.append(bubble);if(line.voiceAsset)this.audio.playAsset(line.voiceAsset,'VOICE');await this.player.wait(line.duration);bubble.remove();}
}
export class MonsterSpecialSequence{
 constructor(player,dialogue,audio){Object.assign(this,{player,dialogue,audio});}
 async play({state,monster,blocked,commit,compact=false}){
  const p=this.player,special=state.intent.special;if(special==='none'){if(!p.cancelled)commit();return;}
  p.stage('special-intro');if(!compact)await this.dialogue.show(monster.dialogues.special[special]);if(p.cancelled)return;
  const host=document.querySelector('.battle-stage'),layer=document.createElement('div');layer.className=`special-sequence special-${special}`;
  const names={guard:'덩굴 갑옷!',steal:'시간 훔치기!',curse:'숫자 저주!',web:'거미줄 함정!',poison:'독니 공격!',shift:'숫자 위치 변경!',stone:'석화!'};
  const title=document.createElement('h2'),visual=document.createElement('div'),result=document.createElement('strong');title.textContent=names[special];visual.className='special-object';visual.textContent={guard:'🌿',steal:'60초',curse:'✧  ?  ✧',web:'🕸',poison:'☠',shift:'◆ ◆ ◆',stone:'▰ ▰ ▰'}[special];const projectile=document.createElement("i");projectile.className="special-projectile";projectile.textContent={guard:"🌿",steal:"†",curse:"✧",web:"🕸",poison:"☠",shift:"✊",stone:"◆"}[special];layer.append(title,visual,result,projectile);host?.append(layer);
  if(['web','stone'].includes(special)){visual.textContent=`${state.intent.slot+1}P`;const target=document.createElement('span');target.className='special-player';target.textContent=`${state.intent.slot+1}P`;layer.append(target);}
  if(special==='shift'){const fragments=document.createElement('div');fragments.className='number-fragments';for(const [i,t] of state.targets.entries()){const tile=document.createElement('span');tile.textContent=t.value;tile.style.setProperty('--i',i);fragments.append(tile);}layer.append(fragments);}
  if(blocked){const barrier=document.createElement('div');barrier.className='special-barrier';layer.append(barrier);}
  p.stage('special-windup');this.audio.play(special);await p.wait(compact?250:PresentationTiming.windup);if(p.cancelled){layer.remove();return;}
  p.stage(blocked?'special-block':'special-impact');layer.classList.add(blocked?'blocked':'impact');this.audio.play(blocked?'block':'break');commit();
  result.textContent=blocked?'특수 공격 방어 성공!':{guard:'덩굴을 회복했어요 · HP +6',steal:`다음 턴 제한시간 ${state.intent.seconds||45}초!`,curse:'숫자의 기억이 가려졌습니다',web:`${state.intent.slot+1}P 거미줄에 묶임!`,poison:'중독! · 3턴 지속',shift:'숫자는 그대로 · 위치 재조립',stone:`${state.intent.slot+1}P 석화!`}[special];
  if(['web','stone'].includes(special)&&!blocked){const slots=(state.nextBlockedList||[]).map(b=>`${b.slot+1}P`).join(' · ');result.textContent=slots?`${slots} 행동 봉쇄 · 최소 1명은 행동 가능`:'최소 1명은 행동 가능 · 봉쇄 없음';}if(special==='steal')visual.textContent=blocked?'시간을 지켰어요!':`다음 턴 ${state.intent.seconds||45}초`;await p.wait(compact?450:PresentationTiming.result);if(!p.cancelled){if(special==='steal'&&!blocked)this.audio.play('laugh');await this.dialogue.show(blocked?monster.dialogues.blocked:null);}layer.remove();
 }
}
