import {DragonRules} from './CanyonData.js';
import {BossBattleData} from './BossBattleData.js';
export const bossData=e=>BossBattleData[e?.type];
export function initBoss(e){if(!bossData(e))return;e.boss??={phase:1,pressure:0,breakTurns:0,seedTurns:0,seedPressure:0,seedCooldown:0,announced:[],breaks:0};if(e.type==='dragonGuardian'){e.boss.stance??='GROUNDED';e.boss.groundTurns??=0;e.boss.breathCharge??=0;e.boss.phaseTurn??=0;}return e.boss;}
export function prepareBoss(s,e){const b=initBoss(e),d=bossData(e);if(!b||e.hp<=0)return;const phase=d.thresholds.reduce((n,t,i)=>e.hp/e.maxHP<=t?Math.max(n,i+1):n,1);const previous=b.phase;b.phase=Math.max(b.phase,phase);e.bossPhase=b.phase;if(e.type==='dragonGuardian'){if(previous!==b.phase){b.phaseTurn=0;b.breathCharge=0;if(b.phase===3){b.stance=b.breakTurns?'BROKEN':'GROUNDED';b.pressure=0;}else if(b.phase===2&&!b.breakTurns&&!b.groundTurns)b.stance='FLYING';}if(!b.breakTurns){if(b.phase===3){b.stance='GROUNDED';b.breathCharge=b.breathCharge?b.breathCharge:3;}else if(!b.groundTurns&&((b.phase===2)||(s.enemyTurn===3)))b.stance='FLYING';}}if(d.strategy==='regeneration'&&previous<3&&b.phase===3&&!b.breakTurns){b.seedTurns=d.seed.prepareTurns;b.seedCooldown=0;}
 if(e.type==='treeGuardian'&&!b.breakTurns&&!b.seedTurns&&b.seedCooldown===0){b.seedTurns=d.seed.prepareTurns;b.seedPressure=0;}
}
export function bossIntent(s,e,intent){const b=e.boss,d=bossData(e);if(!b)return intent;let special=intent.special,extra=0,label='',danger='주의';
 const patterns=d.patterns[b.phase-1],pattern=patterns[(s.enemyTurn-1)%patterns.length];special=pattern.special;extra=pattern.extra;label=pattern.label;
 if(e.type==='dragonGuardian'&&b.phase===3){special=b.breathCharge===1?'doomBreath':'none';extra=b.breathCharge===1?DragonRules.breathDamage:0;label=b.breathCharge===1?'⚠ 멸망의 브레스 · 발동!':'멸망의 브레스 충전 · '+(b.breathCharge-1)+'턴 뒤 발동';}
 if(d.strategy==='regeneration'&&b.seedTurns){special='regenSeed';label=b.phase===3?'마지막 재생':'재생의 씨앗';}
 if(e.type==='darkKnight'&&b.phase===3&&['blackWave','execution'].includes(special)){b.pressure=Math.max(b.pressure,1);}if(b.phase>=2)danger='위험';if(b.phase===3)danger='치명적';
 const attack=intent.attack+d.phases[b.phase-1].attack;
 return {...intent,attack:b.breakTurns?Math.round(attack*.65):attack,special:b.breakTurns?'none':special,bossLabel:b.breakTurns?'약점 노출':label,danger:b.breakTurns?'일반':danger,extraDamage:extra};
}
export const bossArmor=(e,armor)=>e?.type==='dragonGuardian'&&e.boss?.phase===3?0:e?.type==='darkKnight'&&(e.boss?.breakTurns||e.boss?.phase===3)?0:bossData(e)?.removeArmorPhase&&e.boss?.phase>=bossData(e).removeArmorPhase?0:armor;
export function bossDamage(e,amount){const b=e?.boss;if(!b||amount<=0)return amount;const multiplier=b.breakTurns?bossData(e).bonus:(bossData(e).armorMultiplier?.[b.phase-1]||1);return Math.max(1,Math.round(amount*multiplier));}
// This runs AFTER the student's hit. Triggering BREAK never adds instant damage.
export function pressureBoss(e,grade){const b=e?.boss,d=bossData(e);if(!b||!d||e.hp<=0||b.breakTurns||b.phase<(d.activationPhase||1)||d.pressureWindow==='seed'&&!b.seedTurns)return false;
 if(e.type==='dragonGuardian'&&b.stance!=='FLYING')return false;const key=e.type==='treeGuardian'?'seedPressure':'pressure';b[key]=Math.min(d.limit,b[key]+(d.pressure[grade]||0));if(b[key]<d.limit)return false;
 b[key]=0;b.breakTurns=d.duration+1;b.seedTurns=0;b.seedCooldown=4;b.breaks++;if(e.type==='dragonGuardian'){b.stance='BROKEN';b.breathCharge=0;b.groundTurns=DragonRules.groundTurns;}e.intent={...e.intent,attack:Math.round(e.intent.attack*.65),special:'none',bossLabel:'약점 노출',danger:'일반'};return true;
}
export function blockBoss(e){if(e?.boss&&e.intent?.special==='regenSeed'){e.boss.seedTurns=0;e.boss.seedPressure=0;e.boss.seedCooldown=4;}}
export function bossSpecial(s,e,sp){if(!e?.boss)return false;if(sp==='regenSeed'){const b=e.boss;if(b.seedTurns===1){e.hp=Math.min(e.maxHP,e.hp+bossData(e).seed.healing[b.phase-1]);b.seedCooldown=4;b.seedPressure=0;}return true;}
 if(['groundSmash','rootPrison','blackWave','execution','strongThrust'].includes(sp)){const damage=e.intent.extraDamage,absorbed=Math.min(s.hero.shield,damage);s.hero.shield-=absorbed;s.hero.hp=Math.max(0,s.hero.hp-damage+absorbed);return true;}return false;}
