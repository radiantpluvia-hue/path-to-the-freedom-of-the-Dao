import { Physique } from '@/types';
import { getRarityMultiplier } from './scalingSystem';
import { migrateTier } from '@/migrations/tierMigration';

// Helper function to generate physique IDs from names
function generatePhysiqueId(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)/g, '');
}

// Base stats for different rarity tiers (canonical letter codes used where possible)
const BASE_STATS = {
  H: { qi: 15, atk: 3, def: 6 },
  G: { qi: 150, atk: 30, def: 60 },
  F: { qi: 2000, atk: 512, def: 916 },
  E: { qi: 20000, atk: 10520, def: 18400 },
  D: { qi: 125000, atk: 20000, def: 30000 },
  mythical: { qi: 300000, atk: 75000, def: 216000 },
  B: { qi: 3000000, atk: 2400000, def: 2760000 },
  // legacy aliases
  common: { qi: 15, atk: 3, def: 6 },
  uncommon: { qi: 150, atk: 30, def: 60 },
  rare: { qi: 2000, atk: 512, def: 916 },
  epic: { qi: 20000, atk: 10520, def: 18400 },
  legendary: { qi: 125000, atk: 20000, def: 30000 },
  transcendent: { qi: 3000000, atk: 2400000, def: 2760000 }
}; // Qi, Attack, Defense are classic xianxia stats

// Base cultivation speed for different rarity tiers (xianxia style)
const BASE_CULTIVATION_SPEED = {
  H: 1.65,
  G: 3,
  F: 16,
  E: 32,
  D: 160,
  mythical: 774,
  B: 2400,
  // legacy aliases
  common: 1.65,
  uncommon: 3,
  rare: 16,
  epic: 32,
  legendary: 160,
  transcendent: 2400
}; // Cultivation speed is a core xianxia stat

// Physique themes and their associated special effects
const PHYSIQUE_THEMES = {
  celestial: ['divine_blessing', 'heavenly_aura', 'celestial_resistance'],
  dragon: ['draconic_resilience', 'dragon_scales', 'fiery_breath'],
  phoenix: ['rebirth_ability', 'fire_immunity', 'immortal_flame'],
  void: ['void_resistance', 'dimensional_adaptation', 'shadow_merge'],
  elemental: ['elemental_resistance', 'nature_harmony', 'elemental_absorption'],
  thunder: ['lightning_resistance', 'thunder_clap', 'storm_endurance'],
  shadow: ['shadow_merging', 'stealth_mastery', 'dark_adaptation'],
  light: ['light_resistance', 'purification_aura', 'holy_protection'],
  beast: ['beast_form', 'animal_instinct', 'predator_senses'],
  time: ['time_resistance', 'temporal_awareness', 'age_defiance'],
  space: ['spatial_resistance', 'dimensional_stability', 'gravity_defiance'],
  reality: ['reality_anchoring', 'conceptual_stability', 'law_resistance'],
  star: ['stellar_energy', 'cosmic_adaptation', 'void_survival'],
  moon: ['lunar_energy', 'dream_resistance', 'moonlight_healing'],
  sun: ['solar_energy', 'heat_resistance', 'sun_empowerment'],
  earth: ['earth_resistance', 'stone_skin', 'mountain_endurance'],
  water: ['water_resistance', 'aquatic_breathing', 'tidal_adaptation'],
  fire: ['fire_resistance', 'heat_absorption', 'flame_body'],
  wind: ['wind_resistance', 'aerial_adaptation', 'gale_movement'],
  ice: ['ice_resistance', 'cold_immunity', 'frost_body'],
  blood: ['blood_regeneration', 'life_absorption', 'berserker_endurance'],
  soul: ['soul_protection', 'mental_resistance', 'spiritual_defense'],
  dream: ['dream_resistance', 'psychic_shield', 'subconscious_defense']
};

