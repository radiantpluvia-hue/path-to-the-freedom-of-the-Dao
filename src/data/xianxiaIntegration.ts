// Xianxia Integration System
// This file provides integration between bloodlines, physiques, manuals, and the scaling system

import { ALL_BLOODLINES, PHYSIQUES as ALL_PHYSIQUES, ALL_MANUALS, CULTIVATION_REALMS } from '@/data';
import { getRealmMultiplier, scaleBloodlineStats, scalePhysiqueStats, scaleCultivationSpeed, scaleManualEffects } from './scalingSystem';

// Interface for integrated character stats
export interface IntegratedCharacterStats {
  baseStats: {
    qi: number;
    atk: number;
    def: number;
    speed: number;
    hp: number;
  };
  cultivationSpeed: number;
  specialAbilities: string[];
  skillBonuses: Record<string, number>;
}

// Type guard for valid stat keys
function isValidStatKey(key: string): key is keyof IntegratedCharacterStats['baseStats'] {
  return ['qi', 'atk', 'def', 'speed', 'hp'].includes(key);
}

// Helper to convert StatEffect to number for scaling
import { StatEffect } from '../types';

function statEffectToNumber(statEffect: StatEffect, realm: string): number {
  if (typeof statEffect === 'number') {
    return statEffect;
  }
  // For scaling type 'realm', multiply base by realm multiplier
  if (statEffect.scaling.type === 'realm') {
    const realmMultiplier = getRealmMultiplier(realm);
    return statEffect.base * realmMultiplier * statEffect.scaling.multiplier;
  }
  // For scaling type 'level', just multiply base by multiplier (assuming level scaling not implemented here)
  return statEffect.base * statEffect.scaling.multiplier;
}

// Get all available bloodlines for character creation
export function getAvailableBloodlines(): typeof ALL_BLOODLINES {
  return ALL_BLOODLINES;
}

// Get all available physiques for character creation
export function getAvailablePhysiques(): typeof ALL_PHYSIQUES {
  return ALL_PHYSIQUES;
}

// Get all available manuals for character creation
export function getAvailableManuals(): typeof ALL_MANUALS {
  return ALL_MANUALS;
}

// Calculate integrated character stats based on bloodline, physique, manuals, and realm
export function calculateIntegratedStats(
  bloodlineId: string,
  physiqueId: string,
  manualIds: string[],
  realm: string
): IntegratedCharacterStats {
  const bloodline = ALL_BLOODLINES.find(b => b.id === bloodlineId);
  const physique = ALL_PHYSIQUES.find(p => p.id === physiqueId);
  const manuals = ALL_MANUALS.filter(m => manualIds.includes(m.id));
  
  const realmMultiplier = getRealmMultiplier(realm);
  
  // Calculate base stats
  const baseStats = {
    qi: 100,
    atk: 10,
    def: 10,
    speed: 5,
    hp: 100
  };
  
  // Apply bloodline stats
  if (bloodline && bloodline.effects.stats) {
    // Convert StatEffect to number before scaling
    const bloodlineStatsNumber: Record<string, number> = {};
    Object.entries(bloodline.effects.stats).forEach(([stat, effect]) => {
      bloodlineStatsNumber[stat] = statEffectToNumber(effect as StatEffect, realm);
    });
    const scaledBloodlineStats = scaleBloodlineStats(bloodlineStatsNumber, realm);
    Object.entries(scaledBloodlineStats).forEach(([stat, value]) => {
      if (isValidStatKey(stat) && typeof value === 'number') {
        baseStats[stat] += value;
      }
    });
  }
  
  // Apply physique stats
  if (physique && physique.effects.stats) {
    // Convert StatEffect to number before scaling
    const physiqueStatsNumber: Record<string, number> = {};
    Object.entries(physique.effects.stats).forEach(([stat, effect]) => {
      physiqueStatsNumber[stat] = statEffectToNumber(effect as StatEffect, realm);
    });
    const scaledPhysiqueStats = scalePhysiqueStats(physiqueStatsNumber, realm);
    Object.entries(scaledPhysiqueStats).forEach(([stat, value]) => {
      if (isValidStatKey(stat) && typeof value === 'number') {
        baseStats[stat] += value;
      }
    });
  }
  
  // Apply manual stats
  manuals.forEach(manual => {
    const scaledManualEffects = scaleManualEffects(manual.effects, realm);
    Object.entries(scaledManualEffects).forEach(([effect, value]) => {
      if (isValidStatKey(effect) && typeof value === 'number') {
        baseStats[effect] += value;
      }
    });
  });
  
  // Calculate cultivation speed
  let cultivationSpeed = 1.0;
  if (physique && physique.effects.cultivation_speed) {
    let cultivationSpeedValue: number;
    if (typeof physique.effects.cultivation_speed === 'number') {
      cultivationSpeedValue = physique.effects.cultivation_speed;
    } else {
      cultivationSpeedValue = statEffectToNumber(physique.effects.cultivation_speed as StatEffect, realm);
    }
    cultivationSpeed *= scaleCultivationSpeed(cultivationSpeedValue, realm);
  }
  
  manuals.forEach(manual => {
    const scaledManualEffects = scaleManualEffects(manual.effects, realm);
    if (typeof scaledManualEffects.cultivationSpeed === 'number') {
      cultivationSpeed *= scaledManualEffects.cultivationSpeed;
    }
  });
  
  // Collect special abilities
  const specialAbilities: string[] = [];
  if (bloodline && Array.isArray(bloodline.effects.special)) {
    specialAbilities.push(...bloodline.effects.special);
  }
  if (physique && Array.isArray(physique.effects.special)) {
    specialAbilities.push(...physique.effects.special);
  }
  manuals.forEach(manual => {
    if (Array.isArray(manual.effects.special)) {
      specialAbilities.push(...manual.effects.special);
    }
  });
  
  // Collect skill bonuses
  const skillBonuses: Record<string, number> = {};
  if (bloodline && bloodline.effects.skills) {
    Object.entries(bloodline.effects.skills).forEach(([skill, value]) => {
      if (typeof value === 'number') {
        skillBonuses[skill] = (skillBonuses[skill] || 0) + value * realmMultiplier;
      }
    });
  }
  
  manuals.forEach(manual => {
    const scaledManualEffects = scaleManualEffects(manual.effects, realm);
    Object.entries(scaledManualEffects).forEach(([effect, value]) => {
      if (typeof value === 'number' && [
        'combatSkills', 'qiControl', 'bodyTempering', 'daoInsight', 
        'mentalFortitude', 'spiritBeastTaming', 'alchemy', 'elementalMastery'
      ].includes(effect)) {
        skillBonuses[effect] = (skillBonuses[effect] || 0) + value;
      }
    });
  });
  
  return {
    baseStats,
    cultivationSpeed,
    specialAbilities: Array.from(new Set(specialAbilities)), // Remove duplicates
    skillBonuses
  };
}

