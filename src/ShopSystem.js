import {equipmentById} from './EquipmentData.js';
import {normalizeEquipment} from './EquipmentSystem.js';
export function buyItem(character,id){normalizeEquipment(character);const item=equipmentById(id);if(!item)return {ok:false,message:'상품을 찾을 수 없어요.'};if(character.gold<item.buyPrice)return {ok:false,message:'골드가 부족합니다.'};character.gold-=item.buyPrice;character.inventory.items.push(id);return {ok:true,message:`${item.name}을(를) 샀어요.`};}
