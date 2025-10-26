import { Bloodline } from '@/types';
import { getRarityMultiplier } from './scalingSystem';

// Helper function to generate bloodline IDs from names
function generateBloodlineId(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)/g, '');
}

// Base stats for different rarity tiers
// Provide canonical single-letter tier keys (H,G,F,E,D,B) while keeping legacy-word aliases
const BASE_STATS = {
  H: { qi: 50, atk: 10, def: 10 },
  G: { qi: 75, atk: 15, def: 15 },
  F: { qi: 100, atk: 20, def: 20 },
  E: { qi: 150, atk: 30, def: 30 },
  D: { qi: 200, atk: 40, def: 40 },
  mythical: { qi: 300, atk: 60, def: 60 },
  B: { qi: 500, atk: 100, def: 100 },
  // legacy-word aliases (kept for backwards-compatibility)
  common: { qi: 50, atk: 10, def: 10 },
  uncommon: { qi: 75, atk: 15, def: 15 },
  rare: { qi: 100, atk: 20, def: 20 },
  epic: { qi: 150, atk: 30, def: 30 },
  legendary: { qi: 200, atk: 40, def: 40 },
  transcendent: { qi: 500, atk: 100, def: 100 }
};

// Base skill bonuses for different rarity tiers (xianxia style)
const BASE_SKILLS = {
  H: { martialMastery: 1, qiControl: 1 },
  G: { martialMastery: 2, qiControl: 2 },
  F: { martialMastery: 3, qiControl: 3 },
  E: { martialMastery: 4, qiControl: 4 },
  D: { martialMastery: 5, qiControl: 5 },
  mythical: { martialMastery: 7, qiControl: 7 },
  B: { martialMastery: 10, qiControl: 10 },
  // legacy-word aliases (kept for backwards-compatibility)
  common: { martialMastery: 1, qiControl: 1 },
  uncommon: { martialMastery: 2, qiControl: 2 },
  rare: { martialMastery: 3, qiControl: 3 },
  epic: { martialMastery: 4, qiControl: 4 },
  legendary: { martialMastery: 5, qiControl: 5 },
  transcendent: { martialMastery: 10, qiControl: 10 }
};

// Bloodline themes and their associated special effects
const BLOODLINE_THEMES = {
  celestial: ['celestial_blessing', 'divine_protection', 'heavenly_aura'],
  dragon: ['draconic_power', 'dragon_breath', 'scale_armor'],
  phoenix: ['rebirth', 'fire_mastery', 'immortal_flame'],
  void: ['dimensional_travel', 'void_immunity', 'shadow_walk'],
  elemental: ['elemental_mastery', 'nature_communion', 'elemental_fusion'],
  thunder: ['lightning_mastery', 'thunder_strike', 'storm_call'],
  shadow: ['shadow_manipulation', 'stealth_enhancement', 'dark_energy'],
  light: ['light_mastery', 'purification', 'holy_aura'],
  beast: ['beast_transformation', 'animal_kinship', 'predator_instinct'],
  time: ['time_manipulation', 'precognition', 'temporal_shield'],
  space: ['spatial_manipulation', 'teleportation', 'dimensional_awareness'],
  reality: ['reality_manipulation', 'concept_mastery', 'law_comprehension'],
  star: ['stellar_energy', 'cosmic_awareness', 'night_cultivation'],
  moon: ['lunar_energy', 'dream_walking', 'moonlight_step'],
  sun: ['solar_energy', 'light_affinity', 'sun_empowerment'],
  earth: ['earth_mastery', 'stone_skin', 'tremor_sense'],
  water: ['water_mastery', 'aquatic_adaptation', 'tidal_control'],
  fire: ['fire_mastery', 'heat_resistance', 'flame_control'],
  wind: ['wind_mastery', 'aerial_agility', 'gale_step'],
  ice: ['ice_mastery', 'cold_immunity', 'frost_breath'],
  blood: ['blood_magic', 'life_drain', 'berserker_rage'],
  soul: ['soul_manipulation', 'spirit_sight', 'mental_defense'],
  dream: ['dream_manipulation', 'psychic_projection', 'subconscious_access']
};

