import { Manual, Rarity } from '@/types';
import { getRarityMultiplier, scaleManualEffects } from './scalingSystem';
import { migrateTier } from '@/migrations/tierMigration';

// Helper function to generate manual IDs from names
function generateManualId(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)/g, '');
}

// Base effects for different rarity tiers (xianxia style)
// Provide canonical single-letter tier keys and keep legacy-word aliases
const BASE_EFFECTS = {
  H: { cultivationSpeed: 1.8, qiGathering: 60, bodyRefinement: 3, hp: 45, soulWill: 3, daoHeart: 30, martialMastery: 3, atk: 15 },
  G: { cultivationSpeed: 2.25, qiGathering: 90, bodyRefinement: 6, hp: 75, soulWill: 6, daoHeart: 45, martialMastery: 6, atk: 30 },
  F: { cultivationSpeed: 3.6, qiGathering: 200, bodyRefinement: 12, hp: 140, soulWill: 12, daoHeart: 80, martialMastery: 12, atk: 60 },
  E: { cultivationSpeed: 4.4, qiGathering: 280, bodyRefinement: 16, hp: 200, soulWill: 16, daoHeart: 100, martialMastery: 16, atk: 80 },
  D: { cultivationSpeed: 6.25, qiGathering: 500, bodyRefinement: 25, hp: 375, soulWill: 25, daoHeart: 150, martialMastery: 25, atk: 125 },
  mythical: { cultivationSpeed: 9, qiGathering: 900, bodyRefinement: 36, hp: 600, soulWill: 36, daoHeart: 210, martialMastery: 36, atk: 180 },
  B: { cultivationSpeed: 10.5, qiGathering: 1200, bodyRefinement: 42, hp: 900, soulWill: 42, daoHeart: 240, martialMastery: 42, atk: 210 },
  // legacy-word aliases
  transcendent: { cultivationSpeed: 10.5, qiGathering: 1200, bodyRefinement: 42, hp: 900, soulWill: 42, daoHeart: 240, martialMastery: 42, atk: 210 }
};

// Manual themes and their associated special effects (xianxia style)
const MANUAL_THEMES = {
  qi: ['qi_control', 'qi_gathering', 'qi_sense'],
  body: ['body_refinement', 'titan_strength', 'endless_endurance'],
  combat: ['martial_mastery', 'battle_sense', 'tactical_insight'],
  meditation: ['soul_will', 'dao_heart', 'spiritual_connection'],
  elemental: ['elemental_mastery', 'nature_harmony', 'elemental_affinity'],
  alchemy: ['alchemy_mastery', 'pill_refining', 'herbal_knowledge'],
  spirit: ['spirit_taming', 'spiritual_connection', 'soul_strengthening'],
  time: ['time_control', 'temporal_insight', 'accelerated_learning'],
  space: ['dimensional_travel', 'spatial_awareness', 'gravity_control'],
  reality: ['reality_manipulation', 'concept_mastery', 'law_understanding'],
  celestial: ['celestial_blessing', 'divine_protection', 'heavenly_aura'],
  shadow: ['shadow_manipulation', 'stealth_enhancement', 'dark_energy'],
  light: ['light_mastery', 'purification', 'holy_aura'],
  fire: ['fire_mastery', 'heat_resistance', 'flame_control'],
  water: ['water_mastery', 'aquatic_adaptation', 'tidal_control'],
  wind: ['wind_mastery', 'aerial_agility', 'gale_step'],
  ice: ['ice_mastery', 'cold_immunity', 'frost_breath'],
  thunder: ['thunder_mastery', 'lightning_strike', 'storm_call'],
  blood: ['blood_magic', 'life_drain', 'berserker_rage'],
  dream: ['dream_manipulation', 'psychic_projection', 'subconscious_access']
};

const MAX_EFFECTS_BY_RARITY: Partial<Record<Rarity, number>> = {
  H: 1,
  G: 1,
  F: 2,
  E: 2,
  D: 3,
  mythical: 4,
  B: 5
};

