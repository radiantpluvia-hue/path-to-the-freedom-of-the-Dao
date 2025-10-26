import type { MarketItem } from './MarketSystem';

// Large market item dataset extracted to its own module so it can be code-split
// and loaded only when the market is actually used in the browser.
export const MARKET_ITEMS: MarketItem[] = [
  // Common Items
  {
    id: 'qi_gathering_pill',
    name: 'Qi Gathering Pill',
    description: 'A basic pill that helps gather spiritual energy.',
    type: 'pill',
    rarity: "H",
    price: { yuan: 100 },
    effects: { qi: 50 },
    stock: 50,
    refreshRate: 1
  },
  {
    id: 'mortal_jian',
    name: 'Mortal-grade Jian',
    description: 'A basic mortal-grade straight sword suitable for novice cultivators.',
    type: 'weapon',
    rarity: "H",
    price: { yuan: 500 },
    effects: { atk: 10 },
    stock: 20,
    refreshRate: 3
  },
  {
    id: 'mortal_saber',
    name: 'Mortal-grade Saber',
    description: 'A sturdy mortal-grade single-edged saber favored by outer disciples.',
    type: 'weapon',
    rarity: "H",
    price: { yuan: 520 },
    effects: { atk: 12 },
    stock: 18,
    refreshRate: 3
  },
  {
    id: 'mortal_staff',
    name: 'Mortal-grade Staff',
    description: 'A mortal-grade spiritwood staff, light yet resilient.',
    type: 'weapon',
    rarity: "H",
    price: { yuan: 480 },
    effects: { atk: 9 },
    stock: 22,
    refreshRate: 3
  },
  {
    id: 'mortal_spear',
    name: 'Mortal-grade Spear',
    description: 'A balanced mortal-grade spear for decisive thrusts.',
    type: 'weapon',
    rarity: "H",
    price: { yuan: 600 },
    effects: { atk: 14 },
    stock: 16,
    refreshRate: 4
  },
  {
    id: 'mortal_dagger',
    name: 'Mortal-grade Dagger',
    description: 'A short mortal-grade dagger, quick and precise.',
    type: 'weapon',
    rarity: "H",
    price: { yuan: 450 },
    effects: { atk: 11 },
    stock: 24,
    refreshRate: 3
  },
  {
    id: 'mortal_bow',
    name: 'Mortal-grade Bow',
    description: 'A simple mortal-grade recurve bow for steady shots.',
    type: 'weapon',
    rarity: "H",
    price: { yuan: 580 },
    effects: { atk: 13 },
    stock: 12,
    refreshRate: 4
  },
  {
    id: 'rune_infused_blade',
    name: 'Rune-Infused Blade',
    description: 'A blade etched with runes that can be further enchanted; pairs well with runic fragments.',
    type: 'weapon',
    rarity: "F",
    price: { yuan: 1200 },
    effects: { atk: 22, special: ['rune_socket'] },
    stock: 3,
    refreshRate: 30
  },
  // Remaining MARKET_ITEMS extracted from MarketSystem.ts
  // New Armor Artifacts expected by tests
  {
    id: 'leather_armor',
    name: 'Reinforced Leather Armor',
    description: 'A reinforced leather armor providing solid basic protection.',
    type: 'armor',
    rarity: "G",
    price: { yuan: 800 },
    effects: { def: 20, hp: 30 },
    stock: 6,
    refreshRate: 30
  },
  {
    id: 'spirit_cloth_robe',
    name: 'Spirit Cloth Robe',
    description: 'A robe woven from spirit cloth that aids qi recovery.',
    type: 'armor',
    rarity: "G",
    price: { yuan: 1200 },
    effects: { def: 10, special: ['qi_regeneration'] },
    stock: 4,
    refreshRate: 45
  },
  {
    id: 'iron_scale_armor',
    name: 'Iron Scale Armor',
    description: 'Armor made from interlocking iron scales offering dependable defense.',
    type: 'armor',
    rarity: "G",
    price: { yuan: 1500 },
    effects: { def: 25, hp: 40 },
    stock: 3,
    refreshRate: 60
  },
  {
    id: 'runic_fragment',
    name: 'Runic Fragment',
    description: 'A shard imbued with latent runic energy used in enchantments.',
    type: 'material',
    rarity: "G",
    price: { yuan: 400 },
    effects: { runicPower: 10 },
    stock: 20,
    refreshRate: 7
  },
  {
    id: 'enchanted_gem',
    name: 'Enchanted Gem',
    description: 'A gem that stores elemental qi and can be slotted into weapons or accessories.',
    type: 'material',
    rarity: "F",
    price: { spiritStones: { low: 5 } },
    effects: { elementalCharge: 1 },
    stock: 6,
    refreshRate: 21
  },
  {
  id: 'mystic_talisman',
  name: 'Mystic Talisman',
  description: 'A talisman that boosts mystic power and increases rune potency when equipped.',
  type: 'treasure',
  rarity: "F",
  price: { yuan: 2e3 },
  effects: { mysticPower: 2, special: ["rune_amplify"] },
  stock: 4,
  refreshRate: 14
  },
  // Epic / Immortal Armor
  {
    id: 'immortal_silk_armor',
    name: 'Immortal-grade Silk Armor',
    description: 'A silk armor refined with immortal techniques granting mobility and protection.',
    type: 'armor',
    rarity: "E",
    price: { yuan: 25000 },
    effects: { def: 120, hp: 180, special: ['immortal_mobility'] },
    stock: 1,
    refreshRate: 365
  },
  {
    id: 'heaven_forged_plate',
    name: 'Heaven-grade Forged Plate',
    description: 'A plate forged with heaven-smelted ore, famed for its defensive prowess.',
    type: 'armor',
    rarity: "E",
    price: { yuan: 40000 },
    effects: { def: 150, hp: 250, special: ['heavenly_forged'] },
    stock: 1,
    refreshRate: 365
  },
  {
    id: 'enchanters_manual',
    name: "Enchanter's Manual",
    description: 'A manual teaching basic weapon enchantment techniques.',
    type: 'manual',
    rarity: "G",
    price: { yuan: 1200 },
    effects: { unlockAbility: 'weapon_enchanting' },
    stock: 5,
    refreshRate: 30
  },
  {
    id: 'bloodline_pillar_pattern',
    name: 'Bloodline Pillar Pattern',
    description: 'A blueprint used in forging bloodline pillars and artifacts.',
    type: 'material',
    rarity: "E",
    price: { spiritStones: { mid: 3 } },
    effects: { used_for: 'pillar_pattern' },
    requirements: { minRealm: 8 },
    stock: 1,
    refreshRate: 180
  },
  {
    id: 'jade_fragment',
    name: 'Jade Fragment',
    description: 'A shard of jade with lingering elemental power.',
    type: 'treasure',
    rarity: "G",
    price: { yuan: 0 },
    effects: { void_resistance: 10 },
    stock: 10,
    refreshRate: 14
  },
  {
    id: 'alchemy_kit',
    name: 'Alchemy Kit',
    description: 'Basic kit used to attempt alchemy and crafts.',
    type: 'material',
    rarity: "H",
    price: { yuan: 120 },
    effects: { alchemy_success_chance: 0.12 },
    stock: 8,
    refreshRate: 7
  },
  {
    id: 'qi_focus_charm',
    name: 'Qi Focus Charm',
    description: 'A charm that increases cultivation gain while equipped.',
    type: 'treasure',
    rarity: "G",
    price: { yuan: 250 },
    effects: { cultivation_rate_pct: 0.15 },
    stock: 5,
    refreshRate: 14
  },
  {
    id: 'tribulation_token',
    name: 'Tribulation Token',
    description: 'A rare token earned from high-level trials to ease tribulation difficulty.',
    type: 'treasure',
    rarity: "E",
    price: { yuan: 0 },
    effects: { reduce_tribulation_difficulty: 1 },
    stock: 1,
    refreshRate: 365
  },
  {
    id: 'ascend_essence',
    name: 'Ascend Essence',
    description: 'Essence used as a catalyst when forging bloodline pillars.',
    type: 'material',
    rarity: "F",
    price: { yuan: 0 },
    effects: { used_for: 'pillar_forging' },
    stock: 2,
    refreshRate: 90
  },
  {
    id: 'healer_salve',
    name: "Healer's Salve",
    description: 'A common salve that heals wounds and restores vigor.',
    type: 'pill',
    rarity: "H",
    price: { yuan: 40 },
    effects: { heal: 50 },
    stock: 20,
    refreshRate: 7
  },
  {
    id: 'mirror_shard',
    name: 'Mirror Shard',
    description: 'A shard that confers moments of insight; used in Dao checks.',
    type: 'treasure',
    rarity: "G",
    price: { yuan: 0 },
    effects: { insight_bonus: 3 },
    stock: 6,
    refreshRate: 21
  },
  {
    id: 'battle_technique_scroll',
    name: 'Technique Scroll',
    description: 'Scroll that teaches a single-use martial technique when studied.',
    type: 'manual',
    rarity: "G",
    price: { yuan: 200 },
    effects: { learn_skill: 'shadow_strike' },
    stock: 6,
    refreshRate: 21
  },
  // Ability Manuals
  {
    id: 'swordsmanship_manual',
    name: 'Swordsmanship Manual',
    description: 'A manual detailing the fundamentals of sword techniques.',
    type: 'manual',
    rarity: "H",
    price: { yuan: 300 },
    effects: { unlockAbility: 'swordsmanship' },
    stock: 10,
    refreshRate: 14
  },
  {
    id: 'spear_arts_manual',
    name: 'Spear Arts Manual',
    description: 'A manual teaching the art of spear combat.',
    type: 'manual',
    rarity: "H",
    price: { yuan: 320 },
    effects: { unlockAbility: 'spearArts' },
    stock: 8,
    refreshRate: 14
  },
  {
    id: 'archery_manual',
    name: 'Archery Manual',
    description: 'A guide to mastering the bow and arrow.',
    type: 'manual',
    rarity: "H",
    price: { yuan: 280 },
    effects: { unlockAbility: 'archery' },
    stock: 12,
    refreshRate: 14
  },
  {
    id: 'dagger_arts_manual',
    name: 'Dagger Arts Manual',
    description: 'Techniques for close-quarters dagger combat.',
    type: 'manual',
    rarity: "H",
    price: { yuan: 260 },
    effects: { unlockAbility: 'daggerArts' },
    stock: 14,
    refreshRate: 14
  },
  {
    id: 'staff_arts_manual',
    name: 'Staff Arts Manual',
    description: 'Mastery of staff-based combat and defense.',
    type: 'manual',
    rarity: "H",
    price: { yuan: 290 },
    effects: { unlockAbility: 'staffArts' },
    stock: 11,
    refreshRate: 14
  }
];

// Starter / extra items that can be appended for quick playtesting.
export const EXTRA_MARKET_ITEMS: MarketItem[] = [
  {
    id: 'spirit_stone',
    name: 'Spirit Stone',
    description: 'A raw spirit stone that can be absorbed for cultivation energy.',
    type: 'material',
    rarity: "H",
    price: { yuan: 0 },
    effects: { cultivation_gain: 15 },
    stock: 999,
    refreshRate: 1
  },
  {
    id: 'ancient_manual_basic',
    name: 'Basic Manual',
    description: 'A worn manual teaching a simple technique.',
    type: 'manual',
    rarity: "H",
    price: { yuan: 100 },
    effects: { skill_unlock: 'basic_strike' },
    stock: 10,
    refreshRate: 7
  },
  {
    id: 'ancient_manual_advanced',
    name: 'Advanced Manual',
    description: 'An advanced treatise that grants a permanent combat bonus.',
    type: 'manual',
    rarity: "F",
    price: { yuan: 500 },
    effects: { stat_bonus: { attack: 5 } },
    stock: 3,
    refreshRate: 21
  }
];

export default { MARKET_ITEMS, EXTRA_MARKET_ITEMS };
