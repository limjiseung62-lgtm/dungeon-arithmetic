export function takeDamage(state,damage,source){
  if(source==='enemy')damage=state.battleContext?.incomingDamageModifier?.(state,damage)??damage;
  const absorbed=Math.min(state.hero.shield,damage);state.hero.shield-=absorbed;
  const hpDamage=damage-absorbed;state.hero.hp=Math.max(0,state.hero.hp-hpDamage);
  return {absorbed,hpDamage};
}
