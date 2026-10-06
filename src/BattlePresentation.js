import {artHTML} from './AssetManifest.js';
import {equipmentById} from './EquipmentData.js';
import {monsterAt} from './MonsterRegistry.js';

export const ImpactTiming={C:{prepare:100,recover:240,stop:0,shake:0},B:{prepare:150,recover:310,stop:18,shake:2},A:{prepare:230,recover:420,stop:65,shake:5},S:{prepare:350,recover:520,stop:110,shake:8}};
export function presentationPreferences(value={}){return {detail:['rich','normal','simple'].includes(value.detail)?value.detail:'normal',fast:value.fast===true,reduced:value.reduced===true};}
export function presentationDuration(grade,settings={},repeat=false){const p=presentationPreferences(settings),t=ImpactTiming[grade]||ImpactTiming.B;return Math.round((t.prepare+t.recover)*(p.fast?.55:1)*(p.detail==='simple'?.65:1)*(repeat?.8:1));}
export function impactMaterial(type=''){if(/golem|Guardian|seal/.test(type)&&!/(tree|dragon)/i.test(type))return 'stone';if(/tree|mushroom|root|vine|wolf/i.test(type))return 'leaf';if(/fire|flame|lava|imp/i.test(type))return 'ember';if(/dragon|wyvern/i.test(type))return 'scale';if(/knight|soldier|commander|royal|skeleton/i.test(type))return 'metal';if(/king/i.test(type))return 'void';return 'arcane';}
export function equipmentPresentation(character,event){if(!character||!event.equipmentBonus)return [];return Object.values(character.equipment||{}).map(equipmentById).filter(Boolean).filter(item=>{const e=item.specialEffects;if(!e?.effectType)return false;const grade=event.action?.targetGrade;return event.kind==='attack'?(e.effectType==='ATTACK_GRADE_BONUS'||e.effectType==='BOSS_BREAK_BONUS'&&event.action?.bossRelicBonus>0)&&(Array.isArray(e.trigger)?e.trigger.includes(grade):e.trigger===grade):event.kind==='defense'?e.effectType==='DEFENSE_GRADE_BONUS'&&(Array.isArray(e.trigger)?e.trigger.includes(grade):e.trigger===grade):event.kind==='magic'?e.effectType==='SCROLL_POWER_BONUS':event.kind==='victory'?e.effectType==='VICTORY_HEAL':false;}).map(item=>({id:item.id,name:item.name}));}

