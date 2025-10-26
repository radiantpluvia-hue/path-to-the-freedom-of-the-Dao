"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeId = normalizeId;
exports.normalizeObjectKeys = normalizeObjectKeys;
// Runtime alias map to preserve backward compatibility for legacy IDs
const ALIASES = {
    // sects
    'void_emperor_sect': 'emptiness_emperor_sect',
    // techniques / refinements
    'void_refinement': 'emptiness_refinement',
    // cultivation origins
    'mystic_divine_origin_1': 'mystic_celestial_origin_1',
    'mystic_divine_origin_2': 'mystic_celestial_origin_2',
    'mystic_divine_origin_3': 'mystic_celestial_origin_3',
    'mystic_divine_origin_4': 'mystic_celestial_origin_4',
    'mystic_divine_origin_5': 'mystic_celestial_origin_5',
    'mystic_divine_origin_6': 'mystic_celestial_origin_6',
    // physiques / passives
    'divine_body_forging': 'celestial_body_forging',
    // legacy race/background key with space
    'Sea Turtle': 'chelonian',
    // general token-level aliases (catch common patterns)
    'void': 'emptiness',
    'divine': 'celestial',
    'turtle': 'chelonian',
    'snake': 'serpent'
};
function normalizeId(id) {
    if (!id)
        return id;
    if (ALIASES[id])
        return ALIASES[id];
    // also try lowercased keys and simple replacements
    const lower = id.toLowerCase();
    for (const k of Object.keys(ALIASES)) {
        if (lower === k.toLowerCase())
            return ALIASES[k];
    }
    // simple token replacements for compound ids
    let out = id;
    out = out.replace(/\bvoid\b/ig, 'emptiness');
    out = out.replace(/\bdivine\b/ig, 'celestial');
    out = out.replace(/\bturtle\b/ig, 'chelonian');
    out = out.replace(/\bsnake\b/ig, 'serpent');
    return out;
}
function normalizeObjectKeys(obj) {
    const out = {};
    for (const k of Object.keys(obj)) {
        const nk = normalizeId(k) || k;
        out[nk] = obj[k];
    }
    return out;
}
exports.default = ALIASES;
