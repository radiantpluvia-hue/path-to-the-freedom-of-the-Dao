"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDerivedStats = computeDerivedStats;
const CultivationSystem_1 = __importDefault(require("../systems/CultivationSystem"));
const powerScale_1 = __importDefault(require("./powerScale"));
// Conservative, non-invasive derived stats calculator.
// It sums player.baseStats, player.stats, equipment bonuses and active buff stat effects if present.
function computeDerivedStats(player) {
    const base = { ...(player.baseStats || {}), ...(player.stats || {}) };
    // Start from base values (prefer stats over baseStats for any keys present)
    const atk = Math.max(0, Math.round((base.atk || 0) + (player.equipment ? Object.values(player.equipment).reduce((s, it) => s + ((it && it.stats && it.stats.atk) || 0), 0) : 0)));
    const def = Math.max(0, Math.round((base.def || 0) + (player.equipment ? Object.values(player.equipment).reduce((s, it) => s + ((it && it.stats && it.stats.def) || 0), 0) : 0)));
    const speed = Math.max(0, Math.round((base.speed || 0) + (player.equipment ? Object.values(player.equipment).reduce((s, it) => s + ((it && it.stats && it.stats.speed) || 0), 0) : 0)));
    // maxQi: prefer explicit maxQi, then stats.qi or base.qi, then player.maxQi
    const maxQiFromStats = (player.stats && (player.stats.maxQi || player.stats.qi)) || 0;
    const maxQi = Math.max(0, Math.round(player.maxQi || maxQiFromStats || base.qi || player.qi || 0));
    // willPower: prefer explicit numeric field when present; otherwise fall back to the previous spiritStones heuristic
    const willFromField = typeof player.willPower === 'number' ? player.willPower : undefined;
    const willFromStones = Math.max(0, (player.spiritStones?.low || 0) + (player.spiritStones?.mid || 0) * 5 + (player.spiritStones?.high || 0) * 25);
    const willPower = Math.max(0, Math.round(willFromField ?? willFromStones));
    // comprehension: prefer daoComprehension if present, fall back to skill comprehension level + insight
    const comprehensionFromSkill = (player.skills && player.skills.comprehension ? (player.skills.comprehension.level || 0) : 0);
    const comprehension = Math.max(0, Math.round((player.daoComprehension || 0) + comprehensionFromSkill + (player.insight || 0) / 50));
    // Apply simple buff adjustments if activeBuffs exist and expose numeric stat effects under effects.stats
    let finalAtk = atk;
    let finalDef = def;
    let finalSpeed = speed;
    let finalMaxQi = maxQi;
    let finalComprehension = comprehension;
    let finalWillPower = willPower;
    if (Array.isArray(player.activeBuffs)) {
        for (const b of player.activeBuffs) {
            if (!b || typeof b !== 'object')
                continue;
            const stats = (b.effects && b.effects.stats) || (b.appliedEffects && b.appliedEffects.stats) || null;
            if (!stats)
                continue;
            finalAtk += stats.atk || 0;
            finalDef += stats.def || 0;
            finalSpeed += stats.speed || 0;
            finalMaxQi += stats.qi || 0;
            finalComprehension += stats.daoComprehension || stats.comprehension || 0;
            // also allow buffs to modify willPower
            if (typeof stats.willPower === 'number')
                finalWillPower += stats.willPower;
        }
    }
    // Apply cultivation pathway bonuses (if the player has a pathway selected).
    // Cultivation pathways can provide numeric or percent bonuses; we ask the
    // CultivationSystem to apply any direct numeric bonuses, and additionally
    // handle common "Pct" keys so percentage bonuses affect the derived stats.
    try {
        const pathwayBonuses = (player.cultivation && player.cultivation.bonuses) || {};
        if (pathwayBonuses && Object.keys(pathwayBonuses).length > 0) {
            // Start with an object matching the derived stat keys so CultivationSystem
            // can add direct numeric bonuses using its existing helper if desired.
            const derivedLike = {
                atk: finalAtk,
                def: finalDef,
                speed: finalSpeed,
                maxQi: finalMaxQi,
                willPower: finalWillPower,
                comprehension: finalComprehension
            };
            const applied = CultivationSystem_1.default.applyPathwayBonuses(player, derivedLike);
            finalAtk = applied.atk ?? finalAtk;
            finalDef = applied.def ?? finalDef;
            finalSpeed = applied.speed ?? finalSpeed;
            finalMaxQi = applied.maxQi ?? finalMaxQi;
            finalWillPower = applied.willPower ?? finalWillPower;
            finalComprehension = applied.comprehension ?? finalComprehension;
            // Handle common percent-style bonuses (keys ending with Pct) that map to derived stats.
            for (const [k, v] of Object.entries(pathwayBonuses)) {
                if (typeof v !== 'number')
                    continue;
                const key = k.toLowerCase();
                if (key.endsWith('pct') || key.endsWith('%')) {
                    // normalize e.g., 'speedPct' or 'speed_pct' -> speed
                    const baseKey = key.replace(/pct$|%$/i, '').replace(/_$/, '').replace(/_pct$/, '').replace(/_percent$/, '');
                    const val = v <= 1 ? v : v / 100; // interpret 0.12 or 12
                    if (baseKey.includes('speed'))
                        finalSpeed = Math.round(finalSpeed + finalSpeed * val);
                    else if (baseKey.includes('atk') || baseKey.includes('attack'))
                        finalAtk = Math.round(finalAtk + finalAtk * val);
                    else if (baseKey.includes('def'))
                        finalDef = Math.round(finalDef + finalDef * val);
                    else if (baseKey.includes('qi'))
                        finalMaxQi = Math.round(finalMaxQi + finalMaxQi * val);
                    else if (baseKey.includes('will'))
                        finalWillPower = Math.round(finalWillPower + finalWillPower * val);
                    else if (baseKey.includes('compreh') || baseKey.includes('percep'))
                        finalComprehension = Math.round(finalComprehension + finalComprehension * val);
                }
            }
        }
    }
    catch (e) {
        // Non-fatal: if cultivation system misbehaves, ignore and continue with base stats
    }
    // Immortal power fantasy scaling: global multiplier from settings/world
    try {
        const { statScale } = (0, powerScale_1.default)(player, player?.world || undefined);
        if (statScale && statScale !== 1) {
            finalAtk *= statScale;
            finalDef *= statScale;
            finalSpeed = Math.max(1, Math.round(finalSpeed * statScale));
            finalMaxQi *= statScale;
            // Leave willPower and comprehension unscaled by default to avoid breaking gating logic
        }
    }
    catch {
        // ignore scaling errors
    }
    return {
        atk: Math.max(0, Math.round(finalAtk)),
        def: Math.max(0, Math.round(finalDef)),
        speed: Math.max(0, Math.round(finalSpeed)),
        maxQi: Math.max(0, Math.round(finalMaxQi)),
        willPower: Math.max(0, Math.round(finalWillPower)),
        comprehension: Math.max(0, Math.round(finalComprehension))
    };
}
exports.default = computeDerivedStats;
