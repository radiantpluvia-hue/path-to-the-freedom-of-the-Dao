"use strict";
// Xianxia Integration System
// This file provides integration between bloodlines, physiques, manuals, and the scaling system
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleManualEffects = exports.scaleCultivationSpeed = exports.scalePhysiqueStats = exports.scaleBloodlineStats = exports.getRealmMultiplier = exports.ALL_MANUALS = exports.ALL_PHYSIQUES = exports.ALL_BLOODLINES = void 0;
exports.getAvailableBloodlines = getAvailableBloodlines;
exports.getAvailablePhysiques = getAvailablePhysiques;
exports.getAvailableManuals = getAvailableManuals;
exports.calculateIntegratedStats = calculateIntegratedStats;
exports.getBloodlineWithScaling = getBloodlineWithScaling;
exports.getPhysiqueWithScaling = getPhysiqueWithScaling;
exports.getManualWithScaling = getManualWithScaling;
exports.filterBloodlinesByRarity = filterBloodlinesByRarity;
exports.filterPhysiquesByRarity = filterPhysiquesByRarity;
exports.filterManualsByRank = filterManualsByRank;
exports.getAwakenableBloodlines = getAwakenableBloodlines;
exports.canAwakenBloodline = canAwakenBloodline;
exports.getRecommendedCombinations = getRecommendedCombinations;
const data_1 = require("@/data");
Object.defineProperty(exports, "ALL_BLOODLINES", { enumerable: true, get: function () { return data_1.ALL_BLOODLINES; } });
Object.defineProperty(exports, "ALL_PHYSIQUES", { enumerable: true, get: function () { return data_1.PHYSIQUES; } });
Object.defineProperty(exports, "ALL_MANUALS", { enumerable: true, get: function () { return data_1.ALL_MANUALS; } });
const scalingSystem_1 = require("./scalingSystem");
Object.defineProperty(exports, "getRealmMultiplier", { enumerable: true, get: function () { return scalingSystem_1.getRealmMultiplier; } });
Object.defineProperty(exports, "scaleBloodlineStats", { enumerable: true, get: function () { return scalingSystem_1.scaleBloodlineStats; } });
Object.defineProperty(exports, "scalePhysiqueStats", { enumerable: true, get: function () { return scalingSystem_1.scalePhysiqueStats; } });
Object.defineProperty(exports, "scaleCultivationSpeed", { enumerable: true, get: function () { return scalingSystem_1.scaleCultivationSpeed; } });
Object.defineProperty(exports, "scaleManualEffects", { enumerable: true, get: function () { return scalingSystem_1.scaleManualEffects; } });
// Type guard for valid stat keys
function isValidStatKey(key) {
    return ['qi', 'atk', 'def', 'speed', 'hp'].includes(key);
}
function statEffectToNumber(statEffect, realm) {
    if (typeof statEffect === 'number') {
        return statEffect;
    }
    // For scaling type 'realm', multiply base by realm multiplier
    if (statEffect.scaling.type === 'realm') {
        const realmMultiplier = (0, scalingSystem_1.getRealmMultiplier)(realm);
        return statEffect.base * realmMultiplier * statEffect.scaling.multiplier;
    }
    // For scaling type 'level', just multiply base by multiplier (assuming level scaling not implemented here)
    return statEffect.base * statEffect.scaling.multiplier;
}
// Get all available bloodlines for character creation
function getAvailableBloodlines() {
    return data_1.ALL_BLOODLINES;
}
// Get all available physiques for character creation
function getAvailablePhysiques() {
    return data_1.PHYSIQUES;
}
// Get all available manuals for character creation
function getAvailableManuals() {
    return data_1.ALL_MANUALS;
}
// Calculate integrated character stats based on bloodline, physique, manuals, and realm
function calculateIntegratedStats(bloodlineId, physiqueId, manualIds, realm) {
    const bloodline = data_1.ALL_BLOODLINES.find(b => b.id === bloodlineId);
    const physique = data_1.PHYSIQUES.find(p => p.id === physiqueId);
    const manuals = data_1.ALL_MANUALS.filter(m => manualIds.includes(m.id));
    const realmMultiplier = (0, scalingSystem_1.getRealmMultiplier)(realm);
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
        const bloodlineStatsNumber = {};
        Object.entries(bloodline.effects.stats).forEach(([stat, effect]) => {
            bloodlineStatsNumber[stat] = statEffectToNumber(effect, realm);
        });
        const scaledBloodlineStats = (0, scalingSystem_1.scaleBloodlineStats)(bloodlineStatsNumber, realm);
        Object.entries(scaledBloodlineStats).forEach(([stat, value]) => {
            if (isValidStatKey(stat) && typeof value === 'number') {
                baseStats[stat] += value;
            }
        });
    }
    // Apply physique stats
    if (physique && physique.effects.stats) {
        // Convert StatEffect to number before scaling
        const physiqueStatsNumber = {};
        Object.entries(physique.effects.stats).forEach(([stat, effect]) => {
            physiqueStatsNumber[stat] = statEffectToNumber(effect, realm);
        });
        const scaledPhysiqueStats = (0, scalingSystem_1.scalePhysiqueStats)(physiqueStatsNumber, realm);
        Object.entries(scaledPhysiqueStats).forEach(([stat, value]) => {
            if (isValidStatKey(stat) && typeof value === 'number') {
                baseStats[stat] += value;
            }
        });
    }
    // Apply manual stats
    manuals.forEach(manual => {
        const scaledManualEffects = (0, scalingSystem_1.scaleManualEffects)(manual.effects, realm);
        Object.entries(scaledManualEffects).forEach(([effect, value]) => {
            if (isValidStatKey(effect) && typeof value === 'number') {
                baseStats[effect] += value;
            }
        });
    });
    // Calculate cultivation speed
    let cultivationSpeed = 1.0;
    if (physique && physique.effects.cultivation_speed) {
        let cultivationSpeedValue;
        if (typeof physique.effects.cultivation_speed === 'number') {
            cultivationSpeedValue = physique.effects.cultivation_speed;
        }
        else {
            cultivationSpeedValue = statEffectToNumber(physique.effects.cultivation_speed, realm);
        }
        cultivationSpeed *= (0, scalingSystem_1.scaleCultivationSpeed)(cultivationSpeedValue, realm);
    }
    manuals.forEach(manual => {
        const scaledManualEffects = (0, scalingSystem_1.scaleManualEffects)(manual.effects, realm);
        if (typeof scaledManualEffects.cultivationSpeed === 'number') {
            cultivationSpeed *= scaledManualEffects.cultivationSpeed;
        }
    });
    // Collect special abilities
    const specialAbilities = [];
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
    const skillBonuses = {};
    if (bloodline && bloodline.effects.skills) {
        Object.entries(bloodline.effects.skills).forEach(([skill, value]) => {
            if (typeof value === 'number') {
                skillBonuses[skill] = (skillBonuses[skill] || 0) + value * realmMultiplier;
            }
        });
    }
    manuals.forEach(manual => {
        const scaledManualEffects = (0, scalingSystem_1.scaleManualEffects)(manual.effects, realm);
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
function getBloodlineWithScaling(bloodlineId, realm) {
    const bloodline = data_1.ALL_BLOODLINES.find(b => b.id === bloodlineId);
    if (!bloodline)
        return null;
    // Convert StatEffect to number before scaling
    const bloodlineStatsNumber = {};
    if (bloodline.effects.stats) {
        Object.entries(bloodline.effects.stats).forEach(([stat, effect]) => {
            bloodlineStatsNumber[stat] = statEffectToNumber(effect, realm);
        });
    }
    return {
        ...bloodline,
        effects: {
            ...bloodline.effects,
            stats: (0, scalingSystem_1.scaleBloodlineStats)(bloodlineStatsNumber, realm)
        }
    };
}
// Get physique by ID with realm scaling
function getPhysiqueWithScaling(physiqueId, realm) {
    const physique = data_1.PHYSIQUES.find(p => p.id === physiqueId);
    if (!physique)
        return null;
    // Convert StatEffect to number before scaling
    const physiqueStatsNumber = {};
    if (physique.effects.stats) {
        Object.entries(physique.effects.stats).forEach(([stat, effect]) => {
            physiqueStatsNumber[stat] = statEffectToNumber(effect, realm);
        });
    }
    // Convert cultivation_speed if it's StatEffect
    let cultivationSpeedNumber = 1.0;
    if (physique.effects.cultivation_speed) {
        if (typeof physique.effects.cultivation_speed === 'number') {
            cultivationSpeedNumber = physique.effects.cultivation_speed;
        }
        else {
            cultivationSpeedNumber = statEffectToNumber(physique.effects.cultivation_speed, realm);
        }
    }
    return {
        ...physique,
        effects: {
            ...physique.effects,
            stats: (0, scalingSystem_1.scalePhysiqueStats)(physiqueStatsNumber, realm),
            cultivation_speed: (0, scalingSystem_1.scaleCultivationSpeed)(cultivationSpeedNumber, realm)
        }
    };
}
// Get manual by ID with realm scaling
function getManualWithScaling(manualId, realm) {
    const manual = data_1.ALL_MANUALS.find(m => m.id === manualId);
    if (!manual)
        return null;
    return {
        ...manual,
        effects: (0, scalingSystem_1.scaleManualEffects)(manual.effects, realm)
    };
}
// Filter bloodlines by rarity
function filterBloodlinesByRarity(rarity) {
    return data_1.ALL_BLOODLINES.filter(bloodline => bloodline.rarity === rarity);
}
// Filter physiques by rarity
function filterPhysiquesByRarity(rarity) {
    return data_1.PHYSIQUES.filter(physique => physique.rarity === rarity);
}
// Filter manuals by rank
function filterManualsByRank(rank) {
    return data_1.ALL_MANUALS.filter(manual => manual.rank === rank);
}
// Get bloodlines that can be awakened at current realm
function getAwakenableBloodlines(realm) {
    const realmOrder = Object.keys(data_1.CULTIVATION_REALMS);
    const currentIndex = realmOrder.indexOf(realm);
    return data_1.ALL_BLOODLINES.filter(bloodline => {
        const reqRealm = bloodline.awakening_requirements?.realm;
        if (!reqRealm)
            return false;
        const requiredIndex = realmOrder.indexOf(reqRealm);
        return requiredIndex >= 0 && currentIndex >= requiredIndex;
    });
}
// Check if bloodline can be awakened
function canAwakenBloodline(bloodlineId, realm, currentQi) {
    const bloodline = data_1.ALL_BLOODLINES.find(b => b.id === bloodlineId);
    if (!bloodline || !bloodline.awakening_requirements)
        return false;
    const realmOrder = Object.keys(data_1.CULTIVATION_REALMS);
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
function getRecommendedCombinations() {
    const recommendations = [];
    // Precompute bloodline themes
    const bloodlineThemes = new Map();
    data_1.ALL_BLOODLINES.forEach(bloodline => {
        const themes = [];
        const nameLower = bloodline.name.toLowerCase();
        Object.keys(THEME_MATCHES).forEach(theme => {
            if (nameLower.includes(theme)) {
                themes.push(theme);
            }
        });
        bloodlineThemes.set(bloodline.id, themes);
    });
    // Precompute physique themes
    const physiqueThemes = new Map();
    data_1.PHYSIQUES.forEach(physique => {
        const themes = [];
        const nameLower = physique.name.toLowerCase();
        Object.keys(THEME_MATCHES).forEach(theme => {
            if (nameLower.includes(theme)) {
                themes.push(theme);
            }
        });
        physiqueThemes.set(physique.id, themes);
    });
    // Find matching themes
    data_1.ALL_BLOODLINES.forEach(bloodline => {
        const bloodlineThemeList = bloodlineThemes.get(bloodline.id) || [];
        if (bloodlineThemeList.length === 0)
            return;
        data_1.PHYSIQUES.forEach(physique => {
            const physiqueThemeList = physiqueThemes.get(physique.id) || [];
            // Find matching themes
            const matchingThemes = bloodlineThemeList.filter(theme => physiqueThemeList.includes(theme));
            if (matchingThemes.length > 0) {
                // Use the highest synergy theme
                const bestTheme = matchingThemes.reduce((best, theme) => {
                    const currentSynergy = THEME_MATCHES[theme].synergy;
                    return currentSynergy > best.synergy ? { theme, synergy: currentSynergy } : best;
                }, { theme: '', synergy: 0 });
                if (bestTheme.theme) {
                    recommendations.push({
                        bloodline: bloodline.id,
                        physique: physique.id,
                        synergy: bestTheme.synergy,
                        description: THEME_MATCHES[bestTheme.theme].description
                    });
                }
            }
        });
    });
    return recommendations.sort((a, b) => b.synergy - a.synergy);
}
