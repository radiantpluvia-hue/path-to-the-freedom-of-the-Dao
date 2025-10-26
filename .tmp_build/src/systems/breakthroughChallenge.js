"use strict";
// BreakthroughChallenge: three-stance minigame skeleton
Object.defineProperty(exports, "__esModule", { value: true });
exports.breakthroughChallenge = void 0;
// Simple event emitter hooks for UI or systems to subscribe
const listeners = { success: [], fail: [] };
exports.breakthroughChallenge = {
    computeChance(baseChance, opts) {
        const stanceBonus = opts?.stanceBonus || (opts?.stance === 'Focus' ? 0.05 : opts?.stance === 'Defy' ? 0.03 : 0.04);
        const phys = opts?.physiqueModifiers || 0;
        const world = opts?.worldModifiers || 0;
        // random noise is not applied here; left to resolve function so tests can mock Math.random
        const chance = Math.max(0, Math.min(1, baseChance + stanceBonus + phys + world));
        return chance;
    },
    attemptBreakthrough(baseChance, opts) {
        const chance = this.computeChance(baseChance, opts);
        const roll = Math.random();
        const success = roll < chance;
        const result = { success, chance, roll };
        if (success) {
            // simple reward structure
            result.reward = { realmGain: 1, vision: 'glimpse' };
            for (const l of listeners.success)
                try {
                    l(result);
                }
                catch (e) { /*ignore*/ }
        }
        else {
            result.penalty = { qiLoss: 5 };
            for (const l of listeners.fail)
                try {
                    l(result);
                }
                catch (e) { /*ignore*/ }
        }
        return result;
    },
    onSuccess(cb) { listeners.success.push(cb); return () => { const i = listeners.success.indexOf(cb); if (i >= 0)
        listeners.success.splice(i, 1); }; },
    onFail(cb) { listeners.fail.push(cb); return () => { const i = listeners.fail.indexOf(cb); if (i >= 0)
        listeners.fail.splice(i, 1); }; },
    // UI hook stub: returns a promise resolving to BreakthroughResult; UI can implement modal and call attemptBreakthrough
    showBreakthroughModal(sessionData, opts) {
        // For now auto-resolve if opts.autoResolve is true or UI not present
        const baseChance = sessionData && sessionData.baseChance != null ? sessionData.baseChance : 0.5;
        const result = this.attemptBreakthrough(baseChance, opts);
        return Promise.resolve(result);
    }
};
