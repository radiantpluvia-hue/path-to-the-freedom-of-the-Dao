import { CULTIVATION_REALMS, getRealmBreakthroughDifficulty, getMinorStageCount } from './src/data/cultivationRealms';
import { ALL_BLOODLINES } from './src/data/bloodlines_fixed';
import { ALL_PHYSIQUES } from './src/data/physiques';
import { ALL_MANUALS } from './src/data/manuals';

export interface CultivationSession {
  duration: number; // in minutes
  qiGained: number;
  comprehensionGained: number;
  daoInsightGained: number;
  successRate: number;
  riskFactor: number;
}

export interface BreakthroughAttempt {
  realm: string;
  currentStage: number;
  targetStage: number;
  qiRequired: number;
  successChance: number;
  tribulationLevel: number;
  rewards: {
    qiBonus: number;
    lifespanBonus: number;
    statBonuses: Record<string, number>;
  };
  penalties: {
    qiLoss: number;
    lifespanLoss: number;
    injurySeverity: number;
  };
}

export interface Tribulation {
  level: number;
  type: 'heavenly' | 'heart_demon' | 'karmic' | 'dao';
  description: string;
  difficulty: number;
  effects: {
    damage: number;
    mentalStress: number;
    daoDeviation: number;
  };
  rewards: {
    daoInsight: number;
    mentalFortitude: number;
    tribulationResistance: number;
  };
}

export interface CultivationModifier {
  type: 'talent' | 'bloodline' | 'physique' | 'manual' | 'environment' | 'state' | 'background' | 'passive';
  name: string;
  multiplier: number;
  description: string;
  duration?: number; // in minutes, undefined for permanent
}

// Base cultivation rates per realm (qi per minute)
export const BASE_CULTIVATION_RATES: Record<string, number> = {
  mortal: 1,
  qi_refinement: 2,
  foundation_establishment: 5,
  body_integration: 10,
  mahayana: 20,
  golden_immortal: 50,
  taiyi_golden_immortal: 100,
  daluo_golden_immortal: 200,
  soul_transformation: 500,
  void_refinement: 1000,
  saint: 2000,
  primordial_saint: 4000,
  dao: 8000,
  eternal_dao_sovereign: 16000,
  infinite_dao_master: 32000,
  core_formation: 64000,
  nascent_soul: 128000,
  true_immortal: 256000,
  quasi_saint: 512000,
  dao_ancestor: 1024000,
  dimension_lord: 2048000,
  chaos_saint: 4096000,
  supreme_dao_origin: 8192000,
  void_transcendent: 16384000,
  reality_weaver: 32768000,
  multiverse_sovereign: 65536000,
  omniversal_emperor: 131072000,
  absolute_existence: 262144000,
  primordial_chaos_lord: 524288000,
  eternal_dao_emperor: 1048576000
};

// Talent multipliers for cultivation speed
export const TALENT_CULTIVATION_MULTIPLIERS: Record<string, number> = {
  heavenly: 2.0,
  peerless: 1.8,
  supreme: 1.6,
  excellent: 1.4,
  good: 1.2,
  average: 1.0,
  poor: 0.8,
  trash: 0.6
};

// Environment modifiers
export const ENVIRONMENT_MODIFIERS: Record<string, CultivationModifier> = {
  spiritual_vein: {
    type: 'environment',
    name: 'Spiritual Vein',
    multiplier: 1.5,
    description: 'Dense spiritual energy increases cultivation speed by 50%'
  },
  dao_enlightenment_site: {
    type: 'environment',
    name: 'Dao Enlightenment Site',
    multiplier: 2.0,
    description: 'Sacred location enhances comprehension and dao insight'
  },
  heavenly_treasure: {
    type: 'environment',
    name: 'Heavenly Treasure',
    multiplier: 3.0,
    description: 'Rare heavenly treasure amplifies cultivation dramatically'
  },
  qi_storm: {
    type: 'environment',
    name: 'Qi Storm',
    multiplier: 0.5,
    description: 'Chaotic qi flow reduces cultivation efficiency'
  }
};

