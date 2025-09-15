"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateIntegratedStats = calculateIntegratedStats;
exports.getRecommendedCombinations = getRecommendedCombinations;
exports.canAwakenBloodline = canAwakenBloodline;
const bloodlines_fixed_1 = require("../data/bloodlines_fixed");
const physiques_1 = require("../data/physiques");
const registry_1 = require("../data/registry");
const scalingSystem_1 = require("../data/scalingSystem");
// Types kept simple to satisfy tests
function calculateIntegratedStats(bloodlineId, physiqueId, manualIds, realm) {
    const b = bloodlines_fixed_1.ALL_BLOODLINES.find(x => x.id === bloodlineId);
    const p = physiques_1.ALL_PHYSIQUES.find(x => x.id === physiqueId);
    const ALL_MANUALS = (0, registry_1.getManuals)();
    const manuals = manualIds
        .map(id => ALL_MANUALS.find(m => m.id === id))
        .filter((m) => Boolean(m));
    const baseStats = { qi: 100, atk: 10, def: 10, hp: 100, speed: 10 };
    if (b?.effects.stats) {
        // Convert StatEffect -> number (use base if provided)
        const bloodlineBase = {};
        Object.entries(b.effects.stats || {}).forEach(([k, v]) => {
            bloodlineBase[k] = typeof v === 'object' && v.base !== undefined ? v.base : v;
        });
        const bs = (0, scalingSystem_1.scaleBloodlineStats)(bloodlineBase, realm);
        Object.entries(bs).forEach(([k, v]) => baseStats[k] = (baseStats[k] || 0) + v);
    }
    if (p?.effects.stats) {
        // Extract numeric base stats from StatEffect objects
        const physiqueBase = {};
        Object.entries(p.effects.stats || {}).forEach(([k, v]) => {
            physiqueBase[k] = typeof v === 'object' && v.base !== undefined ? v.base : v;
        });
        const ps = (0, scalingSystem_1.scalePhysiqueStats)(physiqueBase, realm);
        Object.entries(ps).forEach(([k, v]) => baseStats[k] = (baseStats[k] || 0) + v);
    }
    let cultivationSpeed = 1.0;
    const physiqueSpeed = typeof p?.effects.cultivation_speed === 'number' ? p.effects.cultivation_speed : 0;
    cultivationSpeed += (0, scalingSystem_1.scaleCultivationSpeed)(physiqueSpeed, realm);
    // Manual effects (only numeric additive fields common in tests)
    // Normalize manual effect keys and apply numeric additive effects. Supports both snake_case and camelCase keys.
    // Improved normalization: accept snake_case, camelCase, and some common aliases.
    const normalizeManualEffects = (m) => {
        const e = (m.effects || {});
        const out = {};
        const toCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        // Alias map: map common manual effect keys to canonical keys used in characterAdvancement
        const aliasMap = {
            qi: ['qi', 'qiGathering', 'qi_gathering'],
            atk: ['atk', 'attack'],
            def: ['def', 'defense'],
            hp: ['hp', 'health', 'hp_max'],
            cultivationSpeed: ['cultivationSpeed', 'cultivation_speed', 'cultivationRate'],
            daoHeart: ['daoHeart', 'dao_heart'],
            insight: ['insight'],
            speed: ['speed', 'speedPct', 'speed_pct']
        };
        // Normalize numeric entries directly present
        Object.entries(e).forEach(([k, v]) => {
            const ck = toCamel(k);
            if (typeof v === 'number')
                out[ck] = v;
        });
        // Also consider aliases (if an alias exists and not already set)
        Object.entries(aliasMap).forEach(([canon, aliases]) => {
            if (out[canon])
                return; // already set by direct mapping
            for (const a of aliases) {
                const aCamel = toCamel(a);
                if (typeof e[a] === 'number') {
                    out[canon] = e[a];
                    break;
                }
                if (typeof e[aCamel] === 'number') {
                    out[canon] = e[aCamel];
                    break;
                }
            }
        });
        return out;
    };
    manuals.forEach(m => {
        const effects = normalizeManualEffects(m);
        ['atk', 'def', 'hp', 'qi', 'cultivationSpeed', 'daoHeart', 'insight', 'speed'].forEach(key => {
            const v = effects[key];
            if (typeof v === 'number') {
                if (key === 'cultivationSpeed') {
                    // cultivationSpeed stacks additively into the cultivationSpeed accumulator
                    cultivationSpeed += v * (0, scalingSystem_1.getRealmMultiplier)(realm);
                }
                else {
                    baseStats[key] = (baseStats[key] || 0) + v * (0, scalingSystem_1.getRealmMultiplier)(realm);
                }
            }
        });
        // If manuals influence cultivation speed via a different key (e.g., cultivation_speed), it's now normalized above.
    });
    // Apply a final centralized scaling pass to remaining stats that were not already scaled upstream.
    const finalStats = (0, scalingSystem_1.applyFinalStatScaling)(baseStats, realm);
    const specialAbilities = [
        ...(b?.effects.special || []),
        ...(p?.effects.special || []),
        ...manuals.flatMap(m => m.effects?.special || [])
    ];
    return {
        baseStats: finalStats,
        cultivationSpeed,
        specialAbilities,
    };
}
function getRecommendedCombinations() {
    // Simple recommendation: pick first items with non-empty specials
    const bloodline = bloodlines_fixed_1.ALL_BLOODLINES.find((b) => (b.effects.special || []).length > 0) || bloodlines_fixed_1.ALL_BLOODLINES[0];
    const physique = physiques_1.ALL_PHYSIQUES.find(p => (p.effects.special || []).length > 0) || physiques_1.ALL_PHYSIQUES[0];
    const manual = (0, registry_1.getManuals)()[0];
    return [{
            bloodlineId: bloodline.id,
            physiqueId: physique.id,
            manualIds: [manual.id],
            synergy: 1,
            description: `Synergy of ${bloodline.name}, ${physique.name}, and ${manual.name}`
        }];
}
function canAwakenBloodline(bloodlineId, realm, qi) {
    const b = bloodlines_fixed_1.ALL_BLOODLINES.find((x) => x.id === bloodlineId);
    if (!b)
        return false;
    const req = b.awakening_requirements || {};
    const realmOk = !req.realm || req.realm === realm;
    const qiOk = !req.qi || qi >= req.qi;
    return !!(realmOk && qiOk);
}
