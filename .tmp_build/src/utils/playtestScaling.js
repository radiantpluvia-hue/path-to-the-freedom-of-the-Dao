"use strict";
// Playtest scaling helper: apply minimal, toggleable scaling to dynamic effects
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaytestScaling = void 0;
class PlaytestScalingHelper {
    constructor() {
        this.enabled = true;
        // Per-source minimal scale factors (50%)
        this.FACTORS = {
            event: 0.5,
            quest: 0.5,
            minigame: 0.5,
            faction_battle: 0.5,
        };
        // Optional global combat power multiplier used for playtesting
        this.combatPowerMultiplier = 1;
    }
    setCombatPowerMultiplier(n) {
        if (isFinite(n) && n > 0)
            this.combatPowerMultiplier = n;
    }
    getCombatPowerMultiplier() {
        return this.combatPowerMultiplier;
    }
    isEnabled() {
        return this.enabled;
    }
    setEnabled(value) {
        this.enabled = value;
    }
    setFactor(source, factor) {
        if (factor > 0 && isFinite(factor)) {
            this.FACTORS[source] = factor;
        }
    }
    scaleInt(n, factor) {
        if (!isFinite(n) || n === 0)
            return 0;
        const scaled = Math.round(n * factor);
        if (scaled === 0)
            return n > 0 ? 1 : -1; // ensure non-zero if original non-zero
        return scaled;
    }
    clone(obj) {
        // Shallow clone primitives/arrays/objects; avoid JSON to keep methods out of scope
        if (obj === null || typeof obj !== 'object')
            return obj;
        if (Array.isArray(obj))
            return obj.map(v => this.clone(v));
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
            out[k] = this.clone(v);
        }
        return out;
    }
    // Apply conservative scaling to known effect shapes
    applyScaledEffects(effects, opts) {
        if (!this.enabled || !effects)
            return effects;
        const factor = this.FACTORS[opts.source] ?? 1;
        if (factor === 1)
            return effects;
        const scaled = this.clone(effects);
        const scaleNumericProp = (obj, key) => {
            const val = obj[key];
            if (typeof val === 'number') {
                obj[key] = this.scaleInt(val, factor);
            }
        };
        const scaleNumberMap = (map) => {
            if (!map || typeof map !== 'object')
                return;
            Object.keys(map).forEach(k => {
                if (typeof map[k] === 'number') {
                    map[k] = this.scaleInt(map[k], factor);
                }
            });
        };
        // Common top-level fields in dynamic effects
        // - stats: Record<string, number>
        // - skills: Record<string, number>
        // - karma: number
        // - sectReputation: number
        // - reputation: number
        // - change: number (used by faction_standing/sect_reputation/rival_relationship effects)
        // - spiritStones: { low, mid, high }
        if (scaled.stats)
            scaleNumberMap(scaled.stats);
        if (scaled.skills)
            scaleNumberMap(scaled.skills);
        if (scaled.spiritStones && typeof scaled.spiritStones === 'object') {
            ['low', 'mid', 'high'].forEach(tier => {
                if (typeof scaled.spiritStones[tier] === 'number') {
                    scaled.spiritStones[tier] = this.scaleInt(scaled.spiritStones[tier], factor);
                }
            });
        }
        ['karma', 'sectReputation', 'reputation', 'change'].forEach(k => scaleNumericProp(scaled, k));
        // Avoid scaling quantities/levels/exp-related counters
        // If the caller passed an arbitrary map, only scale known beneficial/penalty fields.
        return scaled;
    }
}
exports.PlaytestScaling = new PlaytestScalingHelper();
