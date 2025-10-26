"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attemptSecretQuest = attemptSecretQuest;
const immortalItems_1 = require("@/data/immortalItems");
function defaultRng() {
    // very small LCG for deterministic fallback in environments without seeded RNG
    let s = 1337;
    return { next: () => (s = (s * 48271) % 0x7fffffff) / 0x7fffffff };
}
function weightedPick(items, rng) {
    // Prefer explicit per-item spawnWeight. If not present, fall back to rarity bucket weighting.
    const weighted = [];
    for (const it of items) {
        if (typeof it.spawnWeight === 'number' && it.spawnWeight > 0) {
            weighted.push({ item: it, weight: it.spawnWeight });
        }
        else {
            const r = it.rarity || "H";
            const w = immortalItems_1.IMMORTAL_ITEM_RARITY_WEIGHTS[r] || 1;
            weighted.push({ item: it, weight: Math.max(1, Math.floor(w)) });
        }
    }
    const total = weighted.reduce((s, x) => s + x.weight, 0);
    if (!total)
        return null;
    let roll = Math.floor(rng.next() * total);
    for (const w of weighted) {
        if (roll < w.weight)
            return w.item;
        roll -= w.weight;
    }
    return weighted[weighted.length - 1].item;
}
// Very small quest simulation: attemptSecretQuest returns an immortal item if conditions met
function attemptSecretQuest(ctx, rngProvider) {
    const rng = rngProvider || defaultRng();
    // Conditions: must have found clue
    if (!ctx.foundSecretClue)
        return { success: false, message: 'No clue found.' };
    // World gating: some eras may forbid sacred findings
    if (ctx.worldState && ctx.worldState.allowsSacredFindings === false)
        return { success: false, message: 'The world resists sacred discoveries now.' };
    const eligible = (ctx.playerReputation ?? 0) >= 60 || ctx.stealthSuccessful === true;
    if (!eligible)
        return { success: false, message: 'You lack the standing or skill to access the secret.' };
    // Select a reward by weighted rarity
    const reward = weightedPick(immortalItems_1.IMMORTAL_ITEMS, rng);
    if (!reward)
        return { success: false, message: 'No suitable relic found.' };
    return { success: true, reward, message: `You uncover ${reward.name} tied to an ancient emperor.` };
}