export const BLOODLINE_BASE_EFFECTS = {
  H: { maxHp: 20, hpRegen: 0 },
  G: { maxHp: 120, hpRegen: 1 },
  F: { maxHp: 600, hpRegen: 2 },
  E: { maxHp: 2400, hpRegen: 6 },
  D: { maxHp: 10000, hpRegen: 20 },
  mythical: { maxHp: 50000, hpRegen: 100 },
  B: { maxHp: 200000, hpRegen: 600 },
  // legacy aliases
  common: { maxHp: 20, hpRegen: 0 },
  uncommon: { maxHp: 120, hpRegen: 1 },
  rare: { maxHp: 600, hpRegen: 2 },
  epic: { maxHp: 2400, hpRegen: 6 },
  legendary: { maxHp: 10000, hpRegen: 20 },
  transcendent: { maxHp: 200000, hpRegen: 600 }
};

function getSpecialEffects(name: string, rarity: string): string[] {
  const nameLower = name.toLowerCase();
  const effects: string[] = [];

  if (nameLower.includes('dragon')) {
    effects.push(...BLOODLINE_THEMES.dragon);
  }
  if (nameLower.includes('phoenix')) {
    effects.push(...BLOODLINE_THEMES.phoenix);
  }
  if (nameLower.includes('void') || nameLower.includes('shadow')) {
    effects.push(...BLOODLINE_THEMES.void);
  }
  if (nameLower.includes('elemental') || nameLower.includes('nature')) {
    effects.push(...BLOODLINE_THEMES.elemental);
  }
  if (nameLower.includes('thunder') || nameLower.includes('lightning')) {
    effects.push(...BLOODLINE_THEMES.thunder);
  }
  if (nameLower.includes('shadow') || nameLower.includes('dark')) {
    effects.push(...BLOODLINE_THEMES.shadow);
  }
  if (nameLower.includes('light') || nameLower.includes('holy')) {
    effects.push(...BLOODLINE_THEMES.light);
  }
  if (nameLower.includes('beast') || nameLower.includes('animal')) {
    effects.push(...BLOODLINE_THEMES.beast);
  }
  if (nameLower.includes('time') || nameLower.includes('temporal')) {
    effects.push(...BLOODLINE_THEMES.time);
  }
  if (nameLower.includes('space') || nameLower.includes('dimensional')) {
    effects.push(...BLOODLINE_THEMES.space);
  }
  if (nameLower.includes('reality') || nameLower.includes('concept')) {
    effects.push(...BLOODLINE_THEMES.reality);
  }
  if (nameLower.includes('star') || nameLower.includes('stellar')) {
    effects.push(...BLOODLINE_THEMES.star);
  }
  if (nameLower.includes('moon') || nameLower.includes('lunar')) {
    effects.push(...BLOODLINE_THEMES.moon);
  }
  if (nameLower.includes('sun') || nameLower.includes('solar')) {
    effects.push(...BLOODLINE_THEMES.sun);
  }
  if (nameLower.includes('earth') || nameLower.includes('stone')) {
    effects.push(...BLOODLINE_THEMES.earth);
  }
  if (nameLower.includes('water') || nameLower.includes('ocean')) {
    effects.push(...BLOODLINE_THEMES.water);
  }
  if (nameLower.includes('fire') || nameLower.includes('flame')) {
    effects.push(...BLOODLINE_THEMES.fire);
  }
  if (nameLower.includes('wind') || nameLower.includes('gale')) {
    effects.push(...BLOODLINE_THEMES.wind);
  }
  if (nameLower.includes('ice') || nameLower.includes('frost')) {
    effects.push(...BLOODLINE_THEMES.ice);
  }
  if (nameLower.includes('blood')) {
    effects.push(...BLOODLINE_THEMES.blood);
  }
  if (nameLower.includes('soul') || nameLower.includes('spirit')) {
    effects.push(...BLOODLINE_THEMES.soul);
  }
  if (nameLower.includes('dream')) {
    effects.push(...BLOODLINE_THEMES.dream);
  }

  // Limit effects based on rarity
  const maxEffects = {
    H: 1,
    G: 1,
    F: 2,
    E: 2,
    D: 3,
    mythical: 4,
    B: 5,
    // legacy aliases
    common: 1,
    uncommon: 1,
    rare: 2,
    epic: 2,
    legendary: 3,
    transcendent: 5
  };

  return effects.slice(0, maxEffects[rarity as keyof typeof maxEffects] || 1);
}