// Add word-form aliases so code that indexes by 'common'/'uncommon' etc. will find values
/* istanbul ignore next - runtime aliases for legacy word-form rarities */
(MAX_EFFECTS_BY_RARITY as any)['common'] = MAX_EFFECTS_BY_RARITY.H;
(MAX_EFFECTS_BY_RARITY as any)['uncommon'] = MAX_EFFECTS_BY_RARITY.G;
(MAX_EFFECTS_BY_RARITY as any)['rare'] = MAX_EFFECTS_BY_RARITY.F;
(MAX_EFFECTS_BY_RARITY as any)['epic'] = MAX_EFFECTS_BY_RARITY.E;
(MAX_EFFECTS_BY_RARITY as any)['legendary'] = MAX_EFFECTS_BY_RARITY.D;
(MAX_EFFECTS_BY_RARITY as any)['transcendent'] = MAX_EFFECTS_BY_RARITY.B;

// Function to get appropriate special effects based on manual name
function getSpecialEffects(name: string, rarity: Rarity): string[] {
  const nameLower = name.toLowerCase();
  const effects: string[] = [];

  // Determine theme based on name keywords
  for (const theme in MANUAL_THEMES) {
    if (nameLower.includes(theme)) {
      effects.push(...MANUAL_THEMES[theme as keyof typeof MANUAL_THEMES]);
    }
  }

  // Limit effects based on rarity (use a safe default if rarity key missing)
  const max = (MAX_EFFECTS_BY_RARITY as Partial<Record<string, number>>)[String(rarity)] ?? 0;
  return effects.slice(0, max);
}

const RARITY_THRESHOLDS: { rarity: Rarity, threshold: number }[] = [
  { rarity: "H", threshold: 40 },
  { rarity: "G", threshold: 60 },
  { rarity: "F", threshold: 75 },
  { rarity: "E", threshold: 85 },
  { rarity: "D", threshold: 92 },
  { rarity: 'mythical', threshold: 97 }
];

// Function to determine rarity based on index
function determineRarity(index: number, total: number): Rarity {
  const percent = (index / total) * 100;
  for (const { rarity, threshold } of RARITY_THRESHOLDS) {
    if (percent < threshold) {
      return rarity;
    }
  }
  return "B";
}

// Function to create manual from name
function createManual(name: string, index: number, total: number): Manual {
  const rarity = determineRarity(index, total);
  const rarityMultiplier = getRarityMultiplier(rarity);
  const LEGACY_TO_LETTER: Record<string, keyof typeof BASE_EFFECTS> = {
    common: 'H',
    uncommon: 'G',
    rare: 'F',
    epic: 'E',
    legendary: 'D',
    transcendent: 'B',
    mythical: 'mythical'
  };

  const effectsKey = (BASE_EFFECTS as any)[rarity]
    ? (rarity as keyof typeof BASE_EFFECTS)
    : (LEGACY_TO_LETTER[(rarity || '').toString().toLowerCase()] || (rarity as keyof typeof BASE_EFFECTS));

  const baseEffects = BASE_EFFECTS[effectsKey as keyof typeof BASE_EFFECTS];
  
  // Apply rarity multiplier to effects
  const effects = Object.fromEntries(
    Object.entries(baseEffects).map(([key, value]) => [key, Math.round(value * rarityMultiplier)])
  );
  
  const specialEffects = getSpecialEffects(name, rarity);
  
  return {
    id: generateManualId(name),
    name: name,
  description: `The ${name}, an ancient xianxia manual containing profound arts and forbidden secrets.`,
    rank: rarity,
    rarityCode: migrateTier(rarity),
    effects: {
      ...effects,
      special: specialEffects
    }
  };
}

