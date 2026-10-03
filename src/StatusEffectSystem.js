import {GameConfig as config} from './GameConfig.js';import {takeDamage} from './DefenseSystem.js';
export function tickPoison(state){
  if(!state.hero.poison)return null;
  state.hero.poison--;return takeDamage(state,config.poisonDamage);
}
