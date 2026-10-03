import {displayText} from './LocalizedText.js';
export class VisualEffects{
  constructor(sound){this.sound=sound;this.handles=[];}
  clear(){for(const id of this.handles)clearTimeout(id);this.handles=[];document.querySelectorAll('.effect-layer').forEach(e=>e.remove());const stage=document.querySelector('.battle-stage');if(stage)for(const name of ['sword-strike','sword-recover','monster-hit','monster-lunge','player-hit','guard-hit','reassemble','time-steal'])stage.classList.remove(name);}
  show(event){
    this.clear();const stage=document.querySelector('.battle-stage');if(!stage)return;
    stage.dataset.effect=event.kind;if(!['attack-windup','enemy-windup','magic-launch','enemy'].includes(event.kind))this.sound(event.kind,{grade:event.action?.targetGrade,type:event.type});if(event.kind==='enemy'){if(event.hpDamage)this.sound('enemy');if(event.absorbed)this.sound('collision');if(event.absorbed>0&&event.hpDamage>0)this.sound('break');}
    const layer=document.createElement('div');layer.className=`effect-layer fx-${event.kind}`;layer.setAttribute('aria-hidden','true');
    const label=document.createElement('div');label.className='cinematic-label';label.textContent=displayText(event.text);
    if(['battle','total','turn-end','block','victory','gameover'].includes(event.kind))layer.append(label);
    if(event.kind==='attack-windup')stage.classList.add('sword-strike');
    if(event.kind==='attack'){
      stage.classList.add('sword-recover','monster-hit');stage.dataset.hitGrade=event.action.targetGrade;layer.innerHTML='<div class="sword-trail"></div><div class="impact-spark"></div>';
      const number=document.createElement('div');number.className='damage-number';number.textContent=`${event.action.playerId+1}P · ${event.damage}`;layer.append(number);
    }
    if(event.kind==='scroll-open'){
      const title={fire:'파이어볼',lightning:'번개',ice:'얼음 마법',heal:'회복 마법'}[event.type];
      layer.innerHTML=`<div class="spell-runes">✧ ⟡ ✦ ⟡ ✧</div><div class="unfurled-scroll"><i></i><div class="rune-seal">✧</div><b>${title}</b><span>스크롤 발동!</span><i></i></div>`;
    }
    if(event.kind==='magic-launch'){layer.classList.add(`spell-${event.type}`);layer.innerHTML='<div class="magic-projectile"></div>'; }
    if(event.kind==='magic'){
      stage.classList.add('monster-hit');layer.classList.add(`spell-${event.type}`);
      layer.innerHTML='<div class="magic-projectile"></div><div class="magic-explosion"></div><div class="magic-ring"></div>';
      const number=document.createElement('div');number.className='damage-number magic-number';number.textContent=event.damage?`피해 ${event.damage}`:`HP +${event.heal}`;layer.append(number);
    }
    if(event.kind==='defense'||event.kind==='barrier')layer.innerHTML=`<div class="first-person-barrier"></div><div class="shield-caption">${event.kind==='defense'?`방어막 +${event.shieldGain}`:'특수 공격 방어 준비!'}</div>`;
    if(event.kind==='block'){
      layer.insertAdjacentHTML('afterbegin','<div class="first-person-barrier"></div><div class="broken-special">✦</div>');
    }
    if(event.kind==='enemy'){
      stage.classList.add('monster-lunge');
      if(event.absorbed>0){stage.classList.add('guard-hit');layer.innerHTML='<div class="first-person-barrier collision"></div><div class="guard-impact"></div>';}
      if(event.hpDamage>0){stage.classList.add('player-hit');layer.insertAdjacentHTML('beforeend','<div class="hurt-vignette"></div>');}
      const caption=document.createElement('div');caption.className='shield-caption';caption.textContent=event.hpDamage>0?`${event.absorbed>0?"방어막 파괴! · ":""}HP −${event.hpDamage} · 방어막 흡수 ${event.absorbed}`:`완벽 방어! 방어막 −${event.absorbed}`;layer.append(caption);
    }
    if(event.kind==='shift')stage.classList.add('reassemble');
    if(event.kind==='steal')stage.classList.add('time-steal');
    if(event.kind==='poison'){
      layer.innerHTML='<div class="poison-vignette"></div>';const damage=document.createElement('div');damage.className='shield-caption';damage.textContent=`중독 피해 −${event.hpDamage||0} · 방어막 ${event.absorbed||0}`;layer.append(damage);
      if(event.hpDamage>0){stage.classList.add('player-hit');layer.insertAdjacentHTML('beforeend','<div class="hurt-vignette"></div>');}
      else if(event.absorbed>0)layer.insertAdjacentHTML('beforeend','<div class="first-person-barrier collision"></div>');
    }
    if(['curse','web','stone','steal','poison','shift'].includes(event.kind)){label.className='special-caption';layer.append(label);}
    stage.append(layer);
    this.handles.push(setTimeout(()=>this.clear(),2200));
  }
}

