import { Bloodline } from '@/types';
import { getRarityMultiplier, scaleBloodlineStats } from './scalingSystem';
import { migrateTier } from '@/migrations/tierMigration';

// Helper function to generate bloodline IDs from names
function generateBloodlineId(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)/g, '');
}

// Base stats for different rarity tiers (canonical letter codes used where possible)
const BASE_STATS = {
  H: { qi: 60, atk: 12, def: 18 },
  G: { qi: 90, atk: 18, def: 27 },
  F: { qi: 160, atk: 32, def: 48 },
  E: { qi: 240, atk: 48, def: 72 },
  D: { qi: 400, atk: 80, def: 120 },
  mythical: { qi: 720, atk: 144, def: 216 },
  B: { qi: 1200, atk: 240, def: 360 },
  // keep legacy-words as aliases
  common: { qi: 60, atk: 12, def: 18 },
  uncommon: { qi: 90, atk: 18, def: 27 },
  rare: { qi: 160, atk: 32, def: 48 },
  epic: { qi: 240, atk: 48, def: 72 },
  legendary: { qi: 400, atk: 80, def: 120 },
  transcendent: { qi: 1200, atk: 240, def: 360 }
};

// Base skill bonuses for different rarity tiers
const BASE_SKILLS = {
  H: { combatSkills: 2, qiControl: 2 },
  G: { combatSkills: 3, qiControl: 3 },
  F: { combatSkills: 6, qiControl: 6 },
  E: { combatSkills: 8, qiControl: 8 },
  D: { combatSkills: 13, qiControl: 13 },
  mythical: { combatSkills: 21, qiControl: 21 },
  B: { combatSkills: 30, qiControl: 30 },
  // legacy-word aliases
  common: { combatSkills: 2, qiControl: 2 },
  uncommon: { combatSkills: 3, qiControl: 3 },
  rare: { combatSkills: 6, qiControl: 6 },
  epic: { combatSkills: 8, qiControl: 8 },
  legendary: { combatSkills: 13, qiControl: 13 },
  transcendent: { combatSkills: 30, qiControl: 30 }
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

// Function to get appropriate special effects based on bloodline name
function getSpecialEffects(name: string, rarity: string): string[] {
  const nameLower = name.toLowerCase();
  const effects: string[] = [];
  
  // Determine theme based on name keywords
  if (nameLower.includes('celestial') || nameLower.includes('heaven')) {
    effects.push(...BLOODLINE_THEMES.celestial);
  }
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
  // Map single-letter codes (H/G/F/E/D/B) or legacy words to BASE_* keys
  // Prefer canonical single-letter tier codes when possible. Keep legacy-word aliases for compatibility.
  const LEGACY_TO_LETTER: Record<string, keyof typeof BASE_STATS> = {
    common: 'H',
    uncommon: 'G',
    rare: 'F',
    epic: 'E',
    legendary: 'D',
    transcendent: 'B',
    mythical: 'mythical'
  };

  const mappedRarity = ((BASE_STATS as any)[rarity]
    ? (rarity as keyof typeof BASE_STATS)
    : (LEGACY_TO_LETTER[(rarity || '').toString().toLowerCase()] || (rarity as keyof typeof BASE_STATS))) as keyof typeof BASE_STATS;
  const baseStats = BASE_STATS[mappedRarity];
  const baseSkills = BASE_SKILLS[mappedRarity];
  
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
    description: `The ancient ${name} bloodline, carrying powerful ancestral powers and unique abilities.`,
    rarity: rarity as any,
    rarityCode: migrateTier(rarity),
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

// Bloodline names from TODO_XIANXIA_NAMING.md
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
  "Bloodline of the Ancients",
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
  "Bloodline of the Ancients",
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
  "Bloodline of the Ancients",
  "Celestial Fate Vein",
  // Additional Bloodlines for Enhanced Variety
  "Primordial Chaos Vein",
  "Eternal Void Sovereign",
  "Heavenly Tribulation Lineage",
  "Immortal Sword Heart",
  "Divine Beast Emperor",
  "Stellar Constellation Vein",
  "Abyssal Demon Lord",
  "Sacred Tree Ancestor",
  "Infinite Ocean Depths",
  "Molten Core Titan",
  "Windstorm Sovereign",
  "Crystalline Mountain King",
  "Shadowmoon Assassin",
  "Radiant Sun Emperor",
  "Frostbite Eternal",
  "Thundercloud Overlord",
  "Earthshaker Colossus",
  "Spiritflame Phoenix",
  "Voidwalker Phantom",
  "Celestial Judge Lineage",
  "Bloodthirsty Berserker",
  "Mystic Scholar Sage",
  "Battle God Incarnate",
  "Harmony Keeper Vein",
  "Destruction Bringer",
  "Creation Genesis",
  "Time Weaver Lineage",
  "Space Ripper Vein",
  "Reality Shaper",
  "Dream Walker Phantom",
  "Nightmare Sovereign",
  "Memory Keeper Ancient",
  "Soul Reaper Lineage",
  "Life Giver Vein",
  "Death Bringer Shadow",
  "Rebirth Cycle Phoenix",
  "Karma Weaver Sage",
  "Destiny Changer",
  "Fate Defier Rebel",
  "Heaven Piercer Spear",
  "Earth Splitter Axe",
  "Ocean Divider Sword",
  "Mountain Mover Fist",
  "Sky Breaker Thunder",
  "Star Crusher Might",
  "Galaxy Destroyer",
  "Universe Creator",
  "Multiverse Ruler",
  "Omniverse Emperor"
];

// Create all bloodlines
export const BLOODLINES: Bloodline[] = BLOODLINE_NAMES.map((name, index) => 
  createBloodline(name, index, BLOODLINE_NAMES.length)
);

// Helpers: realm-scaled accessors for bloodlines
export function getBloodlineById(id: string): Bloodline | undefined {
  return BLOODLINES.find(b => b.id === id);
}

export function getScaledBloodlineEffects(b: Bloodline, realm: string): Bloodline['effects'] {
  const scaledStats = b.effects.stats ? scaleBloodlineStats(b.effects.stats as Record<string, number>, realm) : undefined;
  return {
    ...b.effects,
    stats: scaledStats,
  };
}

export function getBloodlineByIdScaled(id: string, realm: string): Bloodline | undefined {
  const b = getBloodlineById(id);
  if (!b) return undefined;
  return {
    ...b,
    effects: getScaledBloodlineEffects(b, realm)
  };
}

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
    }
  }
];

// Combine original main characters with new bloodlines
export const ALL_BLOODLINES: Bloodline[] = [
  ...ORIGINAL_MAIN_CHARACTER_BLOODLINES,
  ...BLOODLINES
];

// Export for use in character creation and other systems
export { getRealmMultiplier, scaleBloodlineStats } from './scalingSystem';