// Get bloodline by ID with realm scaling
export function getBloodlineWithScaling(bloodlineId: string, realm: string) {
  const bloodline = ALL_BLOODLINES.find(b => b.id === bloodlineId);
  if (!bloodline) return null;

  // Convert StatEffect to number before scaling
  const bloodlineStatsNumber: Record<string, number> = {};
  if (bloodline.effects.stats) {
    Object.entries(bloodline.effects.stats).forEach(([stat, effect]) => {
      bloodlineStatsNumber[stat] = statEffectToNumber(effect as StatEffect, realm);
    });
  }

  return {
    ...bloodline,
    effects: {
      ...bloodline.effects,
      stats: scaleBloodlineStats(bloodlineStatsNumber, realm)
    }
  };
}

// Get physique by ID with realm scaling
export function getPhysiqueWithScaling(physiqueId: string, realm: string) {
  const physique = ALL_PHYSIQUES.find(p => p.id === physiqueId);
  if (!physique) return null;

  // Convert StatEffect to number before scaling
  const physiqueStatsNumber: Record<string, number> = {};
  if (physique.effects.stats) {
    Object.entries(physique.effects.stats).forEach(([stat, effect]) => {
      physiqueStatsNumber[stat] = statEffectToNumber(effect as StatEffect, realm);
    });
  }

  // Convert cultivation_speed if it's StatEffect
  let cultivationSpeedNumber = 1.0;
  if (physique.effects.cultivation_speed) {
    if (typeof physique.effects.cultivation_speed === 'number') {
      cultivationSpeedNumber = physique.effects.cultivation_speed;
    } else {
      cultivationSpeedNumber = statEffectToNumber(physique.effects.cultivation_speed, realm);
    }
  }

  return {
    ...physique,
    effects: {
      ...physique.effects,
      stats: scalePhysiqueStats(physiqueStatsNumber, realm),
      cultivation_speed: scaleCultivationSpeed(cultivationSpeedNumber, realm)
    }
  };
}

// Get manual by ID with realm scaling
export function getManualWithScaling(manualId: string, realm: string) {
  const manual = ALL_MANUALS.find(m => m.id === manualId);
  if (!manual) return null;
  
  return {
    ...manual,
    effects: scaleManualEffects(manual.effects, realm)
  };
}

// Filter bloodlines by rarity
export function filterBloodlinesByRarity(rarity: string) {
  return ALL_BLOODLINES.filter(bloodline => bloodline.rarity === rarity);
}

