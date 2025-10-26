"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEraFromTemplate = generateEraFromTemplate;
const seededRng_1 = require("@/utils/seededRng");
function clamp01(n) { return Math.max(0, Math.min(1, n)); }
function normalizeBias(bias) {
    const sum = bias.dark + bias.neutral + bias.light;
    if (sum <= 0)
        return { dark: 1 / 3, neutral: 1 / 3, light: 1 / 3 };
    return { dark: bias.dark / sum, neutral: bias.neutral / sum, light: bias.light / sum };
}
function applyDeltas(t, rng) {
    const jitter = (base) => {
        const delta = Math.floor(base * (rng() * 0.05 - 0.025));
        return Math.max(0, base + delta);
    };
    const biasJitter = (x) => clamp01(x + (rng() * 0.06 - 0.03));
    const sf = t.startingFactions.map(f => ({ ...f, influence: Math.max(0, f.influence + Math.floor(rng() * 7) - 3) }));
    const mod = {
        ...t.modifiers,
        qiDensity: jitter(t.modifiers.qiDensity),
        artifactDensity: jitter(t.modifiers.artifactDensity),
        sectCorruptionRate: jitter(t.modifiers.sectCorruptionRate),
        eventBias: normalizeBias({
            dark: biasJitter(t.modifiers.eventBias.dark),
            neutral: biasJitter(t.modifiers.eventBias.neutral),
            light: biasJitter(t.modifiers.eventBias.light)
        }),
        tribulationSeverity: clamp01(t.modifiers.tribulationSeverity)
    };
    return { ...t, modifiers: mod, startingFactions: sf };
}
function generateEraFromTemplate(template, options = {}) {
    const seedStr = `${options.playerId || 'anon'}|${options.reincarnationCount ?? 0}|${template.seedHint || ''}|${options.seed || ''}`;
    const rng = (0, seededRng_1.seededFromString)(seedStr);
    const withDeltas = applyDeltas({ ...template, index: options.index ?? template.index }, rng);
    const generatedSeed = seedStr;
    // Deterministic timestamp from seed so repeated calls with same inputs are equal in tests
    const generatedAt = Math.floor(rng() * 1000000000000); // up to ~10^12
    return { ...withDeltas, generatedSeed, generatedAt };
}
