"use strict";
// Utilities for cultivation-based scaling and simple diminishing returns
// Keep formulas conservative to avoid exponential blowup. These are easy to tweak.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCultivationMultiplier = getCultivationMultiplier;
exports.getDiminishingReturnFactor = getDiminishingReturnFactor;
exports.adjustDamageForRealmGap = adjustDamageForRealmGap;
// Compute a multiplier based on cultivation. Default: linear-ish scaling with soft cap.
function getCultivationMultiplier(info) {
    if (!info || typeof info.stage !== 'number')
        return 1;
    const stage = Math.max(0, info.stage);
    const sub = Math.max(0, info.substage || 0);
    // Base: 1 + 0.18 * stage + 0.02 * sub (substage has smaller impact)
    // Apply soft cap using tanh to prevent runaway late-game scaling
    const raw = 1 + 0.18 * stage + 0.02 * sub;
    // soft cap curve: blend towards an asymptote at ~6x
    const asymptote = 6;
    const t = Math.tanh((raw - 1) / 4); // normalized
    const scaled = 1 + t * (asymptote - 1);
    return Math.max(0.1, scaled);
}
// Diminishing returns factor based on repeated uses in a single combat
// useCount: number of times the technique has been used already by this participant in combat
// returns a multiplier in (0.25, 1], decreasing with useCount
function getDiminishingReturnFactor(useCount) {
    if (!useCount || useCount <= 1)
        return 1;
    // Exponential decay to floor
    const floor = 0.25; // minimum effectiveness
    const decay = 0.85; // multiplicative decay per extra use
    const factor = Math.max(floor, Math.pow(decay, useCount - 1));
    return factor;
}
// Adjust damage to respect realm gaps between attacker and target.
// If target is several stages above attacker, reduce damage and prevent instant kill
// unless attackerProwess is sufficiently high. Returns adjusted damage.
function adjustDamageForRealmGap(options) {
    const gapThreshold = options.gapThreshold ?? 2;
    const minHpFraction = options.minHpFraction ?? 0.2;
    const attStage = options.attackerStage || 0;
    const tgtStage = options.targetStage || 0;
    const gap = tgtStage - attStage;
    let dmg = options.damage;
    if (gap >= gapThreshold) {
        // Compute required prowess to overcome realm gap: scale with gap^2
        const required = (gap * gap) * 20 + (options.targetProwess || 0);
        const attackerP = options.attackerProwess || 0;
        if (attackerP < required) {
            // Reduce damage by a factor proportional to gap and leave at least minHpFraction
            const reduction = 1 / (1 + (gap - (gapThreshold - 1)) * 1.4); // gap=2 -> ~0.42, gap=3 -> ~0.26
            dmg = Math.max(1, Math.floor(dmg * reduction));
            const minHp = Math.max(1, Math.floor(options.targetMaxHp * minHpFraction));
            // Enforce strict minimum remaining HP: damage must not exceed targetMaxHp - minHp.
            const maxAllowedDamage = Math.max(1, options.targetMaxHp - minHp);
            if (dmg > maxAllowedDamage) {
                dmg = maxAllowedDamage;
            }
            // Also ensure damage is at least 1
            dmg = Math.max(1, dmg);
        }
        // otherwise attacker prowess is sufficient; allow full damage
    }
    return dmg;
}