export function tickBoss(s){for(const e of s.enemies||[]){const b=e.boss;if(!b)continue;if(b.breakTurns){b.breakTurns--;if(e.type==='dragonGuardian'&&!b.breakTurns)b.stance='GROUNDED';}else if(e.type==='dragonGuardian'){if(b.groundTurns)b.groundTurns--;if(b.breathCharge)b.breathCharge--;b.phaseTurn++;}if(b.seedTurns)b.seedTurns--;else if(b.seedCooldown)b.seedCooldown--;}}
export const stoppedBossHeat=s=>(s.enemies||[]).some(e=>e.type==='flameGiant'&&e.hp>0&&e.boss?.breakTurns>0);
export function bossTransitions(e){const b=e?.boss,d=bossData(e);if(!b)return [];const result=[];for(let phase=1;phase<=b.phase;phase++)if(!b.announced.includes(phase)){b.announced.push(phase);result.push({phase,...d.phases[phase-1]});}return result;}
export function bossHint(e){const b=e?.boss,d=bossData(e);if(!b)return '';if(e.type==='dragonGuardian')return b.breakTurns?'날개 균형 붕괴! · 추락! · BROKEN · 피해 +35% · '+Math.min(d.duration,b.breakTurns)+'턴':b.stance+' · '+(b.stance==='FLYING'?'날개 BREAK '+b.pressure+'/'+d.limit:'지상 전투')+(b.phase===3?' · '+e.intent?.bossLabel:'');if(b.breakTurns)return `${e.type==='darkKnight'?'자세 붕괴! · ':''}약점 노출 · BREAK · ${Math.min(d.duration,b.breakTurns)}턴 · 피해 +${Math.round((d.bonus-1)*100)}%${e.type==='flameGiant'?' · 열기 상승 정지':''}`;return `${d.meter} ${e.type==='treeGuardian'?b.seedPressure:b.pressure}/${d.limit}${e.type==='treeGuardian'?b.seedTurns?` · 재생까지 ${b.seedTurns}턴`:' · 씨앗 대기':e.type==='flameGiant'&&b.phase<3?' · 3단계에 활성':''}`;}