// Function to get appropriate special effects based on physique name
function getSpecialEffects(name: string, rarity: string): string[] {
  const nameLower = name.toLowerCase();
  const effects: string[] = [];
  
  // Determine theme based on name keywords
  if (nameLower.includes('celestial') || nameLower.includes('heaven')) {
    effects.push(...PHYSIQUE_THEMES.celestial);
  }
  if (nameLower.includes('dragon')) {
    effects.push(...PHYSIQUE_THEMES.dragon);
  }
  if (nameLower.includes('phoenix')) {
    effects.push(...PHYSIQUE_THEMES.phoenix);
  }
  if (nameLower.includes('void') || nameLower.includes('shadow')) {
    effects.push(...PHYSIQUE_THEMES.void);
  }
  if (nameLower.includes('elemental') || nameLower.includes('nature')) {
    effects.push(...PHYSIQUE_THEMES.elemental);
  }
  if (nameLower.includes('thunder') || nameLower.includes('lightning')) {
    effects.push(...PHYSIQUE_THEMES.thunder);
  }
  if (nameLower.includes('shadow') || nameLower.includes('dark')) {
    effects.push(...PHYSIQUE_THEMES.shadow);
  }
  if (nameLower.includes('light') || nameLower.includes('holy')) {
    effects.push(...PHYSIQUE_THEMES.light);
  }
  if (nameLower.includes('beast') || nameLower.includes('animal')) {
    effects.push(...PHYSIQUE_THEMES.beast);
  }
  if (nameLower.includes('time') || nameLower.includes('temporal')) {
    effects.push(...PHYSIQUE_THEMES.time);
  }
  if (nameLower.includes('space') || nameLower.includes('dimensional')) {
    effects.push(...PHYSIQUE_THEMES.space);
  }
  if (nameLower.includes('reality') || nameLower.includes('concept')) {
    effects.push(...PHYSIQUE_THEMES.reality);
  }
  if (nameLower.includes('star') || nameLower.includes('stellar')) {
    effects.push(...PHYSIQUE_THEMES.star);
  }
  if (nameLower.includes('moon') || nameLower.includes('lunar')) {
    effects.push(...PHYSIQUE_THEMES.moon);
  }
  if (nameLower.includes('sun') || nameLower.includes('solar')) {
    effects.push(...PHYSIQUE_THEMES.sun);
  }
  if (nameLower.includes('earth') || nameLower.includes('stone')) {
    effects.push(...PHYSIQUE_THEMES.earth);
  }
  if (nameLower.includes('water') || nameLower.includes('ocean')) {
    effects.push(...PHYSIQUE_THEMES.water);
  }
  if (nameLower.includes('fire') || nameLower.includes('flame')) {
    effects.push(...PHYSIQUE_THEMES.fire);
  }
  if (nameLower.includes('wind') || nameLower.includes('gale')) {
    effects.push(...PHYSIQUE_THEMES.wind);
  }
  if (nameLower.includes('ice') || nameLower.includes('frost')) {
    effects.push(...PHYSIQUE_THEMES.ice);
  }
  if (nameLower.includes('blood')) {
    effects.push(...PHYSIQUE_THEMES.blood);
  }
  if (nameLower.includes('soul') || nameLower.includes('spirit')) {
    effects.push(...PHYSIQUE_THEMES.soul);
  }
  if (nameLower.includes('dream')) {
    effects.push(...PHYSIQUE_THEMES.dream);
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

// Function to create physique from name
function createPhysique(name: string, index: number, total: number): Physique {
  const rarity = determineRarity(index, total);
  const rarityMultiplier = getRarityMultiplier(rarity);
  // Accept either legacy words (common, rare, epic...) or single-letter tier codes (H,G,F...)
  // Map legacy-word rarities to canonical single-letter tiers where possible
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
  const baseCultivationSpeed = BASE_CULTIVATION_SPEED[rarityKey as keyof typeof BASE_CULTIVATION_SPEED];
  
  // Apply rarity multiplier to stats
  const stats = Object.fromEntries(
    Object.entries(baseStats).map(([key, value]) => [key, Math.round(value * rarityMultiplier)])
  ) as Record<string, number>;
  
  // Apply rarity multiplier to cultivation speed
  const cultivationSpeed = baseCultivationSpeed * rarityMultiplier;
  
  const specialEffects = getSpecialEffects(name, rarity);
  
  return {
    id: generatePhysiqueId(name),
    name: name,
    description: `The D ${name} physique, a xianxia body refinement granting profound power and spiritual might.`,
    rarity: rarity as any,
    rarityCode: migrateTier(rarity),
    effects: {
      stats,
      cultivation_speed: cultivationSpeed,
      special: specialEffects
    }
  };
}

// Physique names from TODO_XIANXIA_NAMING.md
const PHYSIQUE_NAMES = [
  "Heavenly Thunder Body",
  "Everfrost Jade Body",
  "Starlight Meridian Constitution",
  "Voidbone Physique",
  "Phoenix Rebirth Body",
  "Dragon Marrow Tempering",
  "Moonlit Veil Physique",
  "Sunfire Tempered Body",
  "Samsara Cycle Physique",
  "Stoneheart Diamond Body",
  "Gale Step Meridian",
  "Shadow Veil Body",
  "Ocean Tide Constitution",
  "Ironblood War Body",
  "Lotus Bloom Physique",
  "Spiritwood Vessel",
  "Astral Core Body",
  "Tempest-forged Physique",
  "Lightning Conduction Body",
  "Thousand Poisons Purified Body",
  "Crimson Flame Furnace",
  "Silent Mountain Body",
  "Mirage Glass Constitution",
  "Heaven-Warding Shell",
  "Starflow Meridian",
  "Verdant Spring Body",
  "Wintergrave Cold Body",
  "Summer Blaze Body",
  "Autumn Gale Body",
  "Dawnstar Resonance",
  "Nightshade Shadow Body",
  "Azure Tempest Body",
  "Golden Crow Ember Body",
  "Cloud-Reed Breath",
  "Spirit-Sealing Frame",
  "Immortal Crane Featherlight",
  "Titanbone Frame",
  "Iron Will Tempered Body",
  "Bloodmoon Frenzy Body",
  "Luminous Jade Body",
  "Wolf Fang Battle Body",
  "Leviathan Tide Body",
  "Roc Wing Windstep",
  "Earthshaker Tremor Body",
  "Tortoise Shell Bastion",
  "Rebirth Nectar Body",
  "Mantis Edge Physique",
  "Sword-Heart Tempered Body",
  "Furnace of Nine Cycles",
  "Heaven-Defying Pulse",
  "Ethereal Spirit Body",
  "Celestial Flame Body",
  "Shadowed Veil Physique",
  "Mystic Frost Body",
  "Thunderous Roar Body",
  "Eternal Nightshade Body",
  "Celestial Phoenix Body",
  "Divine Dragon Body",
  "Spirit-Wind Sovereign Body",
  "Bloodline of the Ancients Body",
  "Celestial Starfire Body",
  "Voidwalker Body",
  "Celestial Beast Body",
  "Ethereal Shadow Monarch Body",
  "Bloodline of the Titans Body",
  "Celestial Gale Body",
  "Abyssal Serpent Body",
  "Celestial Thunder Body",
  "Bloodline of the Phoenix Body",
  "Celestial Frost Body",
  "Ethereal Flame Monarch Body",
  "Celestial Nightshade Body",
  "Bloodline of the Stars Body",
  "Celestial Earth Body",
  "Ethereal Wind Body",
  "Celestial Water Body",
  "Bloodline of the Primordials Body",
  "Celestial Fire Body",
  "Ethereal Light Body",
  "Celestial Light Body",
  "Bloodline of the Shadows Body",
  "Celestial Darkness Body",
  "Ethereal Ice Body",
  "Celestial Storm Body",
  "Bloodline of the Elements Body",
  "Celestial Void Body",
  "Ethereal Thunder Body",
  "Celestial Lightning Body",
  "Bloodline of the Cosmos Body",
  "Celestial Time Body",
  "Ethereal Space Body",
  "Celestial Reality Body",
  "Bloodline of the Universe Body",
  "Celestial Dream Body",
  "Ethereal Illusion Body",
  "Celestial Memory Body",
  "Bloodline of the Progenitors Body",
  "Celestial Fate Body",
  "Ethereal Harmony Body",
  "Celestial Unity Body"
];

// Add additional generated filler names to ensure we have 100+ physiques
for (let i = 0; PHYSIQUE_NAMES.length < 110; i++) {
  PHYSIQUE_NAMES.push(`Generated Physique ${i + 1}`);
}

// Create all physiques
export const PHYSIQUES: Physique[] = PHYSIQUE_NAMES.map((name, index) => 
  createPhysique(name, index, PHYSIQUE_NAMES.length)
);

// Keep original main character physiques and add them to the beginning
const ORIGINAL_MAIN_CHARACTER_PHYSIQUES: Physique[] = [
  {
    id: 'su_ming_physique',
    name: 'Su Ming Physique',
    description: 'The legendary physique of Su Ming, capable of unparalleled cultivation speed.',
    rarity: "D",
    effects: {
      stats: { qi: 200, atk: 50, def: 50 },
      cultivation_speed: 3.0,
      special: ['dao_comprehension', 'immortality']
    }
  },
  {
    id: 'meng_hao_physique',
    name: 'Meng Hao Physique',
    description: 'The physique of Meng Hao, known for strategic thinking and cultivation mastery.',
    rarity: "D",
    effects: {
      stats: { qi: 180, atk: 45, def: 45 },
      cultivation_speed: 2.8,
      special: ['strategic_mastery', 'spiritual_connection']
    }
  },
  {
    id: 'han_li_physique',
    name: 'Han Li Physique',
    description: 'The physique of Han Li, enhanced for alchemical pursuits and cultivation.',
    rarity: "D",
    effects: {
      stats: { qi: 190, atk: 40, def: 40 },
      cultivation_speed: 2.7,
      special: ['alchemy_mastery', 'immortal_recovery']
    }
  },
  {
    id: 'han_jue_physique',
    name: 'Han Jue Physique',
    description: 'The physique of Han Jue, attuned to the Dao and fate manipulation.',
    rarity: "D",
    effects: {
      stats: { qi: 210, atk: 55, def: 55 },
      cultivation_speed: 3.2,
      special: ['dao_mastery', 'fate_manipulation']
    }
  },
  {
    id: 'ji_ning_physique',
    name: 'Ji Ning Physique',
    description: 'The physique of Ji Ning, perfected for sword mastery and spatial techniques.',
    rarity: "D",
    effects: {
      stats: { qi: 220, atk: 60, def: 60 },
      cultivation_speed: 3.1,
      special: ['sword_mastery', 'spatial_techniques']
    }
  },
  {
    id: 'linley_physique',
    name: 'Linley Physique',
    description: 'The physique of Linley, embodying noble spirit and defensive mastery.',
    rarity: "D",
    effects: {
      stats: { qi: 200, atk: 50, def: 50 },
      cultivation_speed: 2.9,
      special: ['noble_spirit', 'defensive_mastery']
    }
  },
  {
    id: 'bai_xiaochun_physique',
    name: 'Bai Xiaochun Physique',
    description: 'The physique of Bai Xiaochun, enhanced for charm and spiritual connection.',
    rarity: "D",
    effects: {
      stats: { qi: 190, atk: 45, def: 45 },
      cultivation_speed: 2.6,
      special: ['charm', 'spiritual_connection']
    }
  },
  {
    id: 'xue_ying_physique',
    name: 'Xue Ying Physique',
    description: 'The physique of Xue Ying, attuned to ice mastery and frost techniques.',
    rarity: "D",
    effects: {
      stats: { qi: 200, atk: 50, def: 50 },
      cultivation_speed: 2.8,
      special: ['ice_mastery', 'frost_techniques']
    }
  },
  {
    id: 'wang_lin_physique',
    name: 'Wang Lin Physique',
    description: 'The physique of Wang Lin, known for resilience and spiritual strength.',
    rarity: "D",
    effects: {
      stats: { qi: 210, atk: 55, def: 55 },
      cultivation_speed: 3.0,
      special: ['resilience', 'spiritual_strength']
    }
  }
];

// Combine original main characters with new physiques
export const ALL_PHYSIQUES: Physique[] = [
  ...ORIGINAL_MAIN_CHARACTER_PHYSIQUES,
  ...PHYSIQUES
];

// Export for use in character creation and other systems
export { getRealmMultiplier, scalePhysiqueStats, scaleCultivationSpeed } from './scalingSystem';