// Manual names from TODO_XIANXIA_NAMING.md
const MANUAL_NAMES = [
  "Celestial Qi Gathering Manual",
  "Dragon Breathing Technique",
  "Phoenix Rebirth Art",
  "Void Walking Manual",
  "Time Dilation Technique",
  "Chaos Cultivation Manual",
  "Soul Refinement Art",
  "Eternal Ascension Manual",
  "Origin Dao Manual",
  "Void Origin Technique",
  "Eternity Cultivation Art",
  "Supreme Dao Manual",
  "Heavenly Thunder Manual",
  "Everfrost Jade Manual",
  "Starlight Gathering Manual",
  "Voidwalker Manual",
  "Celestial Beast Manual",
  "Ethereal Shadow Monarch Manual",
  "Bloodline of the Titans Manual",
  "Celestial Gale Manual",
  "Abyssal Serpent Manual",
  "Celestial Thunder Manual",
  "Bloodline of the Phoenix Manual",
  "Celestial Frost Manual",
  "Ethereal Flame Monarch Manual",
  "Celestial Nightshade Manual",
  "Bloodline of the Stars Manual",
  "Celestial Earth Manual",
  "Ethereal Spirit Manual",
  "Celestial Water Manual",
  "Bloodline of the Ancients Manual",
  "Celestial Fire Manual",
  "Ethereal Wind Manual",
  "Celestial Light Manual",
  "Bloodline of the Shadows Manual",
  "Celestial Darkness Manual",
  "Ethereal Ice Manual",
  "Celestial Storm Manual",
  "Bloodline of the Elements Manual",
  "Celestial Void Manual",
  "Ethereal Thunder Manual",
  "Celestial Lightning Manual",
  "Bloodline of the Cosmos Manual",
  "Celestial Time Manual",
  "Ethereal Space Manual",
  "Celestial Reality Manual",
  "Bloodline of the Universe Manual",
  "Celestial Dream Manual",
  "Ethereal Illusion Manual",
  "Celestial Memory Manual",
  "Bloodline of the Progenitors Manual",
  "Celestial Fate Manual",
  "Nine Heavens Sword Manual",
  "Heavenly Dao Scripture",
  "Primordial Chaos Manual",
  "Starforged Body Art",
  "Moonshadow Concealment Technique",
  "Sunfire Tempering Manual",
  "Lotus Heart Meditation",
  "Azure Dragon Claw Art",
  "Vermillion Bird Flame Scripture",
  "White Tiger Roar Technique",
  "Black Tortoise Shell Defense",
  "Golden Crow Sun Art",
  "Silver Wolf Speed Manual",
  "Thunder Emperor's Wrath",
  "Frostjade Immortal Scripture",
  "Spiritwood Vessel Technique",
  "Ironblood War Chant",
  "Mirage Glass Illusion Manual",
  "Samsara Cycle Scripture",
  "Tempest Gale Movement Art",
  "Shadow Veil Stealth Manual",
  "Ocean Tide Flow Technique",
  "Stoneheart Diamond Body Art",
  "Sword-Heart Tempered Manual",
  "Furnace of Nine Cycles",
  "Heaven-Defying Pulse Scripture",
  "Ethereal Spirit Ascension",
  "Celestial Flame Body Art",
  "Mystic Frost Technique",
  "Thunderous Roar Manual",
  "Eternal Nightshade Scripture",
  "Divine Dragon Sovereign Manual",
  "Spirit-Wind Sovereign Art",
  "Bloodline of the Ancients Scripture",
  "Celestial Starfire Manual",
  "Voidwalker Movement Art",
  "Celestial Beast Sovereign Manual",
  "Bloodline of the Titans Scripture",
  "Celestial Gale Movement Art",
  "Abyssal Serpent Sovereign Manual",
  "Celestial Thunder Sovereign Art",
  "Bloodline of the Phoenix Scripture",
  "Celestial Frost Sovereign Manual",
  "Ethereal Flame Monarch Scripture",
  "Celestial Nightshade Sovereign Art",
  "Bloodline of the Stars Scripture",
  "Celestial Earth Sovereign Manual",
  "Ethereal Wind Sovereign Art",
  "Celestial Water Sovereign Manual",
  "Bloodline of the Primordials Scripture",
  "Celestial Fire Sovereign Manual",
  "Ethereal Light Sovereign Art",
  "Celestial Light Sovereign Manual",
  "Bloodline of the Shadows Scripture",
  "Celestial Darkness Sovereign Manual",
  "Ethereal Ice Sovereign Art",
  "Celestial Storm Sovereign Manual",
  "Bloodline of the Elements Scripture",
  "Celestial Void Sovereign Manual",
  "Ethereal Thunder Sovereign Art",
  "Celestial Lightning Sovereign Manual",
  "Bloodline of the Cosmos Scripture",
  "Celestial Time Sovereign Manual",
  "Ethereal Space Sovereign Art",
  "Celestial Reality Sovereign Manual",
  "Bloodline of the Universe Scripture",
  "Celestial Dream Sovereign Manual",
  "Ethereal Illusion Sovereign Art",
  "Celestial Memory Sovereign Manual",
  "Bloodline of the Progenitors Scripture",
  "Celestial Fate Sovereign Manual",
  "Heavenly Pill Refining Manual",
  "Dao of Alchemy Scripture",
  "Spirit Beast Taming Art",
  "Soul Binding Technique",
  "Heavenly Law Comprehension Manual",
  "Dao of Formation Scripture",
  "Heavenly Array Manual",
  "Spirit Sealing Technique",
  "Heavenly Tribulation Survival Art",
  "Dao of Luck Scripture",
  "Fate Manipulation Manual",
  "Heavenly Opportunity Grasping Art",
  "Dao of Destiny Scripture",
  "Heavenly Will Manifestation Manual",
  "Dao of Karma Scripture",
  "Heavenly Blessing Manual",
  "Dao of Fortune Scripture",
  "Heavenly Star Chart Manual",
  "Dao of Space-Time Scripture",
  "Heavenly Dreamwalking Art",
  "Dao of Illusion Scripture",
  "Heavenly Memory Recall Manual",
  "Dao of Progenitors Scripture",
  "Heavenly Fate Weaving Manual",
  "Dao of Unity Scripture",
  "Heavenly Harmony Manual",
  "Dao of Creation Scripture",
  "Heavenly Unity Manual",
  "Dao of Destruction Scripture",
  "Heavenly Destruction Manual",
  "Dao of Rebirth Scripture",
  "Heavenly Rebirth Manual",
  "Dao of Eternity Scripture",
  "Heavenly Eternity Manual",
  "Dao of Primordial Chaos Scripture",
  "Heavenly Chaos Manual"
];

