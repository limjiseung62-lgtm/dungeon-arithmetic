import {ExtraMercenaryData} from './ExtraMercenaryData.js';
const merc=(id,name,grade,role,cost,description,trigger,effect,value,limit,dialogue)=>({id,name,grade,role,hireCost:cost,description,trigger,effect,effectValue:value,maxPerEncounter:limit,grades:grade==='B'?['A','S']:['S'],defenseValue:10,portraitAsset:`assets/mercenaries/${id}.webp`,battleAsset:`assets/mercenaries/${id}.webp`,dialogue,isCoreMercenary:true,dialogues:[dialogue,'좋은 판단이야. 함께 해내자!']});
export const MercenaryData=[
 merc('rowen','로웬','B','궁수',260,'공격 A/S 성공 시 화살 피해 +5 · 전투당 최대 3회','attack','damage',5,3,'정확한 계산이야! 내가 마무리할게!'),
 merc('bram','브람','B','기사',240,'방어 A/S 성공 시 방어막 +6 · 전투당 최대 3회','defense','shield',6,3,'좋은 판단이다. 뒤는 내가 맡지!'),
 merc('sera','세라','A','성직자',480,'계산에 성공한 전투 승리마다 HP +12 · 최대 HP까지','victory','heal',12,1,'아직 모험은 끝나지 않았어요.'),
 merc('luna','루나','A','마법사',520,'공격 S로 두루마리 사용 시 피해·회복·방어막 +6 · 전투당 2회','magic','scroll',6,2,'좋아. 그 마법, 내가 증폭시켜 줄게!'),
 merc('kain','카인','S','검성',1050,'공격 S 성공 시 참격 피해 +12 · 전투당 최대 2회','attack','damage',12,2,'훌륭한 답이다. 다음은 내 차례군.'),
 merc('elia','엘리아','S','대현자',1150,'공격 S 피해 +8 또는 방어 S 방어막 +10 · 전투당 합계 3회','dual','adaptive',8,3,'정답은 힘이 되지. 보여주마.')
];
const normalValues={rowen:3,bram:4,sera:5,luna:3,kain:5,elia:4};
const costs={rowen:520,bram:500,sera:1200,luna:1400,kain:2600,elia:2900};
for(const m of MercenaryData)Object.assign(m,{hireCost:costs[m.id],recruitCost:costs[m.id],supportTrigger:m.trigger,supportEffect:m.effect,supportValue:normalValues[m.id],supportPresentation:m.id,personality:({rowen:'성실하고 정확한 궁수',bram:'동료의 등을 지키는 기사',sera:'끝까지 포기하지 않는 치유자',luna:'호기심 많은 마력 연구자',kain:'패배를 넘어선 검성',elia:'오랜 지혜를 나누는 현자'})[m.id]});
for(const m of MercenaryData)m.description=({rowen:'공격 A/S 화살 피해 +3 · 전투당 최대 3회',bram:'방어 A/S 방어막 +4 · 전투당 최대 3회',sera:'계산에 성공한 전투 승리마다 HP +5 · 최대 HP까지',luna:'S 두루마리 효과 +3 · 전투당 최대 2회',kain:'공격 S 참격 피해 +5 · 전투당 최대 2회',elia:'공격 S 피해 +4 또는 방어 S 방어막 +4 · 합계 3회'})[m.id];
MercenaryData.push(...ExtraMercenaryData);
export const CoreMercenaryData=MercenaryData.filter(m=>m.isCoreMercenary);
export const mercenaryById=id=>MercenaryData.find(m=>m.id===id)||null;