// Function to determine rarity based on name and index
function determineRarity(index: number, total: number): string {
  const percent = (index / total) * 100;
  if (percent < 40) return "H";
  if (percent < 60) return "G";
  if (percent < 75) return "F";
  if (percent < 85) return "E";
  if (percent < 92) return "D";
  if (percent < 97) return 'mythical';
  return "B";
}

// Function to create bloodline from name
function createBloodline(name: string, index: number, total: number): Bloodline {
  const rarity = determineRarity(index, total);
  const rarityMultiplier = getRarityMultiplier(rarity);
  // Accept either legacy words (common, rare, epic...) or single-letter tier codes (H,G,F...)
  const LEGACY_TO_LETTER: Record<string, keyof typeof BASE_STATS> = {
    common: 'H',
    uncommon: 'G',
    rare: 'F',
    epic: 'E',
    legendary: 'D',
    transcendent: 'B',
    mythical: 'mythical'
  };

  const rarityKey = (BASE_STATS as any)[rarity]
    ? (rarity as keyof typeof BASE_STATS)
    : (LEGACY_TO_LETTER[(rarity || '').toString().toLowerCase()] || (rarity as keyof typeof BASE_STATS));

  const baseStats = BASE_STATS[rarityKey as keyof typeof BASE_STATS];
  const baseSkills = BASE_SKILLS[rarityKey as keyof typeof BASE_SKILLS];
  
  // Apply rarity multiplier to stats
  const stats = Object.fromEntries(
    Object.entries(baseStats).map(([key, value]) => [key, Math.round(value * rarityMultiplier)])
  ) as Record<string, number>;
  
  // Apply rarity multiplier to skills
  const skills = Object.fromEntries(
    Object.entries(baseSkills).map(([key, value]) => [key, Math.round(value * rarityMultiplier)])
  ) as Record<string, number>;
  
  const specialEffects = getSpecialEffects(name, rarity);
  
  return {
    id: generateBloodlineId(name),
    name: name,
    description: `The ancient ${name} bloodline, a xianxia lineage carrying profound ancestral powers and forbidden arts.`,
    rarity: rarity as any,
    effects: {
      stats,
      skills,
      special: specialEffects
    },
    awakening_requirements: {
      realm: rarity === "B" ? 'chaos_saint' : 
             rarity === 'mythical' ? 'core_formation' :
             rarity === "D" ? 'soul_transformation' :
             rarity === "E" ? 'golden_immortal' : 'foundation_establishment',
      qi: 1000 * (rarity === "B" ? 100 : 
                  rarity === 'mythical' ? 50 :
                  rarity === "D" ? 25 :
                  rarity === "E" ? 10 :
                  rarity === "F" ? 5 : 1)
    }
  };
}

