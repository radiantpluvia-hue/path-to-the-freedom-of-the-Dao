"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSIVE_CATALOG = void 0;
exports.getPassiveById = getPassiveById;
// Programmatically generate 100 passives across tiers and sources
exports.PASSIVE_CATALOG = (() => {
    const passives = [];
    const total = 100;
    const prefixes = ['Bloodline', 'Spirit', 'Sage', 'Trueform', 'Pill-refined', 'Ancestral', 'Heavenly', 'Soulbound', 'Meridian', 'Voidborn'];
    const effects = ['Endurance', 'Rage', 'Clarity', 'Vigor', 'Perception', 'Resolve', 'Fortitude', 'Swiftness'];
    const sources = ['bloodline', 'physique', 'manual'];
    for (let i = 1; i <= total; i++) {
        const tier = (Math.floor((i - 1) / (total / 8)) + 1);
        const prefix = prefixes[i % prefixes.length];
        const effect = effects[(i * 7) % effects.length];
        const source = sources[i % sources.length];
        const id = `passive_${i}`;
        const name = `${prefix} ${effect} ${i}`;
        // scale modestly by tier
        // amplify passive effects for stronger cultivation flavor
        const atk = Math.floor((tier >= 2 ? tier * 2 : 0) + (tier >= 6 ? 4 : 0));
        const def = Math.floor(tier * 1.5);
        const hp = Math.floor(tier * 40 + (i % 20));
        const qiMax = tier >= 4 ? Math.ceil(tier / 1.2) : 0;
        const apMax = tier >= 3 ? 1 + Math.floor(tier / 5) : 0;
        // occasionally give percent-based modifiers or special effects for variety
        const atkPct = i % 11 === 0 ? Math.round(5 + tier * 1) : undefined;
        const defPct = i % 13 === 0 ? Math.round(4 + tier * 1) : undefined;
        const speedPct = i % 17 === 0 ? Math.round(3 + Math.floor(tier / 2)) : undefined;
        const specialEffects = (i % 19 === 0) ? ['resonance_boost'] : undefined;
        const description = `(${source}) ${name}: a cultivation imprint that grants +${atk} ATK, +${def} DEF, and bolsters the body by +${hp} HP. ${atkPct ? `+${atkPct}% ATK.` : ''} Tier: ${tier}`;
        passives.push({ id, name, tier, atk, def, hp, qiMax, apMax, atkPct, defPct, speedPct, specialEffects, source, description });
    }
    return passives;
})();
function getPassiveById(id) {
    return exports.PASSIVE_CATALOG.find(p => p.id === id);
}
