"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAO_TYPES = exports.TRIBULATIONS = exports.BREAKTHROUGH_SUCCESS_RATES = exports.STATE_MODIFIERS = exports.ENVIRONMENT_MODIFIERS = exports.TALENT_CULTIVATION_MULTIPLIERS = exports.BASE_CULTIVATION_RATES = void 0;
exports.calculateCultivationSpeed = calculateCultivationSpeed;
exports.calculateBreakthroughChance = calculateBreakthroughChance;
exports.generateCultivationSession = generateCultivationSession;
exports.generateBreakthroughAttempt = generateBreakthroughAttempt;
exports.getTribulationForLevel = getTribulationForLevel;
exports.calculateDaoComprehensionProgress = calculateDaoComprehensionProgress;
exports.getApplicableModifiers = getApplicableModifiers;
const cultivationRealms_1 = require("./src/data/cultivationRealms");
const bloodlines_fixed_1 = require("./src/data/bloodlines_fixed");
const physiques_1 = require("./src/data/physiques");
// Base cultivation rates per realm (qi per minute)
exports.BASE_CULTIVATION_RATES = {
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
exports.TALENT_CULTIVATION_MULTIPLIERS = {
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
exports.ENVIRONMENT_MODIFIERS = {
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
exports.STATE_MODIFIERS = {
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
exports.BREAKTHROUGH_SUCCESS_RATES = {
    unprepared: 0.1, // 10%
    basic_prep: 0.3, // 30%
    good_prep: 0.5, // 50%
    excellent_prep: 0.7, // 70%
    perfect_prep: 0.9 // 90%
};
// Tribulation data
exports.TRIBULATIONS = {
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
exports.DAO_TYPES = [
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
function calculateCultivationSpeed(realm, talent, modifiers = []) {
    let baseSpeed = exports.BASE_CULTIVATION_RATES[realm] || 1;
    let talentMultiplier = exports.TALENT_CULTIVATION_MULTIPLIERS[talent] || 1.0;
    // Apply all modifiers
    let totalMultiplier = talentMultiplier;
    for (const modifier of modifiers) {
        totalMultiplier *= modifier.multiplier;
    }
    return Math.floor(baseSpeed * totalMultiplier);
}
function calculateBreakthroughChance(realm, preparationLevel, daoComprehension, mentalFortitude) {
    const baseChance = exports.BREAKTHROUGH_SUCCESS_RATES[preparationLevel] || 0.1;
    const daoBonus = daoComprehension * 0.01; // 1% per point of dao comprehension
    const mentalBonus = mentalFortitude * 0.005; // 0.5% per point of mental fortitude
    return Math.min(baseChance + daoBonus + mentalBonus, 0.95); // Max 95% chance
}
function generateCultivationSession(realm, talent, duration, modifiers = []) {
    const speed = calculateCultivationSpeed(realm, talent, modifiers);
    const qiGained = speed * duration;
    // Comprehension and dao insight scale with realm
    const realmIndex = Object.keys(cultivationRealms_1.CULTIVATION_REALMS).indexOf(realm);
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
function generateBreakthroughAttempt(realm, currentStage, targetStage) {
    const realmData = cultivationRealms_1.CULTIVATION_REALMS[realm];
    if (!realmData)
        throw new Error(`Unknown realm: ${realm}`);
    const qiRequired = realmData.qiRequirement * (targetStage / realmData.minorStages);
    const difficulty = (0, cultivationRealms_1.getRealmBreakthroughDifficulty)(realm);
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
function getTribulationForLevel(level) {
    return exports.TRIBULATIONS[Math.min(5, Math.max(1, level))] || exports.TRIBULATIONS[1];
}
function calculateDaoComprehensionProgress(dao, currentLevel, studyTime, insight) {
    const baseProgress = studyTime * 0.1; // 0.1 comprehension per minute
    const insightBonus = insight * 0.01; // 1% bonus per insight point
    return Math.floor(baseProgress * (1 + insightBonus));
}
// Helper function to get all applicable modifiers
function getApplicableModifiers(environment, states, bloodline, physique, manual) {
    const modifiers = [];
    // Environment modifiers
    for (const env of environment) {
        if (exports.ENVIRONMENT_MODIFIERS[env]) {
            modifiers.push(exports.ENVIRONMENT_MODIFIERS[env]);
        }
    }
    // State modifiers
    for (const state of states) {
        if (exports.STATE_MODIFIERS[state]) {
            modifiers.push(exports.STATE_MODIFIERS[state]);
        }
    }
    // Bloodline modifiers
    if (bloodline) {
        const bloodlineData = bloodlines_fixed_1.ALL_BLOODLINES.find(b => b.id === bloodline);
        if (bloodlineData && bloodlineData.effects.stats?.cultivation_speed) {
            const cs = bloodlineData.effects.stats.cultivation_speed;
            let multiplier = 0;
            if (typeof cs === 'number') {
                multiplier = cs;
            }
            else if (typeof cs === 'object' && typeof cs.base === 'number') {
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
        const physiqueData = physiques_1.ALL_PHYSIQUES.find(p => p.id === physique);
        if (physiqueData && physiqueData.effects.cultivation_speed) {
            const cs = physiqueData.effects.cultivation_speed;
            let multiplier = 0;
            if (typeof cs === 'number') {
                multiplier = cs;
            }
            else if (typeof cs === 'object' && typeof cs.base === 'number') {
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
    // TODO: Add manual modifiers when those systems are integrated
    return modifiers;
}
// Export default object for easy importing
exports.default = {
    calculateCultivationSpeed,
    calculateBreakthroughChance,
    generateCultivationSession,
    generateBreakthroughAttempt,
    getTribulationForLevel,
    calculateDaoComprehensionProgress,
    getApplicableModifiers,
    BASE_CULTIVATION_RATES: exports.BASE_CULTIVATION_RATES,
    TALENT_CULTIVATION_MULTIPLIERS: exports.TALENT_CULTIVATION_MULTIPLIERS,
    ENVIRONMENT_MODIFIERS: exports.ENVIRONMENT_MODIFIERS,
    STATE_MODIFIERS: exports.STATE_MODIFIERS,
    BREAKTHROUGH_SUCCESS_RATES: exports.BREAKTHROUGH_SUCCESS_RATES,
    TRIBULATIONS: exports.TRIBULATIONS,
    DAO_TYPES: exports.DAO_TYPES
};
