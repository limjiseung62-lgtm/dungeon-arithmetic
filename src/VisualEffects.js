import {artHTML} from './AssetManifest.js';
import {ScrollData} from './ScrollData.js';
import {displayText} from './LocalizedText.js';
const gestures=[['검 베기','내려치기','찌르기'],['단검 베기','점프 공격','기습 돌진'],['지팡이 타격','마법탄','충격파'],['앞발 공격','돌진','물기'],['주먹 내려치기','양손 충격','지면 강타'],['덩굴 휘두르기','덩굴 밀치기','잎사귀 일격'],['그림자 돌진','빠른 발톱','도약 공격'],['포자 날리기','버섯 통통','잎사귀 타격'],['마력탄','빛의 고리','유적의 파동'],['가지 내려치기','뿌리의 파동','숲의 일격']];
export const enemyGesture=(index,variation=0)=>(gestures[index]||['일반 공격','마력 공격','돌진'])[variation]||'일반 공격';
export class VisualEffects{
  constructor(sound){this.sound=sound;this.handles=[];}
  clear(){for(const id of this.handles)clearTimeout(id);this.handles=[];document.querySelectorAll('.effect-layer').forEach(e=>e.remove());document.querySelectorAll('.enemy-card').forEach(e=>e.classList.remove('focused','target-hit','target-lunge'));const stage=document.querySelector('.battle-stage');if(stage)for(const name of ['sword-strike','sword-recover','monster-hit','monster-lunge','player-hit','guard-hit','reassemble','time-steal','finisher'])stage.classList.remove(name);}
  show(event){
    this.clear();const stage=document.querySelector('.battle-stage');if(!stage)return;
    const target=document.querySelector(`[data-enemy-id="${event.enemyId||event.action?.enemyId}"]`);target?.classList.add('focused');if(target){const box=target.getBoundingClientRect(),stageBox=stage.getBoundingClientRect();stage.style.setProperty('--focus-x',`${box.left+box.width/2-stageBox.left}px`);stage.style.setProperty('--camera-x',`${(stageBox.left+stageBox.width/2-box.left-box.width/2)*.035}px`);}else{stage.style.setProperty('--focus-x','50%');stage.style.setProperty('--camera-x','0px');}if(['attack','magic'].includes(event.kind)){target?.classList.add('target-hit');for(const hit of event.impacts||[])document.querySelector(`[data-enemy-id="${hit.enemyId}"]`)?.classList.add('target-hit');}if(event.kind==='enemy'&&!event.suppressed)target?.classList.add('target-lunge');stage.dataset.effect=event.kind;stage.dataset.variation=event.variation??0;if(event.grade)stage.dataset.hitGrade=event.grade;stage.dataset.monster=event.monster??0;stage.dataset.intensity=event.intensity??1;stage.classList.toggle('wounded',!!event.wounded);stage.classList.toggle('finisher',!!event.finisher);if(!['attack-windup','enemy-windup','magic-launch','enemy'].includes(event.kind))this.sound(event.kind,{grade:event.action?.targetGrade,type:event.type});if(event.kind==='enemy'){if(event.hpDamage)this.sound('enemy');if(event.absorbed)this.sound('collision');if(event.absorbed>0&&event.hpDamage>0)this.sound('break');}
    const layer=document.createElement('div');layer.className=`effect-layer fx-${event.kind}`;layer.setAttribute('aria-hidden','true');
    const label=document.createElement('div');label.className='cinematic-label';label.textContent=displayText(event.text);
    if(['battle','total','turn-end','block','victory','gameover'].includes(event.kind))layer.append(label);
    if(event.kind==='attack-windup')stage.classList.add('sword-strike');
    if(event.kind==='attack'){
      stage.classList.add('sword-recover','monster-hit');stage.dataset.hitGrade=event.action.targetGrade;layer.dataset.grade=event.action.targetGrade;layer.innerHTML='<div class="sword-trail"></div><div class="impact-spark"></div>';
      const number=document.createElement('div');number.className='damage-number';number.textContent=`${event.action.playerId+1}P · ${event.damage}`;layer.append(number);if(event.combo){const combo=document.createElement('b');combo.className='combo-counter';combo.textContent=event.combo===1?'첫 타격':`${event.combo}연속 공격`;layer.append(combo);}
    }
    if(event.kind==='scroll-open'){
      const title=ScrollData[event.type]?.name||'두루마리';layer.classList.add(`spell-${event.type}`);
      layer.innerHTML=`<div class="spell-runes">✧ ⟡ ✦ ⟡ ✧</div><div class="unfurled-scroll"><i></i><div class="rune-seal">${artHTML(event.type,{label:title,full:true})}</div><b>${title}</b><span>스크롤 발동!</span><i></i></div>`;
    }
    if(event.kind==='magic-launch'){layer.classList.add(`spell-${event.type}`);layer.innerHTML='<div class="magic-projectile"></div>'; }
    if(event.kind==='magic'){
      if(event.damage)stage.classList.add('monster-hit');layer.classList.add(`spell-${event.type}`);
      layer.innerHTML='<div class="magic-projectile"></div><div class="magic-explosion"></div><div class="magic-ring"></div>';
      const number=document.createElement('div');number.className='damage-number magic-number';number.textContent=event.damage?`${event.hits>1?'번개 3회 · ':''}피해 ${event.damage}`:event.type==='heal'?`HP +${event.heal}`:event.shieldGain?`방어막 +${event.shieldGain}`:event.type==='cleanse'?'상태이상 정화!':'이번 적의 행동 억제!';layer.append(number);if(event.combo){const combo=document.createElement('b');combo.className='combo-counter';combo.textContent=event.combo===1?'첫 타격':`${event.combo}연속 공격`;layer.append(combo);}
    }
    if(event.kind==='defense'||event.kind==='barrier'){layer.dataset.grade=event.grade||event.action?.targetGrade||'S';}if(event.kind==='defense'||event.kind==='barrier')layer.innerHTML=`<div class="first-person-barrier"></div><div class="shield-caption">${event.kind==='defense'?`방어막 +${event.shieldGain}`:'특수 공격 방어 준비!'}</div>`;
    if(event.kind==='block'){
      layer.insertAdjacentHTML('afterbegin','<div class="first-person-barrier"></div><div class="broken-special">✦</div>');
    }
    if(event.kind==='enemy'){
      if(!event.suppressed)stage.classList.add('monster-lunge');
      if(event.absorbed>0){stage.classList.add('guard-hit');layer.innerHTML='<div class="first-person-barrier collision"></div><div class="guard-impact"></div>';}
      if(event.hpDamage>0){stage.classList.add('player-hit');layer.insertAdjacentHTML('beforeend','<div class="hurt-vignette"></div>');}
      const caption=document.createElement('div');caption.className='shield-caption';caption.textContent=event.suppressed?'시간정지 · 이번 반격 없음':event.hpDamage>0?`${event.absorbed>0?"방어막 파괴! · ":""}HP −${event.hpDamage} · 방어막 흡수 ${event.absorbed}`:`완벽 방어! 방어막 −${event.absorbed}`;layer.append(caption);
    }
    if(event.kind==='shift')stage.classList.add('reassemble');
    if(event.kind==='steal')stage.classList.add('time-steal');
    if(event.kind==='poison'){
      layer.innerHTML='<div class="poison-vignette"></div>';const damage=document.createElement('div');damage.className='shield-caption';damage.textContent=`중독 피해 −${event.hpDamage||0} · 방어막 ${event.absorbed||0}`;layer.append(damage);
      if(event.hpDamage>0){stage.classList.add('player-hit');layer.insertAdjacentHTML('beforeend','<div class="hurt-vignette"></div>');}
      else if(event.absorbed>0)layer.insertAdjacentHTML('beforeend','<div class="first-person-barrier collision"></div>');
    }
    if(['guard','curse','web','stone','steal','poison','shift'].includes(event.kind)){label.className='special-caption';layer.append(label);}
    if(event.kind==='enemy'&&!event.suppressed){const gesture=document.createElement('div');gesture.className='enemy-gesture';gesture.textContent=enemyGesture(event.monster??0,event.variation??0);layer.append(gesture);}if(event.type==='lightning'&&event.impacts?.length>1){const parent=stage.getBoundingClientRect(),points=event.impacts.map(hit=>{const box=document.querySelector(`[data-enemy-id="${hit.enemyId}"]`)?.getBoundingClientRect();return box?`${box.left+box.width/2-parent.left},${box.top+box.height*.5-parent.top}`:'';}).filter(Boolean);layer.insertAdjacentHTML('beforeend',`<svg class="chain-link" viewBox="0 0 ${parent.width} ${parent.height}"><polyline points="${points.join(' ')}"/></svg>`);event.impacts.forEach((hit,i)=>{this.handles.push(setTimeout(()=>{const enemy=document.querySelector(`[data-enemy-id="${hit.enemyId}"]`),box=enemy?.getBoundingClientRect();if(!box)return;document.querySelectorAll('.enemy-card').forEach(e=>e.classList.remove('focused'));enemy.classList.add('focused');stage.style.setProperty('--camera-x',`${(parent.left+parent.width/2-box.left-box.width/2)*.035}px`);},i*180));});}if(event.impacts?.length>1){layer.classList.add('multi-impact');for(const [i,hit]of event.impacts.entries()){const enemy=document.querySelector(`[data-enemy-id="${hit.enemyId}"]`);if(!enemy)continue;const box=enemy.getBoundingClientRect(),parent=stage.getBoundingClientRect(),mark=document.createElement('span');mark.className='enemy-impact-label';mark.textContent=`−${hit.damage}`;mark.style.left=`${box.left+box.width/2-parent.left}px`;mark.style.animationDelay=`${event.type==='lightning'?i*.18:0}s`;layer.append(mark);}}stage.append(layer);
    this.handles.push(setTimeout(()=>this.clear(),2200));
  }
}