// Filter physiques by rarity
export function filterPhysiquesByRarity(rarity: string) {
  return ALL_PHYSIQUES.filter(physique => physique.rarity === rarity);
}

// Filter manuals by rank
export function filterManualsByRank(rank: string) {
  return ALL_MANUALS.filter(manual => manual.rank === rank);
}

// Get bloodlines that can be awakened at current realm
export function getAwakenableBloodlines(realm: string) {
  const realmOrder = Object.keys(CULTIVATION_REALMS);
  const currentIndex = realmOrder.indexOf(realm);
  
  return ALL_BLOODLINES.filter(bloodline => {
    const reqRealm = bloodline.awakening_requirements?.realm;
    if (!reqRealm) return false;
    
    const requiredIndex = realmOrder.indexOf(reqRealm);
    return requiredIndex >= 0 && currentIndex >= requiredIndex;
  });
}

// Check if bloodline can be awakened
export function canAwakenBloodline(bloodlineId: string, realm: string, currentQi: number) {
  const bloodline = ALL_BLOODLINES.find(b => b.id === bloodlineId);
  if (!bloodline || !bloodline.awakening_requirements) return false;
  
  const realmOrder = Object.keys(CULTIVATION_REALMS);
  const currentIndex = realmOrder.indexOf(realm);
  const requiredIndex = realmOrder.indexOf(bloodline.awakening_requirements.realm);
  
  return currentIndex >= 0 && requiredIndex >= 0 && 
         currentIndex >= requiredIndex && 
         currentQi >= (bloodline.awakening_requirements.qi || 0);
}

// Precompute theme matches for better performance
const THEME_MATCHES = {
  dragon: { synergy: 90, description: 'Perfect dragon-themed combination with enhanced draconic powers' },
  phoenix: { synergy: 90, description: 'Perfect phoenix-themed combination with enhanced rebirth abilities' },
  celestial: { synergy: 85, description: 'Celestial combination with divine blessings' },
  void: { synergy: 85, description: 'Void-themed combination with dimensional mastery' },
  elemental: { synergy: 80, description: 'Elemental combination with nature harmony' }
};

// Get recommended bloodline/physique combinations
export function getRecommendedCombinations() {
  const recommendations: Array<{
    bloodline: string;
    physique: string;
    synergy: number;
    description: string;
  }> = [];
  
  // Precompute bloodline themes
  const bloodlineThemes = new Map<string, string[]>();
  ALL_BLOODLINES.forEach(bloodline => {
    const themes: string[] = [];
    const nameLower = bloodline.name.toLowerCase();
    Object.keys(THEME_MATCHES).forEach(theme => {
      if (nameLower.includes(theme)) {
        themes.push(theme);
      }
    });
    bloodlineThemes.set(bloodline.id, themes);
  });
  
  // Precompute physique themes
  const physiqueThemes = new Map<string, string[]>();
  ALL_PHYSIQUES.forEach(physique => {
    const themes: string[] = [];
    const nameLower = physique.name.toLowerCase();
    Object.keys(THEME_MATCHES).forEach(theme => {
      if (nameLower.includes(theme)) {
        themes.push(theme);
      }
    });
    physiqueThemes.set(physique.id, themes);
  });
  
  // Find matching themes
  ALL_BLOODLINES.forEach(bloodline => {
    const bloodlineThemeList = bloodlineThemes.get(bloodline.id) || [];
    if (bloodlineThemeList.length === 0) return;
    
    ALL_PHYSIQUES.forEach(physique => {
      const physiqueThemeList = physiqueThemes.get(physique.id) || [];
      
      // Find matching themes
      const matchingThemes = bloodlineThemeList.filter(theme => 
        physiqueThemeList.includes(theme)
      );
      
      if (matchingThemes.length > 0) {
        // Use the highest synergy theme
        const bestTheme = matchingThemes.reduce((best, theme) => {
          const currentSynergy = THEME_MATCHES[theme as keyof typeof THEME_MATCHES].synergy;
          return currentSynergy > best.synergy ? { theme, synergy: currentSynergy } : best;
        }, { theme: '', synergy: 0 });
        
        if (bestTheme.theme) {
          recommendations.push({
            bloodline: bloodline.id,
            physique: physique.id,
            synergy: bestTheme.synergy,
            description: THEME_MATCHES[bestTheme.theme as keyof typeof THEME_MATCHES].description
          });
        }
      }
    });
  });
  
  return recommendations.sort((a, b) => b.synergy - a.synergy);
}

// Export for use in other systems
export {
  ALL_BLOODLINES,
  ALL_PHYSIQUES,
  ALL_MANUALS,
  getRealmMultiplier,
  scaleBloodlineStats,
  scalePhysiqueStats,
  scaleCultivationSpeed,
  scaleManualEffects
};
