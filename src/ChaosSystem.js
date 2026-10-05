import {takeDamage} from './DefenseSystem.js';
export const ChaosConfig={max:3,warningSeconds:10,maskSeconds:5,maskCount:2,timePenalty:5,illusionDamage:.6,bodyPressure:1};
export const inTower=s=>s?.battleContext?.mode==='rpg'&&s.battleContext.dungeonId==='chaos-tower';
export function initChaos(s){if(inTower(s)){s.chaos={level:0,defeated:[],shuffle:false,prophecy:false,mask:false,timePenalty:0};s.chaosTurn=null;}}
export function chaosKills(s){if(!inTower(s))return false;let changed=false;for(const e of s.enemies){if(e.hp>0||s.chaos.defeated.includes(e.id))continue;s.chaos.defeated.push(e.id);if(['chaosApostle','illusionist','bookSpirit'].includes(e.type)){s.chaos.level=Math.max(0,s.chaos.level-1);changed=true;}}return changed;}
// Presentation metadata never replaces dice, target values, grades or their solutions.
export function chaosTurn(s){if(!inTower(s))return;const c=s.chaos,b=s.enemies.find(e=>e.type==='chaosMage'),phase=b?.boss?.phase||0;
 s.duration=Math.max(50,s.duration-c.timePenalty);s.seconds=s.duration;c.timePenalty=0;
 if(c.shuffle||phase>=2){for(const side of ['attack','defense'])for(const t of s.targets.filter(t=>t.side===side))t.position=(t.position+1+(s.enemyTurn%2))%4;}
 const mask=(c.mask||phase>=2||c.level>=2)&&!b?.boss?.breakTurns;
 s.chaosTurn={maskIds:mask?s.targets.filter(t=>t.grade==='A').map(t=>t.id).slice(0,ChaosConfig.maskCount):[],prophecy:c.prophecy||s.enemyTurn===1&&s.enemies.some(e=>e.type==='illusionist'&&e.hp>0)||phase>0||c.level===3,body:phase===3&&!b.boss.breakTurns?(s.enemyTurn+1)%3:null};c.shuffle=false;c.mask=false;c.prophecy=false;
}
export const chaosMasked=(s,t)=>inTower(s)&&s.phase==='playing'&&!t.used&&s.chaosTurn?.maskIds.includes(t.id)&&s.elapsed>=ChaosConfig.warningSeconds&&s.elapsed<ChaosConfig.warningSeconds+Math.max(1,ChaosConfig.maskSeconds-(s.battleContext.chaosReveal||0));
export function chaosSpecial(s,e,sp){if(!inTower(s))return false;const c=s.chaos;
 if(sp==='pageShuffle'){c.shuffle=true;return true;}if(sp==='falseProphecy'){c.prophecy=true;return true;}if(sp==='chaosAmplify'){c.level=Math.min(ChaosConfig.max,c.level+1);return true;}if(sp==='timeWarp'){c.timePenalty=ChaosConfig.timePenalty;return true;}if(sp==='spaceCollapse'){c.shuffle=true;c.mask=true;return true;}if(sp==='chaosExplosion'){takeDamage(s,e.intent.extraDamage||8,'enemy');c.level=Math.min(ChaosConfig.max,c.level+1);return true;}return false;
}
export const bodyActive=s=>inTower(s)&&s.chaosTurn?.body!==null&&s.chaosTurn?.body!==undefined&&s.enemies.some(e=>e.type==='chaosMage'&&e.hp>0&&!e.boss.breakTurns);
export function bodyDamage(s,e,a,amount){if(!bodyActive(s)||e.type!=='chaosMage')return amount;return a.appearance===s.chaosTurn.body?amount:Math.max(1,Math.round(amount*ChaosConfig.illusionDamage));}
export function bodyBreak(s,e,a){if(e?.type!=='chaosMage'||!bodyActive(s))return true;if(a.appearance!==s.chaosTurn.body)return false;if(['A','S'].includes(a.targetGrade))e.boss.pressure=Math.min(3,e.boss.pressure+ChaosConfig.bodyPressure);return true;}
export function collapseIllusions(s){if(!inTower(s))return;s.chaos.level=Math.max(0,s.chaos.level-2);if(s.chaosTurn)s.chaosTurn.body=null;}
export function chaosHTML(s){if(!inTower(s))return '';const t=s.chaosTurn,mask=t?.maskIds.length,duration=Math.max(1,ChaosConfig.maskSeconds-(s.battleContext.chaosReveal||0)),stage=s.elapsed<ChaosConfig.warningSeconds?`⚠ ${Math.max(0,ChaosConfig.warningSeconds-s.elapsed)}초 뒤 목표 숫자 ${mask}개가 ${duration}초 동안 가려집니다!`:s.elapsed<ChaosConfig.warningSeconds+duration?'일부 숫자 가림 · 곧 다시 나타납니다.':'숫자가 다시 나타났습니다.';return `<aside class="chaos-hud" role="status"><b>🔮 혼돈 ${s.chaos.level} / ${ChaosConfig.max}</b><span>0 정상 · 1 위치 · 2 일시 가림 · 3 환영 강화</span><small>${mask?stage:'정답·주사위는 그대로 · 사도를 먼저 처치하면 혼돈 감소'}</small>${s.enemyTurn===1&&s.chaosTutorial?'<p>혼돈의 마법은 가짜 행동을 보여줍니다. 진짜 마법에는 작은 ✦ 문양이 남아 있습니다. 본체의 마법진도 같은 문양을 품습니다.</p>':''}</aside>`;}