// Observes committed result events only. It never reads or writes combat HP,
// inventory, timers, checkpoints, pressure or reward ledgers.
export class BattlePresentation{
 constructor({settings=()=>({}),character=()=>null,audio=null}={}){Object.assign(this,{settings,character,audio});this.handles=new Set();this.animations=new Set();this.nodes=new Set();this.seen=new Set();this.token=0;}
 later(fn,ms){const id=setTimeout(()=>{this.handles.delete(id);fn();},ms);this.handles.add(id);return id;}
 animate(el,frames,options){if(!el?.animate)return;const animation=el.animate(frames,options);this.animations.add(animation);animation.onfinish=()=>{this.animations.delete(animation);animation.cancel();};return animation;}
 clear(){this.token++;for(const id of this.handles)clearTimeout(id);this.handles.clear();for(const a of this.animations)a.cancel();this.animations.clear();for(const node of this.nodes)node.remove();this.nodes.clear();document.querySelectorAll('.bp-hit-stop').forEach(e=>e.classList.remove('bp-hit-stop'));}
 reset(){this.clear();this.seen.clear();}
 show(event,stage,target){if(!stage)return;this.clear();const p=presentationPreferences(this.settings()),grade=event.grade||event.action?.targetGrade||'B',timing=ImpactTiming[grade]||ImpactTiming.B,key=event.kind==='magic'?'scroll:'+event.type:event.kind==='attack'?'grade:'+grade:event.kind;const repeat=this.seen.has(key);this.seen.add(key);stage.dataset.presentationDetail=p.detail;stage.dataset.fastBattle=String(p.fast);const root=document.createElement('div');root.className='bp-layer bp-'+event.kind;root.dataset.grade=grade;root.dataset.spell=event.type||'';root.setAttribute('aria-hidden','true');this.nodes.add(root);stage.append(root);const create=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text!==undefined)node.textContent=text;root.append(node);return node;};const life=p.fast?650:1300;
 if(event.kind==='attack-windup'){if(equipmentById(this.character()?.equipment?.weapon)?.id==='sage_staff')this.staffVariation=((this.staffVariation??-1)+1)%3;
  create('b','bp-grade-seal',grade);if((grade==='S'||event.finalHit)&&p.detail!=='simple'&&(!repeat||event.finalHit)){create('div','bp-focus');const cut=create('div','bp-hero-cut');cut.innerHTML=artHTML('hero',{eager:true});const weapon=equipmentById(this.character()?.equipment?.weapon);if(weapon)cut.insertAdjacentHTML('beforeend','<span class="bp-weapon">'+artHTML(weapon.id,{eager:true})+'</span>');}
 }
 if(['attack','magic'].includes(event.kind)&&event.damage>0){
  if(equipmentById(this.character()?.equipment?.weapon)?.id==='sage_staff'){create('div','bp-staff-wave staff-variant-'+(this.staffVariation??0));root.dataset.weapon='staff';}
  const type=event.enemyType||target?.dataset.type||monsterAt(event.monster||0)?.id||'',material=impactMaterial(type);root.dataset.material=material;
  const body=target?.querySelector('.enemy-body')||stage.querySelector('.monster-art');const heavy=!!event.bossReaction;const distance=p.reduced?0:(heavy?3:9)*(grade==='S'?1.5:1);if(distance)this.animate(body,[{transform:'translateX(0)'},{transform:'translateX('+distance+'px) rotate('+(heavy?1:3)+'deg)'},{transform:'translateX(0)'}],{duration:p.fast?210:360});
  if(!p.reduced&&p.detail!=='simple'){
   const stop=event.bossBreak||event.finisher?Math.max(110,timing.stop):timing.stop;body?.classList.add('bp-hit-stop');this.later(()=>body?.classList.remove('bp-hit-stop'),stop);
   if(['A','S'].includes(grade)||event.bossBreak)create('div','bp-impact-frame');const strength=timing.shake*(p.detail==='rich'?1.2:1);if(strength)this.animate(stage,[{transform:'translate(0,0)'},{transform:'translate('+strength+'px,-2px) scale(1.008)'},{transform:'translate(-'+strength/2+'px,1px)'},{transform:'translate(0,0)'}],{duration:160});
  }
  const count=p.reduced?0:p.detail==='simple'?3:p.detail==='rich'?16:9;for(let i=0;i<count;i++){const part=create('i','bp-particle');part.style.setProperty('--angle',(i*360/Math.max(1,count))+'deg');part.style.setProperty('--distance',(40+(i%4)*17)+'px');part.style.setProperty('--delay',(i%3)*12+'ms');}
  const number=stage.querySelector('.effect-layer .damage-number');number?.classList.add('bp-damage');if(number){number.dataset.grade=grade;number.classList.toggle('bp-break-number',!!event.bossBreak||event.bossReaction==='break');}
 }
 if(event.finalHit&&event.finalExpression){create('b','bp-final-equation',event.finalExpression+' · 정답!');create('div','bp-final-runes','◆  ✦  ◈  ♜  ✧');}
 if(event.bossBreak){create('div','bp-break-rings');create('b','bp-break-caption','BREAK · 약점 노출! 지금 공격!');this.audio?.duck?.(450);}
 if(event.kind==='defense'||event.kind==='barrier'||event.kind==='block'){create('div','bp-defense-ring');if(event.kind==='block'){create('div','bp-shattered-chain');create('b','bp-block-caption','특수 공격 차단!');}}
 if(['scroll-open','magic-launch','magic'].includes(event.kind)){
  create('div','bp-spell-circle');if(event.type==='fire')create('div','bp-fireball');if(['ice','iceStorm'].includes(event.type)){create('div','bp-frost-edge');for(let i=0;i<(event.type==='iceStorm'?5:2);i++){const ice=create('i','bp-ice-shard');ice.style.setProperty('--i',i);}}
  if(event.type==='lightning'){create('div','bp-electric-rune');for(const [i,hit]of (event.impacts||[]).entries()){this.later(()=>{const card=stage.querySelector('[data-enemy-id="'+hit.enemyId+'"]');if(card&&!p.reduced)this.animate(card,[{filter:'brightness(1)'},{filter:'brightness(1.35)'},{filter:'brightness(1)'}],{duration:110});},i*(p.fast?75:150));}}
  if(event.type==='meteor'){create('div','bp-meteor-sky');create('div','bp-meteor');}
  if(event.type==='heal'){create('div','bp-heal-pillar');create('b','bp-life-number','HP +'+(event.heal||0));}if(event.type==='cleanse')create('div','bp-shattered-chain');if(event.type==='shield')create('div','bp-shield-panels');if(event.type==='time')create('div','bp-time-clock','◷');
 }
 const equipment=equipmentPresentation(this.character(),event);if(equipment.length){const proc=create('div','bp-equipment');for(const item of equipment){const badge=document.createElement('span');badge.dataset.equipment=item.id;badge.innerHTML=artHTML(item.id,{eager:true});const text=document.createElement('b');text.textContent=item.name;badge.append(text);proc.append(badge);}const total=document.createElement('small');total.textContent=(event.kind==='victory'?'생명의 씨앗 · 실제 HP 회복 +':'장비 효과 +')+event.equipmentBonus;proc.append(total);}
 this.later(()=>{root.remove();this.nodes.delete(root);},life);
 }
}
