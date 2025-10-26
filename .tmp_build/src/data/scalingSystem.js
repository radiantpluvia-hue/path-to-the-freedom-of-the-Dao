"use strict";
// Scaling system for bloodlines, physiques, and manuals based on cultivation realm
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAT_SCALING = exports.MAJOR_TIER_MULTIPLIERS = exports.MAJOR_REALM_TIERS = void 0;
exports.getMajorTier = getMajorTier;
exports.getRealmMultiplier = getRealmMultiplier;
exports.scaleBloodlineStats = scaleBloodlineStats;
exports.scalePhysiqueStats = scalePhysiqueStats;
exports.scaleCultivationSpeed = scaleCultivationSpeed;
exports.scaleManualEffects = scaleManualEffects;
exports.scaleTeachingReward = scaleTeachingReward;
exports.getRarityMultiplier = getRarityMultiplier;
exports.applyFinalStatScaling = applyFinalStatScaling;
// Major realm tiers for scaling
exports.MAJOR_REALM_TIERS = {
    MORTAL: ['mortal', 'qi_refinement', 'foundation_establishment', 'body_integration', 'mahayana'],
    GOLDEN_IMMORTAL: ['golden_immortal', 'taiyi_golden_immortal', 'daluo_golden_immortal'],
    SOUL_TRANSFORMATION: ['soul_transformation', 'void_refinement', 'saint', 'primordial_saint', 'dao', 'eternal_dao_sovereign', 'infinite_dao_master'],
    CORE_FORMATION: ['core_formation', 'nascent_soul', 'true_immortal', 'quasi_saint', 'dao_ancestor', 'dimension_lord'],
    CHAOS_SAINT: ['chaos_saint', 'supreme_dao_origin', 'void_transcendent'],
    ABSOLUTE: ['reality_weaver', 'multiverse_sovereign', 'omniversal_emperor', 'absolute_existence']
};
exports.MAJOR_TIER_MULTIPLIERS = {
    // Keep mortals as baseline
    MORTAL: 1.0,
    // Golden core beings become vastly stronger (order of millions)
    GOLDEN_IMMORTAL: 1e6,
    // Soul transformation realm: astronomical multiplier (order of trillions)
    SOUL_TRANSFORMATION: 1e12,
    // Core formation and above: exponential universe-level multipliers
    CORE_FORMATION: 1e18,
    CHAOS_SAINT: 1e24,
    ABSOLUTE: 1e30
};
// Get the major tier for a given realm
function getMajorTier(realm) {
    for (const [tier, realms] of Object.entries(exports.MAJOR_REALM_TIERS)) {
        if (realms.includes(realm)) {
            return tier;
        }
    }
    return 'MORTAL';
}
// Get scaling multiplier for a realm
function getRealmMultiplier(realm) {
    const majorTier = getMajorTier(realm);
    const baseMultiplier = exports.MAJOR_TIER_MULTIPLIERS[majorTier] || 1.0;
    // Additional scaling based on minor stage progression within the major tier
    const tierRealms = exports.MAJOR_REALM_TIERS[majorTier];
    const realmIndex = tierRealms.indexOf(realm);
    const stageProgress = tierRealms.length > 1 ? (realmIndex / (tierRealms.length - 1)) : 0; // 0 to 1
    return baseMultiplier * (1 + stageProgress * 0.5); // Additional 50% scaling within tier
}
// Scale bloodline stats based on realm
function scaleBloodlineStats(baseStats, realm) {
    const multiplier = getRealmMultiplier(realm);
    const scaledStats = {};
    for (const [stat, value] of Object.entries(baseStats)) {
        scaledStats[stat] = Math.round(value * multiplier);
    }
    return scaledStats;
}
// Scale physique stats based on realm
function scalePhysiqueStats(baseStats, realm) {
    const multiplier = getRealmMultiplier(realm);
    const scaledStats = {};
    for (const [stat, value] of Object.entries(baseStats)) {
        scaledStats[stat] = Math.round(value * multiplier);
    }
    return scaledStats;
}
// Scale physique cultivation speed based on realm
function scaleCultivationSpeed(baseSpeed, realm) {
    const multiplier = getRealmMultiplier(realm);
    return baseSpeed * multiplier;
}
// Scale manual effects based on realm
function scaleManualEffects(baseEffects, realm) {
    const multiplier = getRealmMultiplier(realm);
    const scaledEffects = { ...baseEffects };
    // Scale numeric effects
    const numericEffects = ['cultivationSpeed', 'qi', 'hp', 'atk', 'def', 'speed', 'insight', 'daoHeart', 'qiCapacity'];
    for (const effect of numericEffects) {
        if (typeof scaledEffects[effect] === 'number') {
            scaledEffects[effect] = scaledEffects[effect] * multiplier;
        }
    }
    // Scale skill bonuses
    const skillEffects = ['combatSkills', 'qiControl', 'bodyTempering', 'daoInsight', 'mentalFortitude',
        'spiritBeastTaming', 'alchemy', 'elementalMastery'];
    for (const skill of skillEffects) {
        if (typeof scaledEffects[skill] === 'number') {
            scaledEffects[skill] = Math.round(scaledEffects[skill] * multiplier);
        }
    }
    return scaledEffects;
}
// Scale mentor teaching reward based on realm (conservative: scale only additive numeric values > 1)
function scaleTeachingReward(reward, realm) {
    const multiplier = getRealmMultiplier(realm);
    const deepScale = (obj) => {
        if (Array.isArray(obj))
            return obj.map(deepScale);
        if (obj && typeof obj === 'object') {
            const out = {};
            for (const [k, v] of Object.entries(obj)) {
                if (typeof v === 'number') {
                    out[k] = v > 1 ? Math.round(v * multiplier) : v; // skip coefficients <= 1
                }
                else {
                    out[k] = deepScale(v);
                }
            }
            return out;
        }
        return obj;
    };
    return deepScale(reward);
}
// Get rarity multiplier for scaling base stats
function getRarityMultiplier(rarity) {
    const multipliers = {
        "H": 1.0,
        "G": 1.3,
        "F": 1.6,
        "E": 2.0,
        "D": 3.0,
        'mythical': 4.5,
        "B": 6.0
    };
    return multipliers[rarity] || 1.0;
}
exports.STAT_SCALING = {
    // Core combat
    atk: { mode: 'none' }, // already scaled upstream
    def: { mode: 'none' }, // already scaled upstream
    hp: { mode: 'none' }, // already scaled upstream
    qi: { mode: 'none' }, // already scaled upstream
    speed: { mode: 'none' }, // already scaled upstream
    // Progression/quality stats (soft scale if present in base)
    cultivationSpeed: { mode: 'none' }, // already scaled upstream
    daoHeart: { mode: 'realm_soft', factor: 0.25 },
    insight: { mode: 'realm_soft', factor: 0.25 },
};
function applyFinalStatScaling(stats, realm, alreadyScaledKeys = new Set(['atk', 'def', 'hp', 'qi', 'speed', 'cultivationSpeed'])) {
    const mult = getRealmMultiplier(realm);
    const out = { ...stats };
    for (const [k, v] of Object.entries(out)) {
        if (typeof v !== 'number' || v <= 0)
            continue;
        if (alreadyScaledKeys.has(k))
            continue; // avoid double-scaling
        const rule = exports.STAT_SCALING[k] || { mode: 'none' };
        if (rule.mode === 'realm') {
            const scaled = Math.round(v * Math.pow(mult, rule.factor ?? 1));
            out[k] = rule.cap ? Math.min(scaled, rule.cap) : scaled;
        }
        else if (rule.mode === 'realm_soft') {
            const soft = 1 + (mult - 1) * (rule.factor ?? 0.5);
            const scaled = Math.round(v * soft);
            out[k] = rule.cap ? Math.min(scaled, rule.cap) : scaled;
        }
    }
    return out;
}
