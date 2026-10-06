import {ImpactTiming} from './BattlePresentation.js';
import {BattlePresentationManager,AnimationVariationSystem} from './AnimationVariationSystem.js';
const sharedVariations=new AnimationVariationSystem();
// Presentation controls pacing; all rule changes occur only in CombatSystem.resolveNext.
export class BattleDirector{
  constructor(combat,{effects,update,finish,scale=()=>1,special=null,dialogue=null,audio=null,beforeEnemy=null,selectScroll=null}){Object.assign(this,{combat,effects,update,finish,scale,special,dialogue,audio,beforeEnemy,selectScroll});this.presentation=new BattlePresentationManager(sharedVariations);this.skipped=false;this.cancelled=false;this.pending=new Set();}
  skip(){this.skipped=true;for(const item of this.pending){clearTimeout(item.handle);item.resolve();}this.pending.clear();}
  wait(milliseconds){if(this.skipped)return Promise.resolve();return new Promise(resolve=>{const item={resolve,handle:setTimeout(()=>{this.pending.delete(item);resolve();},milliseconds*this.scale())};this.pending.add(item);});}
  cancel(){this.cancelled=true;for(const item of this.pending){clearTimeout(item.handle);item.resolve();}this.pending.clear();}
  present(event){this.effects(this.presentation.decorate(event,this.combat.state));}
  async run(){
    this.present({kind:'battle',text:'BATTLE!'});await this.wait(700);
    while(!this.cancelled&&this.combat.state.phase==='resolution'){
      const s=this.combat.state,next=s.resolutionStage==='actions'?s.actionQueue[s.resolutionIndex]:null;
      if(s.resolutionStage==='special'&&this.special){await this.special(()=>{if(this.cancelled)return;const event=this.combat.resolveNext();this.update(event);});continue;}
      if(next?.actionType==='attack'&&next.status==='pending'){this.audio?.play('whoosh',{grade:next.targetGrade});this.present({kind:'attack-windup',text:'검격 준비',action:next});await this.wait((ImpactTiming[next.targetGrade]||ImpactTiming.B).prepare);if(this.cancelled)return;}
      if(s.resolutionStage==='enemy'&&!s.scrollStop&&(!s.enemies||this.combat.currentEnemy()?.hp>0)){if(this.beforeEnemy)await this.beforeEnemy();if(this.cancelled)return;this.audio?.play('windup');this.present({kind:'enemy-windup',text:'적의 공격 준비',enemyId:this.combat.currentEnemy()?.id,monster:this.combat.currentEnemy()?.monsterIndex});await this.wait(s.enemies?.length>1?180:500);if(this.cancelled)return;}
      if(next?.actionType==='scroll'&&next.status==='pending'){
        if(this.selectScroll)await this.selectScroll(next);if(this.cancelled)return;if(next.status!=='pending')continue;
        this.present({kind:'scroll-open',type:next.scrollEffect,text:next.name});await this.wait(550);if(this.cancelled)return;this.audio?.play('charge');await this.wait(450);if(this.cancelled)return;this.audio?.play('launch');this.present({kind:'magic-launch',type:next.scrollEffect,text:'마법 발사'});await this.wait(350);if(this.cancelled)return;
      }
      const event=this.combat.resolveNext();if(!event)break;
      this.update(event);this.present(event);if(this.dialogue)await this.dialogue(event);
      const duration={attack:event.finisher?850:(ImpactTiming[next?.targetGrade]||ImpactTiming.B).recover,magic:1100,defense:600,barrier:450,total:850,block:900,enemy:s.enemies?.length>1?350:1000,poison:650,victory:900,'turn-end':800,gameover:650};
      await this.wait((this.combat.state.monsterHP===0&&['attack','magic'].includes(event.kind))?850:duration[event.kind]||650);
    }
    if(!this.cancelled)this.finish();
  }
}