// Bloodline names from TODO_XIANXIA_NAMING.md (removed duplicates)
const BLOODLINE_NAMES = [
  "Celestial Dragon Marrow",
  "Void-Treading Shadow Vein",
  "Ninefold Thunderheart",
  "Starlight Monarch Lineage",
  "Primordial Phoenix Vein",
  "Abyssal Nightflame",
  "Heaven-Destiny Severer",
  "Crimson Lotus Emperor",
  "Frostjade Serpent Lineage",
  "Mountain-Sunder Titan",
  "Sun-Devourer Lineage",
  "Moonlit Mirage Vein",
  "River of Samsara Lineage",
  "Verdant Wood Sovereign",
  "Sky-Forger Colossus",
  "Iron-Will Tyrant",
  "Spirit-Sealing Warden",
  "Whispering Windstep",
  "Oceanheart Leviathan",
  "Ashen Bone Revenant",
  "Golden Crow Ember Lineage",
  "Immortal Crane Plume",
  "Azure Tempest King",
  "Stoneheart Sentinel",
  "Starforged Astral Vein",
  "Eclipse Wolf Blood",
  "Scarlet Thorn Empress",
  "Heavenly Lightning Tyrant",
  "Void Lantern Lineage",
  "Wintergrave Monarch",
  "Duskblade Wyrm",
  "Spring Dew Saint Lineage",
  "Autumn Gale Regent",
  "Summer Blaze Lord",
  "Dawnstar Oracle",
  "Nether River Ferryman",
  "Mirage Glass Unicorn",
  "Earthshaker Giant Vein",
  "Skywhale Navigator",
  "Spiritvine Keeper",
  "Celestial Tortoise Shell",
  "Bloodmoon Predator",
  "Luminous Jade Sage",
  "Shadowleaf Stalker",
  "Thunderstep Roc",
  "Frost-Iron Rhino",
  "Lotus of Rebirth Vein",
  "Tempest Whale Lineage",
  "Star-Eater Mantis",
  "Heaven-Warding Bastion",
  "Ethereal Flame Bloodline",
  "Shadowed Moon Vein",
  "Celestial Serpent Lineage",
  "Abyssal Gale Monarch",
  "Radiant Sunfire Lineage",
  "Mystic Frost Vein",
  "Thunderous Roar Bloodline",
  "Eternal Nightshade Lineage",
  "Celestial Phoenix Vein",
  "Divine Dragon Marrow",
  "Spirit-Wind Sovereign",
  "Celestial Starfire Lineage",
  "Voidwalker Bloodline",
  "Celestial Beast Vein",
  "Ethereal Shadow Monarch",
  "Bloodline of the Titans",
  "Celestial Gale Vein",
  "Abyssal Serpent Lineage",
  "Celestial Thunder Vein",
  "Bloodline of the Phoenix",
  "Celestial Frost Vein",
  "Ethereal Flame Monarch",
  "Celestial Nightshade Lineage",
  "Bloodline of the Stars",
  "Celestial Earth Vein",
  "Ethereal Spirit Vein",
  "Celestial Water Vein",
  "Celestial Fire Vein",
  "Ethereal Wind Vein",
  "Celestial Light Vein",
  "Bloodline of the Shadows",
  "Celestial Darkness Vein",
  "Ethereal Ice Vein",
  "Celestial Storm Vein",
  "Bloodline of the Elements",
  "Celestial Void Vein",
  "Ethereal Thunder Vein",
  "Celestial Lightning Vein",
  "Bloodline of the Cosmos",
  "Celestial Time Vein",
  "Ethereal Space Vein",
  "Celestial Reality Vein",
  "Bloodline of the Universe",
  "Celestial Dream Vein",
  "Ethereal Illusion Vein",
  "Celestial Memory Vein",
  "Celestial Fate Vein"
];

// Create all bloodlines
export const GENERATED_BLOODLINES: Bloodline[] = BLOODLINE_NAMES.map((name, index) => 
  createBloodline(name, index, BLOODLINE_NAMES.length)
);