// State modifiers (temporary conditions)
export const STATE_MODIFIERS: Record<string, CultivationModifier> = {
  enlightened: {
    type: 'state',
    name: 'Enlightened State',
    multiplier: 2.5,
    description: 'Moment of enlightenment doubles cultivation speed',
    duration: 60 // 1 hour
  },
  injured: {
    type: 'state',
    name: 'Injured',
    multiplier: 0.3,
    description: 'Severe injuries hinder cultivation progress',
    duration: 1440 // 1 day
  },
  heart_demon: {
    type: 'state',
    name: 'Heart Demon',
    multiplier: 0.1,
    description: 'Mental turmoil prevents effective cultivation',
    duration: 720 // 12 hours
  },
  dao_comprehension: {
    type: 'state',
    name: 'Dao Comprehension',
    multiplier: 3.0,
    description: 'Deep understanding of dao principles enhances cultivation',
    duration: 120 // 2 hours
  }
};

// Breakthrough success rates based on preparation
export const BREAKTHROUGH_SUCCESS_RATES: Record<string, number> = {
  unprepared: 0.1,    // 10%
  basic_prep: 0.3,    // 30%
  good_prep: 0.5,     // 50%
  excellent_prep: 0.7, // 70%
  perfect_prep: 0.9   // 90%
};

// Tribulation data
export const TRIBULATIONS: Record<number, Tribulation> = {
  1: {
    level: 1,
    type: 'heavenly',
    description: 'Minor heavenly tribulation with lightning and wind',
    difficulty: 1,
    effects: {
      damage: 100,
      mentalStress: 10,
      daoDeviation: 5
    },
    rewards: {
      daoInsight: 10,
      mentalFortitude: 5,
      tribulationResistance: 1
    }
  },
  2: {
    level: 2,
    type: 'heavenly',
    description: 'Heavenly tribulation with enhanced lightning and fire',
    difficulty: 2,
    effects: {
      damage: 500,
      mentalStress: 25,
      daoDeviation: 10
    },
    rewards: {
      daoInsight: 25,
      mentalFortitude: 10,
      tribulationResistance: 2
    }
  },
  3: {
    level: 3,
    type: 'heart_demon',
    description: 'Heart demon tribulation testing inner demons',
    difficulty: 3,
    effects: {
      damage: 1000,
      mentalStress: 100,
      daoDeviation: 50
    },
    rewards: {
      daoInsight: 50,
      mentalFortitude: 25,
      tribulationResistance: 5
    }
  },
  4: {
    level: 4,
    type: 'karmic',
    description: 'Karmic tribulation reflecting past actions',
    difficulty: 4,
    effects: {
      damage: 2500,
      mentalStress: 200,
      daoDeviation: 100
    },
    rewards: {
      daoInsight: 100,
      mentalFortitude: 50,
      tribulationResistance: 10
    }
  },
  5: {
    level: 5,
    type: 'dao',
    description: 'Dao tribulation testing comprehension of cosmic laws',
    difficulty: 5,
    effects: {
      damage: 5000,
      mentalStress: 500,
      daoDeviation: 200
    },
    rewards: {
      daoInsight: 200,
      mentalFortitude: 100,
      tribulationResistance: 20
    }
  }
};

// Dao comprehension mechanics
export interface DaoComprehension {
  dao: string;
  level: number;
  comprehension: number; // 0-100
  insights: string[];
  effects: Record<string, number>;
}

export const DAO_TYPES = [
  'Dao of Fire',
  'Dao of Water',
  'Dao of Earth',
  'Dao of Wind',
  'Dao of Lightning',
  'Dao of Space',
  'Dao of Time',
  'Dao of Life',
  'Dao of Death',
  'Dao of Creation',
  'Dao of Destruction',
  'Dao of Balance'
];

// Functions for cultivation calculations

export function calculateCultivationSpeed(
  realm: string,
  talent: string,
  modifiers: CultivationModifier[] = []
): number {
  let baseSpeed = BASE_CULTIVATION_RATES[realm] || 1;
  let talentMultiplier = TALENT_CULTIVATION_MULTIPLIERS[talent] || 1.0;

  // Apply all modifiers
  let totalMultiplier = talentMultiplier;
  for (const modifier of modifiers) {
    totalMultiplier *= modifier.multiplier;
  }

  return Math.floor(baseSpeed * totalMultiplier);
}

export function calculateBreakthroughChance(
  realm: string,
  preparationLevel: string,
  daoComprehension: number,
  mentalFortitude: number
): number {
  const baseChance = BREAKTHROUGH_SUCCESS_RATES[preparationLevel] || 0.1;
  const daoBonus = daoComprehension * 0.01; // 1% per point of dao comprehension
  const mentalBonus = mentalFortitude * 0.005; // 0.5% per point of mental fortitude

  return Math.min(baseChance + daoBonus + mentalBonus, 0.95); // Max 95% chance
}

