"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPowerScale = getPowerScale;
// Centralized power scaling helper. Defaults to 1.0 everywhere unless configured.
// Sources:
// - player.settings.powerScalePercent (e.g., 100 => 1.0, 250 => 2.5)
// - world.modifiers.powerScale (multiplier, defaults to 1.0)
// Both are multiplied. Returned scales are identical for now but split for future tuning.
function getPowerScale(player, world) {
    try {
        const pct = Number(player?.settings?.powerScalePercent);
        const pctMul = isFinite(pct) && pct > 0 ? pct / 100 : 1;
        const worldMul = Number(world?.modifiers?.powerScale);
        const wMul = isFinite(worldMul) && worldMul > 0 ? worldMul : 1;
        // Unified multiplier. Keep within a very generous range but avoid zero/negatives.
        const base = Math.max(0.1, Math.min(pctMul * wMul, 100));
        return {
            statScale: base,
            damageScale: base,
            buffScale: base,
        };
    }
    catch {
        return { statScale: 1, damageScale: 1, buffScale: 1 };
    }
}
exports.default = getPowerScale;
