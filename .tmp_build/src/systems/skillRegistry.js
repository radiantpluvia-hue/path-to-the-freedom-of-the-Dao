"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCombatTechnique = toCombatTechnique;
exports.getSkillById = getSkillById;
exports.listSkillsByTier = listSkillsByTier;
exports.listAllSkills = listAllSkills;
const registry_1 = require("../data/registry");
// Normalize various active-ability data shapes into the `Skill` shape used by minigame consumers.
function normalizeToSkill(raw) {
    // Provide safe defaults and map common fields
    const tier = (typeof raw.tier === 'number') ? raw.tier : Number(raw.tier) || 1;
    const cost = raw.cost || { ap: raw.apCost || 0, qi: raw.qiCost || 0 };
    const effects = raw.effects || (raw.effect ? [raw.effect] : []);
    return {
        id: String(raw.id),
        name: raw.name || String(raw.id),
        description: raw.description || raw.desc || '',
        power: typeof raw.power === 'number' ? raw.power : (raw.damage || 0),
        cost: { ap: cost.ap || 0, qi: cost.qi || 0 },
        tier: tier,
        mechanics: raw.mechanics || [],
        cooldown: raw.cooldown || 0,
        effects,
        tags: raw.tags || [],
    };
}
// Adapter: convert a catalog Skill into a CombatTechnique usable by CombatSystem
function toCombatTechnique(skill) {
    // If the skill already contains active-ability metadata (effects, ap/qi costs,
    // or a 'type' field encoded in mechanics/description), prefer those values.
    // Otherwise, fall back to conservative defaults driven by the catalog fields.
    const apCost = skill.apCost ?? skill.cost?.ap ?? 0;
    const qiCost = skill.qiCost ?? skill.cost?.qi ?? 0;
    const type = skill.type ?? 'attack';
    const effects = skill.effects ?? [{ type: 'damage', target: 'enemy', value: skill.power }];
    return {
        id: skill.id,
        name: skill.name,
        description: skill.description || '',
        apCost,
        qiCost,
        type,
        effects,
        cooldown: skill.cooldown,
        currentCooldown: 0,
        tier: skill.tier,
        // modest default hit rules; CombatSystem can override with context
        missChance: 0.05,
        critChance: 0.1,
        critMultiplier: 1.5,
    };
}
function getSkillById(id) {
    const raw = (0, registry_1.getActiveAbilityById)(id);
    if (!raw)
        return undefined;
    return normalizeToSkill(raw);
}
function listSkillsByTier(tier) {
    return (0, registry_1.getActiveAbilities)().map(normalizeToSkill).filter(s => s.tier === tier);
}
function listAllSkills() {
    return (0, registry_1.getActiveAbilities)().map(normalizeToSkill);
}