// Keep original main character bloodlines and add them to the beginning
const ORIGINAL_MAIN_CHARACTER_BLOODLINES: Bloodline[] = [
  {
    id: 'fate_destroyer',
    name: 'Fate Destroyer Bloodline',
    description: 'Bloodline blessed by the Fate Destroying Emperor, capable of severing destiny itself.',
    rarity: "D",
    effects: {
      stats: { qi: 200, atk: 50, def: 50 },
      skills: { combatSkills: 5, qiControl: 5 },
      special: ['fate_manipulation', 'destiny_severing']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'heaven_sealer',
    name: 'Heaven Sealer Bloodline',
    description: 'Bloodline of Meng Hao, master of sealing arts and heavenly defiance.',
    rarity: "D",
    effects: {
      stats: { qi: 180, atk: 45, def: 45 },
      skills: { daoInsight: 5, mentalFortitude: 5 },
      special: ['sealing_arts', 'heavenly_defiance']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'eternal_alchemist',
    name: 'Eternal Alchemist Bloodline',
    description: 'Bloodline of Bai Xiaochun, master of immortality and pill refinement.',
    rarity: "D",
    effects: {
      stats: { qi: 190, atk: 40, def: 40 },
      skills: { alchemy: 5, combatSkills: 4 },
      special: ['immortality_arts', 'pill_mastery']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'dao_comprehender',
    name: 'Dao Comprehender Bloodline',
    description: 'Bloodline of Han Jue, with unparalleled understanding of the Dao and fate.',
    rarity: "D",
    effects: {
      stats: { qi: 210, atk: 55, def: 55 },
      skills: { daoInsight: 6, qiControl: 6 },
      special: ['dao_mastery', 'fate_comprehension']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'sword_sovereign',
    name: 'Sword Sovereign Bloodline',
    description: 'Bloodline of Ji Ning, ultimate master of the sword and spatial techniques.',
    rarity: "D",
    effects: {
      stats: { qi: 220, atk: 60, def: 60 },
      skills: { combatSkills: 6, daoInsight: 5 },
      special: ['sword_domain', 'spatial_mastery']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'dragon_emperor',
    name: 'Dragon Emperor Bloodline',
    description: 'Bloodline of Linley, with draconic heritage and noble warrior spirit.',
    rarity: "D",
    effects: {
      stats: { qi: 200, atk: 50, def: 50 },
      skills: { combatSkills: 5, mentalFortitude: 4 },
      special: ['draconic_power', 'noble_heritage']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'renegade_immortal',
    name: 'Renegade Immortal Bloodline',
    description: 'Bloodline of Wang Lin, known for incredible resilience and killing intent.',
    rarity: "D",
    effects: {
      stats: { qi: 210, atk: 55, def: 55 },
      skills: { combatSkills: 6, mentalFortitude: 5 },
      special: ['killing_intent', 'immortal_resilience']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'frost_monarch',
    name: 'Frost Monarch Bloodline',
    description: 'Bloodline of Xue Ying, absolute master of ice and frost elements.',
    rarity: "D",
    effects: {
      stats: { qi: 200, atk: 50, def: 50 },
      skills: { elementalMastery: 5, combatSkills: 4 },
      special: ['absolute_zero', 'frost_domain']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  },
  {
    id: 'chaos_origin',
    name: 'Chaos Origin Bloodline',
    description: 'Bloodline originating from primordial chaos, with reality-bending powers.',
    rarity: "D",
    effects: {
      stats: { qi: 230, atk: 60, def: 60 },
      skills: { daoInsight: 7, qiControl: 6 },
      special: ['chaos_energy', 'reality_manipulation']
    },
    awakening_requirements: {
      realm: 'soul_transformation',
      qi: 25000
    }
  }
];

// Combine original main characters with new bloodlines
export const ALL_BLOODLINES: Bloodline[] = [
  ...ORIGINAL_MAIN_CHARACTER_BLOODLINES,
  ...GENERATED_BLOODLINES
];

// Export for use in character creation and other systems
export { getRealmMultiplier, scaleBloodlineStats } from './scalingSystem';