export function generateCultivationSession(
  realm: string,
  talent: string,
  duration: number,
  modifiers: CultivationModifier[] = []
): CultivationSession {
  const speed = calculateCultivationSpeed(realm, talent, modifiers);
  const qiGained = speed * duration;

  // Comprehension and dao insight scale with realm
  const realmIndex = Object.keys(CULTIVATION_REALMS).indexOf(realm);
  const comprehensionMultiplier = Math.max(1, realmIndex * 0.1);
  const daoMultiplier = Math.max(1, realmIndex * 0.05);

  const comprehensionGained = Math.floor(duration * comprehensionMultiplier * 0.1);
  const daoInsightGained = Math.floor(duration * daoMultiplier * 0.05);

  // Success rate and risk factor
  const successRate = Math.min(0.95, 0.8 + (realmIndex * 0.01));
  const riskFactor = Math.max(0.05, 0.2 - (realmIndex * 0.01));

  return {
    duration,
    qiGained,
    comprehensionGained,
    daoInsightGained,
    successRate,
    riskFactor
  };
}

export function generateBreakthroughAttempt(
  realm: string,
  currentStage: number,
  targetStage: number
): BreakthroughAttempt {
  const realmData = CULTIVATION_REALMS[realm];
  if (!realmData) throw new Error(`Unknown realm: ${realm}`);

  const qiRequired = realmData.qiRequirement * (targetStage / realmData.minorStages);
  const difficulty = getRealmBreakthroughDifficulty(realm);
  const tribulationLevel = Math.min(5, Math.floor(difficulty / 10) + 1);

  const successChance = Math.max(0.05, 0.5 - (difficulty * 0.01));

  return {
    realm,
    currentStage,
    targetStage,
    qiRequired: Math.floor(qiRequired),
    successChance,
    tribulationLevel,
    rewards: {
      qiBonus: Math.floor(qiRequired * 0.1),
      lifespanBonus: realmData.lifespanBonus,
      statBonuses: {
        hp: 50 * targetStage,
        qi: 100 * targetStage,
        comprehension: 5 * targetStage
      }
    },
    penalties: {
      qiLoss: Math.floor(qiRequired * 0.5),
      lifespanLoss: Math.floor(realmData.lifespanBonus * 0.2),
      injurySeverity: Math.floor(difficulty / 20)
    }
  };
}

export function getTribulationForLevel(level: number): Tribulation {
  return TRIBULATIONS[Math.min(5, Math.max(1, level))] || TRIBULATIONS[1];
}

export function calculateDaoComprehensionProgress(
  dao: string,
  currentLevel: number,
  studyTime: number,
  insight: number
): number {
  const baseProgress = studyTime * 0.1; // 0.1 comprehension per minute
  const insightBonus = insight * 0.01; // 1% bonus per insight point

  return Math.floor(baseProgress * (1 + insightBonus));
}

// Helper function to get all applicable modifiers
export function getApplicableModifiers(
  environment: string[],
  states: string[],
  bloodline?: string,
  physique?: string,
  manual?: string
): CultivationModifier[] {
  const modifiers: CultivationModifier[] = [];

  // Environment modifiers
  for (const env of environment) {
    if (ENVIRONMENT_MODIFIERS[env]) {
      modifiers.push(ENVIRONMENT_MODIFIERS[env]);
    }
  }

  // State modifiers
  for (const state of states) {
    if (STATE_MODIFIERS[state]) {
      modifiers.push(STATE_MODIFIERS[state]);
    }
  }

  // Bloodline modifiers
  if (bloodline) {
    const bloodlineData = ALL_BLOODLINES.find(b => b.id === bloodline);
    if (bloodlineData && bloodlineData.effects.stats?.cultivation_speed) {
      const cs = bloodlineData.effects.stats.cultivation_speed;
      let multiplier: number = 0;
      if (typeof cs === 'number') {
        multiplier = cs;
      } else if (typeof cs === 'object' && typeof cs.base === 'number') {
        multiplier = cs.base;
      }
      modifiers.push({
        type: 'bloodline',
        name: bloodlineData.name,
        multiplier,
        description: bloodlineData.description
      });
    }
  }

  // Physique modifiers
    if (physique) {
      const physiqueData = ALL_PHYSIQUES.find(p => p.id === physique);
      if (physiqueData && physiqueData.effects.cultivation_speed) {
        const cs = physiqueData.effects.cultivation_speed;
        let multiplier: number = 0;
        if (typeof cs === 'number') {
          multiplier = cs;
        } else if (typeof cs === 'object' && typeof cs.base === 'number') {
          multiplier = cs.base;
        }
        modifiers.push({
          type: 'physique',
          name: physiqueData.name,
          multiplier,
          description: physiqueData.description
        });
      }
  }

  // Manual modifiers (unscaled: use base manual effects)
  if (manual) {
    try {
      const manualData = ALL_MANUALS.find(m => m.id === manual);
      if (manualData) {
        const effects: any = manualData.effects || {};
        // Normalize possible keys: cultivationSpeed or cultivation_speed
        const raw = effects.cultivationSpeed ?? effects.cultivation_speed;
        if (raw != null) {
          let multiplier = 0;
          if (typeof raw === 'number') {
            multiplier = raw;
          } else if (typeof raw === 'object' && typeof (raw as any).base === 'number') {
            multiplier = (raw as any).base;
          }
          if (multiplier && multiplier > 0) {
            modifiers.push({
              type: 'manual',
              name: manualData.name,
              multiplier,
              description: manualData.description
            });
          }
        }
      }
    } catch (e) {
      // ignore manual lookup failures
    }
  }

  return modifiers;
}

