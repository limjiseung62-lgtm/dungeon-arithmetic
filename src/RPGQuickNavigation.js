export function quickNavigationAllowed(screen){return ['rpg-town','rpg-character','rpg-inventory','rpg-records','rpg-collection','rpg-mercenaries','rpg-companions','rpg-quests','rpg-guild','rpg-dungeon'].includes(screen)||/^rpg-(shop-|party:|companions:)/.test(screen);}
export function showQuickNavigation({screen,scrollY,documentHeight,viewportHeight}){return quickNavigationAllowed(screen)&&scrollY>180&&documentHeight>viewportHeight*1.35;}
export function installRPGQuickNavigation(app,getScreen){
 let disposed=false;
 const update=()=>{
  if(disposed)return;const screen=getScreen(),shell=app.querySelector('.rpg-shell');let nav=app.querySelector('.rpg-quick-nav');
  if(!shell||!quickNavigationAllowed(screen)){nav?.remove();return;}
  if(!nav){nav=document.createElement('nav');nav.className='rpg-quick-nav';nav.setAttribute('aria-label','긴 모험 화면 빠른 이동');nav.innerHTML='<button class="secondary" data-action="rpg-town">← 마을로</button><button class="secondary" data-action="rpg-page-top">↑ 맨 위로</button>';app.append(nav);}
  const visible=showQuickNavigation({screen,scrollY:window.scrollY,documentHeight:document.documentElement.scrollHeight,viewportHeight:window.innerHeight});nav.hidden=!visible||!!app.querySelector('.overlay');shell.classList.toggle('quick-nav-space',visible);
 };
 const observer=new MutationObserver(update);observer.observe(app,{childList:true});window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
 return ()=>{disposed=true;observer.disconnect();window.removeEventListener('scroll',update);window.removeEventListener('resize',update);app.querySelector('.rpg-quick-nav')?.remove();};
}
