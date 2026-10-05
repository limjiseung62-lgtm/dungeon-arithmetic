// Presentation only. IDs never participate in save data or game rules.
export const ArtManifest = {
 ...Object.fromEntries([['royalGuard','마왕의 근위병'],['abyssMage','심연 마도사'],['sealGuardian','봉인 수호자'],['castleInterior','마왕의 성 내부'],['sealChamber','봉인의 방'],['throneDoor','왕좌의 문']].map(([id,alt])=>[id,{src:'assets/castle-v33/'+id+'.webp',alt}])),
 town:{src:'assets/remaster/town.webp',alt:'바람빛 마을'},
 weapon:{src:'assets/remaster/weapon.webp',alt:'무기점'},
 armorShop:{src:'assets/remaster/armorShop.webp',alt:'방어구점'},
 accessory:{src:'assets/remaster/accessory.webp',alt:'장신구 상점'},
 guild:{src:'assets/remaster/guild.webp',alt:'모험가 길드'},
 mercenaries:{src:'assets/remaster/mercenaries.webp',alt:'용병 길드'},
 hero:{src:'assets/remaster/hero.webp',alt:'바람빛 마을의 모험가'},
 prison:{src:'assets/dungeon-v2.png',alt:'오래된 지하감옥'},
 mine:{src:'assets/mine-v26/mine.webp',alt:'불타는 광산'},
 forest:{src:'assets/forest-v22.webp',alt:'저주받은 숲'},
};
for(const id of ['golem_core_shield','life_seed','flame_greatsword'])ArtManifest[id]={src:'assets/collection-v28/'+id+'.webp',alt:id,columns:1,index:0,thumb:'assets/collection-v28/'+id+'.webp'};
export const AssetPaths={fireImp:'assets/mine-v26/fireImp.webp',lavaMiner:'assets/mine-v26/lavaMiner.webp',fireScorpion:'assets/mine-v26/fireScorpion.webp',magmaGuard:'assets/mine-v26/magmaGuard.webp',flameGiant:'assets/mine-v26/flameGiant.webp',dungeon:'assets/dungeon-v2.png',skeleton:'assets/skeleton-v2.png',goblin:'assets/goblin-v2.png',orc:'assets/orc-v2.png',spider:'assets/spider-v2.png',golem:'assets/golem-v2.png',vineSlime:'assets/vineSlime-v22.webp',shadowWolf:'assets/shadowWolf-v22.webp',mushroomSpirit:'assets/mushroomSpirit-v22.webp',forestSpirit:'assets/forestSpirit-v22.webp',treeGuardian:'assets/treeGuardian-v22.webp'};
for(const id of ['demonSoldier','darkArcher','demonCommander','darkPriest','darkKnight'])AssetPaths[id]='assets/fortress-v30/'+id+'.webp';ArtManifest.knightDown={src:'assets/fortress-v30/knightDown.webp',alt:'무릎 꿇은 어둠의 기사'};ArtManifest.throne={src:'assets/fortress-v30/throne.webp',alt:'마왕의 왕좌와 세 군단장'};ArtManifest.fortress={src:'assets/fortress-v30/fortress.webp',alt:'검은 성채'};ArtManifest.dark_greatsword={src:'assets/fortress-v30/dark_greatsword.webp',thumb:'assets/fortress-v30/dark_greatsword.webp',columns:1,index:0,alt:'흑기사의 대검'};
for(const [id,src]of Object.entries(AssetPaths))ArtManifest[id]={src,alt:id};
for(const id of ['rowen','bram','sera','luna','kain','elia'])ArtManifest[id]={src:`assets/mercenaries/${id}.webp`,alt:id};
const groups = {
 weapons:['old_sword','steel_sword','rogue_dagger','sage_staff'],
 armor:['leather_armor','iron_armor','guardian_armor','mage_armor'],
 accessories:['power_ring','life_necklace','guardian_charm','sage_ring'],
 scrolls:['fire','ice','iceStorm','shield','heal','lightning','cleanse','meteor','time']
};
for(const [group,ids] of Object.entries(groups)) ids.forEach((id,index)=>{
 const columns=group==='scrolls'?3:2;
 ArtManifest[id]={src:`assets/remaster/${group}.webp`,thumb:`assets/remaster/${group}-thumb.webp`,alt:id,columns,index};
});
export function artHTML(id,{className='',label='',eager=false,full=false,deferFull=false}={}) {
 const a=ArtManifest[id];if(!a)return `<span class="art-fallback">${label||'모험의 유물'}</span>`;
 const alt=label||a.alt;
 if(a.columns){const n=a.columns,x=a.index%n,y=Math.floor(a.index/n);
 return `<svg class="relic-art ${className}" data-art="${id}" viewBox="0 0 100 100" role="img" aria-label="${alt}"><title>${alt}</title><svg viewBox="${x*100} ${y*100} 100 100" x="0" y="0" width="100" height="100" overflow="hidden"><image href="${full&&!deferFull?a.src:a.thumb}" ${deferFull?`data-full-src="${a.src}"`:''} width="${n*100}" height="${n*100}" preserveAspectRatio="none"/></svg></svg>`;}
 return `<img class="environment-art ${className}" role="img" data-art="${id}" src="${a.src}" alt="${alt}" width="${id==='hero'?667:1600}" height="${id==='hero'?1000:900}" loading="${eager?'eager':'lazy'}" decoding="async" draggable="false">`;
}
export function installArtTheme(){
 if(typeof document==='undefined')return;
 document.addEventListener('toggle',e=>{if(e.target.matches?.('.item-detail[open]'))for(const img of e.target.querySelectorAll('image[data-full-src]'))img.setAttribute('href',img.dataset.fullSrc);},true);
 for(const id of ['town','prison','forest'])document.documentElement.style.setProperty(`--art-${id}`,`url("${ArtManifest[id].src}")`);
 document.addEventListener('click',e=>{if(!e.target.closest?.('[data-action="rpg-enter"]'))return;for(const id of ['town','hero']){if(document.querySelector(`link[data-preload="${id}"]`))continue;const link=document.createElement('link');link.rel='preload';link.as='image';link.href=ArtManifest[id].src;link.dataset.preload=id;document.head.append(link);}},true);
 document.addEventListener('error',e=>{const el=e.target;if(el?.matches?.('img[data-art]')){el.classList.add('art-missing');el.removeAttribute('src');}else if(el?.tagName?.toLowerCase()==='image'&&el.closest?.('.relic-art')){const svg=el.closest('.relic-art');el.remove();const t=document.createElementNS('http://www.w3.org/2000/svg','text');const [x,y]=svg.getAttribute('viewBox').split(' ').map(Number);t.setAttribute('x',x+50);t.setAttribute('y',y+50);t.setAttribute('text-anchor','middle');t.setAttribute('fill','#ecdab9');t.setAttribute('font-size','10');t.textContent=svg.getAttribute('aria-label');svg.append(t);svg.classList.add('art-missing');}},true);
}

