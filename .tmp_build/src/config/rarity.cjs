"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENHANCED_PASSIVE_LEVELS = exports.RARITY_WEIGHTS = exports.RARITY_CONFIG = void 0;
exports.getEnhancedPassiveLevelsFor = getEnhancedPassiveLevelsFor;
// Base weights for rarity-based sampling and distribution
exports.RARITY_CONFIG = {
    common: {
        weight: 60,
        passiveSlots: 0,
        passiveQuality: 'low',
        statBonus: 1.0,
        abilityChance: 0.1,
        description: 'Basic upbringing with modest advantages',
    },
    uncommon: {
        weight: 25,
        passiveSlots: 1,
        passiveQuality: 'medium',
        statBonus: 1.2,
        abilityChance: 0.3,
        description: 'Notable heritage with useful talents',
    },
    rare: {
        weight: 15,
        passiveSlots: 2,
        passiveQuality: 'high',
        statBonus: 1.5,
        abilityChance: 0.6,
        description: 'Exceptional lineage with powerful innate abilities',
    },
    epic: {
        weight: 8,
        passiveSlots: 2,
        passiveQuality: 'high',
        statBonus: 1.8,
        abilityChance: 0.75,
        description: 'Extremely rare heritage with potent talents',
    },
    legendary: {
        weight: 5,
        passiveSlots: 3,
        passiveQuality: "E",
        statBonus: 2.0,
        abilityChance: 0.9,
        description: 'Mythical bloodline with world-shaping potential',
    },
    mythical: {
        weight: 2,
        passiveSlots: 4,
        passiveQuality: "E",
        statBonus: 2.5,
        abilityChance: 0.95,
        description: 'Near-mythic heritage beyond common reckoning',
    },
    transcendent: {
        weight: 1,
        passiveSlots: 5,
        passiveQuality: "E",
        statBonus: 3.0,
        abilityChance: 0.99,
        description: 'Transcendent lineage that defies ordinary balance',
    },
};
exports.RARITY_WEIGHTS = {
    common: exports.RARITY_CONFIG.common.weight,
    uncommon: exports.RARITY_CONFIG.uncommon.weight,
    rare: exports.RARITY_CONFIG.rare.weight,
    epic: exports.RARITY_CONFIG.epic.weight,
    legendary: exports.RARITY_CONFIG.legendary.weight,
    mythical: exports.RARITY_CONFIG.mythical.weight,
    transcendent: exports.RARITY_CONFIG.transcendent.weight,
};
// Add runtime aliases so code that still indexes by letter codes ('H','G','F','D')
// will find the corresponding legacy-word entries.
exports.RARITY_CONFIG['H'] = exports.RARITY_CONFIG.common;
exports.RARITY_CONFIG['G'] = exports.RARITY_CONFIG.uncommon;
exports.RARITY_CONFIG['F'] = exports.RARITY_CONFIG.rare;
exports.RARITY_CONFIG['D'] = exports.RARITY_CONFIG.legendary;
exports.RARITY_CONFIG['E'] = exports.RARITY_CONFIG.epic;
exports.RARITY_CONFIG['B'] = exports.RARITY_CONFIG.transcendent;
// Note: do not add enumerable aliases to RARITY_WEIGHTS; tests expect only
// the legacy-word keys to be present when enumerating weights.
// Levels to upgrade known passives for rarer backgrounds (kept conservative: level-only)
const BASE_ENHANCED_PASSIVE_LEVELS = {
    common: {},
    uncommon: {},
    rare: {
        demonic_resolve: 2,
        chelonian_guardian: 2,
    },
    epic: {},
    legendary: {
        noble_upbringing: 2,
        draconic_resilience: 3,
        draconic_vigor: 2,
        phoenix_regen: 2,
        phoenix_flame_affinity: 2,
        heavenly_benefaction: 2,
        chelonian_longevity: 3,
    },
    mythical: {},
    transcendent: {},
};
// Provide a runtime-accessible map that can be indexed by either legacy-word keys
// or by letter codes. Keep BASE_ENHANCED_PASSIVE_LEVELS typed by legacy words.
exports.ENHANCED_PASSIVE_LEVELS = {
    common: BASE_ENHANCED_PASSIVE_LEVELS.common,
    uncommon: BASE_ENHANCED_PASSIVE_LEVELS.uncommon,
    rare: BASE_ENHANCED_PASSIVE_LEVELS.rare,
    epic: BASE_ENHANCED_PASSIVE_LEVELS.epic,
    legendary: BASE_ENHANCED_PASSIVE_LEVELS.legendary,
    mythical: BASE_ENHANCED_PASSIVE_LEVELS.mythical,
    transcendent: BASE_ENHANCED_PASSIVE_LEVELS.transcendent,
};
// runtime aliasing for letter codes (D -> legendary, F -> rare, G -> uncommon, H -> common)
exports.ENHANCED_PASSIVE_LEVELS['D'] = exports.ENHANCED_PASSIVE_LEVELS.legendary;
exports.ENHANCED_PASSIVE_LEVELS['F'] = exports.ENHANCED_PASSIVE_LEVELS.rare;
exports.ENHANCED_PASSIVE_LEVELS['G'] = exports.ENHANCED_PASSIVE_LEVELS.uncommon;
exports.ENHANCED_PASSIVE_LEVELS['H'] = exports.ENHANCED_PASSIVE_LEVELS.common;
// Helper: normalize a rarity (letter code or legacy word) and return the
// corresponding enhanced passive levels record. Always returns a record
// (possibly empty) to simplify callers.
function getEnhancedPassiveLevelsFor(rarity) {
    if (!rarity)
        return {};
    const key = String(rarity).trim();
    // direct hit
    if (exports.ENHANCED_PASSIVE_LEVELS[key])
        return exports.ENHANCED_PASSIVE_LEVELS[key];
    // try uppercase letter code
    const up = key.toUpperCase();
    if (exports.ENHANCED_PASSIVE_LEVELS[up])
        return exports.ENHANCED_PASSIVE_LEVELS[up];
    // try lowercase word
    const lw = key.toLowerCase();
    if (exports.ENHANCED_PASSIVE_LEVELS[lw])
        return exports.ENHANCED_PASSIVE_LEVELS[lw];
    // fallback: map some common legacy words
    switch (lw) {
        case 'common': return exports.ENHANCED_PASSIVE_LEVELS.common;
        case 'uncommon': return exports.ENHANCED_PASSIVE_LEVELS.uncommon;
        case 'rare': return exports.ENHANCED_PASSIVE_LEVELS.rare;
        case 'legendary': return exports.ENHANCED_PASSIVE_LEVELS.legendary;
        default: return {};
    }
}
