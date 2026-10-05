const table=(scrollChance,scrolls,equipmentChance,equipment)=>({scrollChance,scrolls,equipmentChance,equipment});
// Gold is the existing monster gold reward, not a second copy of it.
export const LootTable={bookSpirit:table(.3,['shield','heal'],.1,['sage_staff','mage_armor']),illusionist:table(.3,['ice','time'],.1,['guardian_charm','sage_ring']),chaosApostle:table(.35,['heal','cleanse'],.12,['mage_armor','sage_staff']),timeKeeper:table(.3,['time','shield'],.12,['guardian_armor','life_necklace']),chaosMage:table(.4,['meteor','heal','time'],.14,['sage_staff','mage_armor','sage_ring']),demonSoldier:table(.25,['shield','heal'],.1,['steel_sword','iron_armor']),darkArcher:table(.25,['time','lightning'],.1,['rogue_dagger','guardian_charm']),demonCommander:table(.3,['shield','meteor'],.13,['guardian_armor','sage_ring']),darkPriest:table(.35,['heal','cleanse'],.12,['mage_armor','sage_staff']),darkKnight:table(.4,['meteor','heal','shield'],.14,['guardian_armor','mage_armor','sage_ring']),
 fireImp:table(.2,['fire','heal'],.08,['steel_sword','power_ring']),
 lavaMiner:table(.24,['shield','meteor'],.09,['iron_armor','guardian_armor']),
 fireScorpion:table(.3,['cleanse','heal'],.09,['guardian_charm','life_necklace']),
 magmaGuard:table(.3,['shield','iceStorm'],.14,['guardian_armor','mage_armor']),
 flameGiant:table(.4,['meteor','heal','cleanse'],.14,['sage_staff','mage_armor','sage_ring']),
 skeleton:table(.08,['shield'],.06,['old_sword','leather_armor']),
 goblin:table(.14,['ice','time'],.07,['old_sword','power_ring','steel_sword']),
 orc:table(.2,['fire','heal','cleanse'],.05,['life_necklace','leather_armor']),
 spider:table(.18,['iceStorm','cleanse'],.04,['rogue_dagger']),
 golem:table(.3,['meteor','shield'],.12,['iron_armor','steel_sword']),
 vineSlime:table(.16,['shield','heal'],.08,['leather_armor','life_necklace']),
 shadowWolf:table(.2,['ice','time'],.09,['steel_sword','power_ring']),
 mushroomSpirit:table(.24,['cleanse','heal'],.08,['iron_armor','life_necklace']),
 forestSpirit:table(.26,['lightning','iceStorm'],.06,['guardian_charm','rogue_dagger']),
 treeGuardian:table(.4,['meteor','heal','shield'],.14,['guardian_armor','sage_staff']),
};
