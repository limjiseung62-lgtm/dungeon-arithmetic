import {GameConfig as config} from './GameConfig.js';
export function rollDice(rng=Math.random){return config.diceSides.map(s=>1+Math.floor(rng()*s));}
export function shuffle(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
