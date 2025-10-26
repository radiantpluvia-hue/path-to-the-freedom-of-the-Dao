"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEATHER_MULTIPLIERS = exports.TERRAIN_MULTIPLIERS = exports.STAT_SCALING = exports.getRarityMultiplier = exports.applyFinalStatScaling = exports.scaleManualEffects = exports.getRealmMultiplier = exports.adjustDamageForRealmGap = exports.defaultCombatant = exports.applyCombatBuffs = exports.resolveRound = exports.calculateDamage = void 0;
exports.computeCombatPower = computeCombatPower;
exports.computeOffensiveProwess = computeOffensiveProwess;
// Central combat scaling wrapper — Phase-1 conservative wrapper around existing scalingSystem
const scaling = __importStar(require("../data/scalingSystem"));
const playtestScaling_1 = require("../utils/playtestScaling");
// Re-export some combat core helpers for backwards compatibility with legacy import sites
const combatCore_1 = require("../components/minigames/combatCore");
Object.defineProperty(exports, "calculateDamage", { enumerable: true, get: function () { return combatCore_1.calculateDamage; } });
Object.defineProperty(exports, "resolveRound", { enumerable: true, get: function () { return combatCore_1.resolveRound; } });
Object.defineProperty(exports, "applyCombatBuffs", { enumerable: true, get: function () { return combatCore_1.applyCombatBuffs; } });
Object.defineProperty(exports, "defaultCombatant", { enumerable: true, get: function () { return combatCore_1.defaultCombatant; } });
// re-export adjustDamageForRealmGap from cultivationUtils for backwards compatibility
var cultivationUtils_1 = require("./cultivationUtils");
Object.defineProperty(exports, "adjustDamageForRealmGap", { enumerable: true, get: function () { return cultivationUtils_1.adjustDamageForRealmGap; } });
exports.getRealmMultiplier = scaling.getRealmMultiplier;
exports.scaleManualEffects = scaling.scaleManualEffects;
exports.applyFinalStatScaling = scaling.applyFinalStatScaling;
exports.getRarityMultiplier = scaling.getRarityMultiplier;
exports.STAT_SCALING = scaling.STAT_SCALING;
// computeCombatPower: small, stable wrapper used by various systems that need a single-number
// combat power metric. This intentionally mirrors the lightweight calculation used around the
// codebase: a weighted sum of stats with optional playtest overrides.
function computeCombatPower(entity, opts = {}) {
    const e = entity || {};
    // base: hp, atk, def, qi, speed — fallbacks to 0 to be safe
    const hp = (e.stats && e.stats.hp) || e.hp || 0;
    const atk = (e.stats && e.stats.atk) || e.atk || 0;
    const def = (e.stats && e.stats.def) || e.def || 0;
    const qi = (e.stats && e.stats.qi) || e.qi || 0;
    const speed = (e.stats && e.stats.speed) || e.speed || 0;
    const daoHeart = (e.daoHeart) || (e.stats && e.stats.daoHeart) || 0;
    // Default weights chosen to be compatible with existing heuristics in the repo
    const weights = {
        hp: 0.2,
        atk: 0.4,
        def: 0.25,
        qi: 0.05,
        speed: 0.05,
        daoHeart: 0.001,
    };
    let base = hp * weights.hp + atk * weights.atk + def * weights.def + qi * weights.qi + speed * weights.speed + daoHeart * weights.daoHeart;
    // legacy fields sometimes include combatPower; prefer explicit computed value but allow manual override
    if (typeof e.combatPower === 'number' && e._preferEntityCombatPower) {
        base = e.combatPower;
    }
    // playtest hook: if playtest mode sets a global combat power multiplier, apply it here.
    try {
        if (playtestScaling_1.PlaytestScaling && typeof playtestScaling_1.PlaytestScaling.isEnabled === 'function' && playtestScaling_1.PlaytestScaling.isEnabled()) {
            if (typeof playtestScaling_1.PlaytestScaling.getCombatPowerMultiplier === 'function') {
                const m = playtestScaling_1.PlaytestScaling.getCombatPowerMultiplier();
                if (isFinite(m) && m > 0)
                    base = base * m;
            }
        }
    }
    catch (err) {
        // Defensive: don't let playtest helper errors break runtime behavior
        // (e.g., when running in environments that stub or partially load the helper)
    }
    // optionally include karma/fame lightly
    if (opts.includeKarma && typeof e.karma === 'number') {
        base += e.karma * 0.1;
    }
    // ensure non-negative and round
    const computed = Math.max(0, Math.round(base));
    return computed;
}
// Small helper: an offensive 'prowess' heuristic used in combat tie-breakers and realm-gap
// adjustments. Mirrors the previous local heuristics: atk + 0.5 * speed.
function computeOffensiveProwess(entity) {
    const atk = (entity && entity.stats && entity.stats.atk) || entity.atk || 0;
    const speed = (entity && entity.stats && entity.stats.speed) || entity.speed || 0;
    return atk + (speed * 0.5);
}
exports.default = {
    getRealmMultiplier: exports.getRealmMultiplier,
    scaleManualEffects: exports.scaleManualEffects,
    applyFinalStatScaling: exports.applyFinalStatScaling,
    getRarityMultiplier: exports.getRarityMultiplier,
    computeCombatPower,
    computeOffensiveProwess,
    STAT_SCALING: exports.STAT_SCALING,
};
exports.TERRAIN_MULTIPLIERS = {
    mountain: { atk: 1.05, def: 1.05, dmg: 1.0 },
    forest: { atk: 0.95, def: 1.05, dmg: 1.0 },
    desert: { atk: 1.1, def: 1.0, dmg: 1.0 },
    city: { atk: 1.0, def: 1.0, dmg: 1.0 },
    sect_grounds: { atk: 1.0, def: 1.1, dmg: 1.0 },
};
exports.WEATHER_MULTIPLIERS = {
    clear: { atk: 1.0, def: 1.0, dmg: 1.0 },
    rain: { atk: 1.0, def: 1.0, dmg: 0.95 },
    storm: { atk: 1.0, def: 1.0, dmg: 1.1 },
    fog: { atk: 0.9, def: 1.0, dmg: 1.0 },
};
