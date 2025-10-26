"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGeneratedPassiveShape = validateGeneratedPassiveShape;
exports.validateGeneratedAbilityShape = validateGeneratedAbilityShape;
exports.validateAllGenerated = validateAllGenerated;
// Lightweight validators for generated passives and active abilities.
// Not a full runtime schema library — just focused checks used in tests.
const passives_generated_1 = require("../generated/passives.generated");
const activeAbilities_generated_1 = __importDefault(require("../generated/activeAbilities.generated"));
function validateGeneratedPassiveShape(p) {
    if (!p || typeof p.id !== 'string')
        return { ok: false, reason: 'missing id' };
    if (!p.name || typeof p.name !== 'string')
        return { ok: false, reason: 'missing name' };
    if (!p.stats || typeof p.stats !== 'object')
        return { ok: false, reason: 'missing stats' };
    const s = p.stats;
    const numericFields = ['atk', 'def', 'hp', 'atkPct', 'defPct'];
    for (const f of numericFields) {
        if (s[f] !== undefined && typeof s[f] !== 'number')
            return { ok: false, reason: `stat ${f} not a number` };
    }
    return { ok: true };
}
function validateGeneratedAbilityShape(a) {
    if (!a || typeof a.id !== 'string')
        return { ok: false, reason: 'missing id' };
    if (!a.name || typeof a.name !== 'string')
        return { ok: false, reason: 'missing name' };
    if (!Array.isArray(a.effects))
        return { ok: false, reason: 'effects missing or not array' };
    for (const e of a.effects) {
        if (!e || typeof e.type !== 'string')
            return { ok: false, reason: 'effect missing type' };
        if (e.value !== undefined && typeof e.value !== 'number')
            return { ok: false, reason: 'effect value not number' };
    }
    return { ok: true };
}
function validateAllGenerated() {
    const pBad = passives_generated_1.GENERATED_PASSIVES.map(p => ({ id: p.id, result: validateGeneratedPassiveShape(p) })).filter(x => !x.result.ok);
    const aBad = activeAbilities_generated_1.default.map(a => ({ id: a.id, result: validateGeneratedAbilityShape(a) })).filter(x => !x.result.ok);
    return { passivesInvalid: pBad, abilitiesInvalid: aBad };
}
exports.default = true;
