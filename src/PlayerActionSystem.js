export function nextPlayer(state){
  state.player++;
  if(state.blocked && state.player===state.blocked.slot)state.player++;
  return state.player>=state.players;
}
export function firstPlayer(state){state.player=0;if(state.blocked?.slot===0)state.player=1;return state.player>=state.players;}
