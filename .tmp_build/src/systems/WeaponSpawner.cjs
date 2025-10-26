"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAvailableWeapons = listAvailableWeapons;
exports.sampleWeapon = sampleWeapon;
exports.registerWeaponClaim = registerWeaponClaim;
const weapons_1 = __importDefault(require("../data/weapons"));
const UniqueWeaponRegistry_1 = require("./UniqueWeaponRegistry");
function weightForRarity(rarity) {
    switch ((rarity || '').toLowerCase()) {
        case "H": return 60;
        case "G": return 25;
        case "F": return 10;
        case "D": return 4;
        case 'unique': return 1;
        default: return 10;
    }
}
function listAvailableWeapons(filter) {
    const allowSecret = !!filter?.allowSecret;
    const requireQuest = !!filter?.requireQuestAllowed;
    return weapons_1.default.filter((raw) => {
        const w = raw;
        if (filter?.category && w.category && w.category !== filter.category)
            return false;
        if (!allowSecret && w.secretArea)
            return false;
        if (!requireQuest && w.questRequired)
            return false;
        if (w.rarity === 'Unique' && (0, UniqueWeaponRegistry_1.isWeaponClaimed)(w.id))
            return false;
        if (filter?.maxRarity && w.rarity) {
            const weight = weightForRarity(w.rarity);
            if (weight > filter.maxRarity)
                return false;
        }
        return true;
    });
}
const rng_1 = require("../utils/rng");
function sampleWeapon(filter, rng) {
    const pool = listAvailableWeapons(filter);
    if (!pool.length)
        return null;
    const weights = pool.map((w) => weightForRarity(w.rarity));
    const total = weights.reduce((a, b) => a + b, 0);
    const rngFn = rng || (0, rng_1.getRng)();
    let pick = (0, rng_1.randInt)(total, { rng: rngFn });
    for (let i = 0; i < pool.length; i++) {
        pick -= weights[i];
        if (pick < 0) {
            const chosen = pool[i];
            // If unique, mark claimed
            if (chosen.rarity === 'Unique')
                (0, UniqueWeaponRegistry_1.claimWeapon)(chosen.id);
            return chosen;
        }
    }
    return pool[pool.length - 1];
}
function registerWeaponClaim(id) {
    // For external usage: attempt to claim a unique weapon (returns false if already claimed)
    return (0, UniqueWeaponRegistry_1.claimWeapon)(id);
}
exports.default = {
    listAvailableWeapons,
    sampleWeapon,
    registerWeaponClaim
};
