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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HermitPath = exports.HERMIt_CONFIG = exports.DEFAULT_HERMIT_STATE = exports.default = void 0;
// Thin shim for backwards compatibility.
// The canonical implementation has moved to `seclusionPath.ts`.
__exportStar(require("./seclusionPath"), exports);
// Provide a default export (historically some code may have used default imports)
var seclusionPath_1 = require("./seclusionPath");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return seclusionPath_1.SeclusionPath; } });
// Hermit/Solo Path system
// Provides a tick-based hermit progression model: passive meditation ticks, actions for study/refine/forage,
// comprehension events, tribulation triggers, and rewards.
const seededRng_1 = require("../utils/seededRng");
exports.DEFAULT_HERMIT_STATE = {
    mode: 'idle',
    secludedYears: 0,
    ticksSinceSeclusionStart: 0,
    accumulatedComprehension: 0,
    rareSourceFindChanceAcc: 0,
    safeMode: false
};
// Options that affect tuning
exports.HERMIt_CONFIG = {
    tickQiGainBase: 5, // base Qi gained per hermit tick when meditating/stationary
    tickComprehensionBase: 1, // base comprehension per tick
    rareSourceBaseChance: 0.02, // base per-tick chance to find a rare manual/resource (raised for reliable test outcomes)
    rareSourceDiminishFactor: 0.85, // when self-studying, diminishing returns multiplier for rare find accumulator
    tribulationBaseChance: 0.01, // per-tick chance to trigger a tribulation while secluded
};
class HermitPath {
    constructor(initial) {
        this.state = { ...exports.DEFAULT_HERMIT_STATE, ...(initial || {}) };
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
    // Perform one hermit tick. Returns an object with effects to apply to the main game state.
    tick(gameState) {
        const effects = { qiGain: 0, cpGain: 0, foundItems: [], events: [] };
        // If not secluded, nothing hermit-specific happens
        if (this.state.mode !== 'secluded')
            return effects;
        // Advance internal tick counter
        this.state.ticksSinceSeclusionStart++;
        // Passive Qi and comprehension gains
        const qiGain = Math.max(0, Math.floor(exports.HERMIt_CONFIG.tickQiGainBase + (gameState.player.skills.meditation.level || 0) * 0.2));
        const comprehension = Math.max(0, Math.floor(exports.HERMIt_CONFIG.tickComprehensionBase + (gameState.player.skills.comprehension.level || 0) * 0.1));
        effects.qiGain = qiGain;
        effects.cpGain = Math.max(1, Math.floor((1 + (gameState.player.skills.comprehension.level || 0) * 0.05)));
        // Accumulate comprehension towards rare epiphany
        this.state.accumulatedComprehension += comprehension;
        // Self-study diminishing returns: increase chance accumulator but decay slightly
        this.state.rareSourceFindChanceAcc = this.state.rareSourceFindChanceAcc * exports.HERMIt_CONFIG.rareSourceDiminishFactor + exports.HERMIt_CONFIG.rareSourceBaseChance;
        // Chance to find a rare source/manual
        // Use the imported runtimeRng (tests override the global RNG via setRuntimeRng)
        const rareRoll = (0, seededRng_1.runtimeRng)();
        const rareThreshold = Math.min(0.2, this.state.rareSourceFindChanceAcc);
        if (rareRoll < rareThreshold) {
            // Found a rare manual/resource
            effects.events.push({ id: 'hermit_found_rare_source', type: 'rare_source_found' });
            // reduce accumulator to make subsequent finds rarer
            this.state.rareSourceFindChanceAcc *= 0.25;
        }
        // Tribulation chance: slightly lower if safeMode
        const tribChance = this.state.safeMode ? exports.HERMIt_CONFIG.tribulationBaseChance * 0.25 : exports.HERMIt_CONFIG.tribulationBaseChance;
        if ((0, seededRng_1.runtimeRng)() < tribChance) {
            effects.events.push({ id: 'hermit_tribulation', type: 'tribulation' });
        }
        // Periodic epiphany check based on accumulated comprehension
        if (this.state.accumulatedComprehension > 100 + (gameState.player.daoComprehension || 0) * 2 && (0, seededRng_1.runtimeRng)() < 0.1) {
            effects.events.push({ id: 'hermit_epiphany', type: 'comprehension_breakthrough', magnitude: Math.max(1, Math.floor(this.state.accumulatedComprehension / 100)) });
            // consume some comprehension
            this.state.accumulatedComprehension = Math.floor(this.state.accumulatedComprehension * 0.4);
        }
        // Time progression: when ticks equal years -> exit (store-level will advance world year too)
        // We keep hermit internal tick as abstract count; caller can interpret it as days/years as desired.
        return effects;
    }
    // Quick helper to perform a study action with diminishing returns to XP and rare find chance
    performStudy(gameState, intensity = 1) {
        const baseExp = Math.max(1, Math.floor(10 * intensity));
        // Apply diminishing returns if many studies in a row
        const decay = Math.pow(exports.HERMIt_CONFIG.rareSourceDiminishFactor, Math.min(10, Math.floor(this.state.ticksSinceSeclusionStart / 4)));
        const xp = Math.max(1, Math.floor(baseExp * decay));
        // Slight bump to rare-chance accumulator
        this.state.rareSourceFindChanceAcc += 0.01 * intensity;
        // Return xp to apply
        return { xpGained: xp };
    }
}
exports.HermitPath = HermitPath;