// Create all manuals
export const MANUALS: Manual[] = MANUAL_NAMES.map((name, index) => 
  createManual(name, index, MANUAL_NAMES.length)
);

// Helpers: realm-scaled accessors for manuals
export function getManualById(id: string): Manual | undefined {
  return ALL_MANUALS.find(m => m.id === id);
}

export function getScaledManualEffects(m: Manual, realm: string): Manual['effects'] {
  return scaleManualEffects(m.effects as Record<string, any>, realm);
}

export function getManualByIdScaled(id: string, realm: string): Manual | undefined {
  const m = getManualById(id);
  if (!m) return undefined;
  return {
    ...m,
    effects: getScaledManualEffects(m, realm)
  };
}

// Keep original main character manuals and add them to the beginning (xianxia style)
const ORIGINAL_MAIN_CHARACTER_MANUALS: Manual[] = [
  {
    id: 'basic_qi_gathering',
    name: 'Basic Qi Gathering Manual',
    description: 'Fundamental arts for sensing and gathering spiritual qi.',
    rank: "H",
    effects: {
      cultivationSpeed: 1.1,
      qiGathering: 20
    }
  },
  {
    id: 'body_refinement_basics',
    name: 'Body Refinement Basics',
    description: 'Basic xianxia exercises to temper the flesh and bones.',
    rank: "H",
    effects: {
      bodyRefinement: 1,
      hp: 15
    }
  },
  {
    id: 'meditation_fundamentals',
    name: 'Meditation Fundamentals',
    description: 'Basic meditation arts to calm the soul and focus spiritual energy.',
    rank: "H",
    effects: {
      soulWill: 1,
      daoHeart: 10
    }
  },
  {
    id: 'martial_foundations',
    name: 'Martial Foundations Manual',
    description: 'Fundamental martial arts and stances for the path of cultivation.',
    rank: "H",
    effects: {
      martialMastery: 1,
      atk: 5
    }
  },
  // Add more original manuals as needed
];

// Combine original main characters with new manuals
export const ALL_MANUALS: Manual[] = [
  ...ORIGINAL_MAIN_CHARACTER_MANUALS,
  ...MANUALS
];

// Merge in developer-provided seed manuals when present (non-blocking at runtime)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedManuals = require('../../data/manuals/seed_manuals.json');
  if (Array.isArray(seedManuals) && seedManuals.length > 0) {
    // Map the simple seed shape to Manual objects compatible with ALL_MANUALS
    const mapped = seedManuals.map((m: any) => ({
      id: m.id || generateManualId(m.title || m.name || 'seed_manual'),
      name: m.title || m.name || m.id,
      description: m.description || '',
      rank: (m.rarity || 'H') as any,
      effects: m.effects || {}
    } as Manual));
    // Append (do not replace) so original list remains intact
    (ALL_MANUALS as Manual[]).push(...mapped);
  }
} catch (e) { /* ignore missing seed manuals */ }

// Export for use in character creation and other systems
export { getRealmMultiplier, scaleManualEffects } from './scalingSystem';
