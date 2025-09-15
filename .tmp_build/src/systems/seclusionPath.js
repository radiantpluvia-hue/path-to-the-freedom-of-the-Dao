"use strict";
// Seclusion/Solo Path system (renamed from HermitPath)
// Provides a tick-based seclusion progression model: passive meditation ticks, actions for study/refine/forage,
// comprehension events, tribulation triggers, and rewards.
Object.defineProperty(exports, "__esModule", { value: true });
exports.HermitPath = exports.HERMIt_CONFIG = exports.DEFAULT_HERMIT_STATE = exports.SeclusionPath = exports.SECLUSION_CONFIG = exports.DEFAULT_SECLUSION_STATE = void 0;
const seededRng_1 = require("../utils/seededRng");
exports.DEFAULT_SECLUSION_STATE = {
    mode: 'idle',
    secludedYears: 0,
    ticksSinceSeclusionStart: 0,
    accumulatedComprehension: 0,
    rareSourceFindChanceAcc: 0,
    safeMode: false
};
// Options that affect tuning
exports.SECLUSION_CONFIG = {
    tickQiGainBase: 5, // base Qi gained per seclusion tick when meditating/stationary
    tickComprehensionBase: 1, // base comprehension per tick
    // Conservative default probabilities; use playtestMultiplier to increase during testing
    rareSourceBaseChance: 0.005, // base per-tick chance to find a rare manual/resource
    rareSourceDiminishFactor: 0.85, // when self-studying, diminishing returns multiplier for rare find accumulator
    tribulationBaseChance: 0.005, // per-tick chance to trigger a tribulation while secluded
    // multiplier for playtest runs: multiply any chance values by this to increase event frequency
    playtestMultiplier: 1
};
class SeclusionPath {
    constructor(initial) {
        this.state = { ...exports.DEFAULT_SECLUSION_STATE, ...(initial || {}) };
    }
    getState() {
        return { ...this.state };
    }
    enterSeclusion(years = 1, safeMode = false) {
        this.state.mode = 'secluded';
        this.state.secludedYears = Math.max(1, Math.floor(years));
        this.state.safeMode = !!safeMode;
        this.state.ticksSinceSeclusionStart = 0;
    }
    exitSeclusion() {
        this.state.mode = 'idle';
        this.state.secludedYears = 0;
        this.state.ticksSinceSeclusionStart = 0;
    }
    // Perform one seclusion tick. Returns an object with effects to apply to the main game state.
    tick(gameState) {
        const effects = { qiGain: 0, cpGain: 0, foundItems: [], events: [] };
        // If not secluded, nothing seclusion-specific happens
        if (this.state.mode !== 'secluded')
            return effects;
        // Advance internal tick counter
        this.state.ticksSinceSeclusionStart++;
        // Passive Qi and comprehension gains
        const qiGain = Math.max(0, Math.floor(exports.SECLUSION_CONFIG.tickQiGainBase + (gameState.player.skills.meditation.level || 0) * 0.2));
        const comprehension = Math.max(0, Math.floor(exports.SECLUSION_CONFIG.tickComprehensionBase + (gameState.player.skills.comprehension.level || 0) * 0.1));
        effects.qiGain = qiGain;
        effects.cpGain = Math.max(1, Math.floor((1 + (gameState.player.skills.comprehension.level || 0) * 0.05)));
        // Accumulate comprehension towards rare epiphany
        this.state.accumulatedComprehension += comprehension;
        // Self-study diminishing returns: increase chance accumulator but decay slightly
        this.state.rareSourceFindChanceAcc = this.state.rareSourceFindChanceAcc * exports.SECLUSION_CONFIG.rareSourceDiminishFactor + exports.SECLUSION_CONFIG.rareSourceBaseChance;
        // Chance to find a rare source/manual
        // Use the imported runtimeRng (tests override the global RNG via setRuntimeRng)
        const rareRoll = (0, seededRng_1.runtimeRng)();
        const rareThresholdBase = Math.min(0.2, this.state.rareSourceFindChanceAcc);
        const rareThreshold = Math.min(1, rareThresholdBase * (exports.SECLUSION_CONFIG.playtestMultiplier || 1));
        if (rareRoll < rareThreshold) {
            // Found a rare manual/resource (use legacy event id for compatibility)
            effects.events.push({ id: 'hermit_found_rare_source', type: 'rare_source_found' });
            // reduce accumulator to make subsequent finds rarer
            this.state.rareSourceFindChanceAcc *= 0.25;
        }
        // Tribulation chance: slightly lower if safeMode
        const baseTrib = this.state.safeMode ? exports.SECLUSION_CONFIG.tribulationBaseChance * 0.25 : exports.SECLUSION_CONFIG.tribulationBaseChance;
        const tribChance = Math.min(1, baseTrib * (exports.SECLUSION_CONFIG.playtestMultiplier || 1));
        if ((0, seededRng_1.runtimeRng)() < tribChance) {
            // legacy event id for compatibility
            effects.events.push({ id: 'hermit_tribulation', type: 'tribulation' });
        }
        // Periodic epiphany check based on accumulated comprehension
        if (this.state.accumulatedComprehension > 100 + (gameState.player.daoComprehension || 0) * 2 && (0, seededRng_1.runtimeRng)() < 0.1) {
            // keep legacy id
            effects.events.push({ id: 'hermit_epiphany', type: 'comprehension_breakthrough', magnitude: Math.max(1, Math.floor(this.state.accumulatedComprehension / 100)) });
            // consume some comprehension
            this.state.accumulatedComprehension = Math.floor(this.state.accumulatedComprehension * 0.4);
        }
        return effects;
    }
    // Quick helper to perform a study action with diminishing returns to XP and rare find chance
    performStudy(gameState, intensity = 1) {
        const baseExp = Math.max(1, Math.floor(10 * intensity));
        // Apply diminishing returns if many studies in a row
        const decay = Math.pow(exports.SECLUSION_CONFIG.rareSourceDiminishFactor, Math.min(10, Math.floor(this.state.ticksSinceSeclusionStart / 4)));
        const xp = Math.max(1, Math.floor(baseExp * decay));
        // Slight bump to rare-chance accumulator
        this.state.rareSourceFindChanceAcc += 0.01 * intensity;
        // Return xp to apply
        return { xpGained: xp };
    }
}
exports.SeclusionPath = SeclusionPath;
// Backwards compatibility: export aliases with old names
exports.DEFAULT_HERMIT_STATE = exports.DEFAULT_SECLUSION_STATE;
exports.HERMIt_CONFIG = exports.SECLUSION_CONFIG;
exports.HermitPath = SeclusionPath;