for(const id of ['bookSpirit','illusionist','chaosApostle','timeKeeper','chaosMage']){AssetPaths[id]='assets/chaos-v31/'+id+'.webp';ArtManifest[id]={src:AssetPaths[id],alt:({bookSpirit:'마도서 정령',illusionist:'환영술사',chaosApostle:'혼돈의 사도',timeKeeper:'시간 파수꾼',chaosMage:'혼돈의 마법사'})[id]};}ArtManifest.mageDown={src:'assets/chaos-v31/mageDown.webp',alt:'무릎 꿇은 혼돈의 마법사'};ArtManifest.tower={src:'assets/chaos-v31/tower.webp',alt:'혼돈의 마탑'};ArtManifest.chaos_grimoire={src:'assets/chaos-v31/chaos_grimoire.webp',thumb:'assets/chaos-v31/chaos_grimoire.webp',columns:1,index:0,alt:'혼돈의 마도서'};

for(const id of ['dragonLizard','fireWyvern','dragonGuard','dragonShaman','dragonGuardian']){AssetPaths[id]='assets/canyon-v32/'+id+'.webp';ArtManifest[id]={src:AssetPaths[id],alt:id};}for(const id of ['canyon','dragonNest','dragon_heart'])ArtManifest[id]={src:'assets/canyon-v32/'+id+'.webp',alt:({canyon:'천공의 용암 협곡',dragonNest:'거대한 용의 둥지',dragon_heart:'용의 심장'})[id]};

ArtManifest.dragon_heart={...ArtManifest.dragon_heart,thumb:ArtManifest.dragon_heart.src,columns:1,index:0};ArtManifest.castleGate={src:'assets/canyon-v32/castleGate.webp',alt:'결계가 열린 마왕의 성'};

ArtManifest.kingAwakens={src:'assets/canyon-v32/kingAwakens.webp',alt:'왕좌에서 눈을 뜨는 마왕'};

for(const id of ['royalGuard','abyssMage','sealGuardian'])AssetPaths[id]=ArtManifest[id].src;