// Derive cultivation-related modifiers from player's background and passives when available.
// This is intentionally tolerant: if fields are missing, returns an empty list.
export function getBackgroundPassiveModifiersFromPlayer(player: any): CultivationModifier[] {
  const out: CultivationModifier[] = [];
  try {
    if (!player) return out;

    // Background: look for normalized keys on effects or stats
    const bg = player.background as any;
    if (bg && typeof bg === 'object') {
      const effects = (bg.effects || {}) as any;
      // Prefer explicit effects.cultivationSpeed/cultivation_speed if present
      let raw = effects.cultivationSpeed ?? effects.cultivation_speed;
      if (raw == null && effects.stats && typeof effects.stats === 'object') {
        raw = effects.stats.cultivationSpeed ?? effects.stats.cultivation_speed;
      }
      let multiplier = 0;
      if (typeof raw === 'number') multiplier = raw;
      else if (raw && typeof raw === 'object' && typeof raw.base === 'number') multiplier = raw.base as number;
      if (multiplier && multiplier > 0) {
        out.push({
          type: 'background',
          name: bg.name || 'Background',
          multiplier,
          description: 'Background effect on cultivation'
        });
      }
    }

    // Passive-derived: if player.stats carries an accumulated cultivationSpeed value, honor it.
    // Some systems aggregate passives/equipment into stats; we accept both camel and snake case.
    const stats = player.stats || {};
    let ps = (stats.cultivationSpeed ?? stats.cultivation_speed) as any;
    let pMult = 0;
    if (typeof ps === 'number') pMult = ps;
    else if (ps && typeof ps === 'object' && typeof ps.base === 'number') pMult = ps.base as number;
    if (pMult && pMult > 0) {
      out.push({
        type: 'passive',
        name: 'Passive effects',
        multiplier: pMult,
        description: 'Accumulated passives/equipment effect on cultivation'
      });
    }
  } catch (_e) {
    // ignore
  }
  return out;
}

// Export default object for easy importing
export default {
  calculateCultivationSpeed,
  calculateBreakthroughChance,
  generateCultivationSession,
  generateBreakthroughAttempt,
  getTribulationForLevel,
  calculateDaoComprehensionProgress,
  getApplicableModifiers,
  getBackgroundPassiveModifiersFromPlayer,
  BASE_CULTIVATION_RATES,
  TALENT_CULTIVATION_MULTIPLIERS,
  ENVIRONMENT_MODIFIERS,
  STATE_MODIFIERS,
  BREAKTHROUGH_SUCCESS_RATES,
  TRIBULATIONS,
  DAO_TYPES
};

// Compatibility aliases for legacy imports used across the codebase
export const calculateBreakthroughChanceSoftHeavy = calculateBreakthroughChance;
export const resolveBreakthroughSoftHeavy = generateBreakthroughAttempt;
export const calculateCultivationSpeedSoft = calculateCultivationSpeed;
export function qiDeviationRisk(..._args: any[]): number {
  // Legacy shim: return a conservative low risk by default
  return 0.05;
}
