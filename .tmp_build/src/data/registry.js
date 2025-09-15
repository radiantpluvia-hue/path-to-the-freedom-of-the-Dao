"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeapons = getWeapons;
exports.getWeaponById = getWeaponById;
exports.getPassives = getPassives;
exports.getPassiveById = getPassiveById;
exports.getActiveAbilities = getActiveAbilities;
exports.getActiveAbilityById = getActiveAbilityById;
exports.getFormations = getFormations;
exports.getFormationById = getFormationById;
exports.getManuals = getManuals;
exports.getManualById = getManualById;
const weapons_1 = require("./weapons");
const passives_1 = require("./passives");
const more_active_abilities_1 = require("./skills/more_active_abilities");
const formations_1 = require("./formations");
const manuals_1 = require("./manuals");
// Simple, safe registry getters. Consumers should import from this file to avoid
// using project root alias imports and to have a single place to control exposures.
function getWeapons() {
    return weapons_1.WEAPONS;
}
function getWeaponById(id) {
    return weapons_1.WEAPONS.find((w) => w.id === id) || null;
}
function getPassives() {
    return passives_1.PASSIVES;
}
function getPassiveById(id) {
    return passives_1.PASSIVES.find((p) => p.id === id) || null;
}
function getActiveAbilities() {
    return more_active_abilities_1.ACTIVE_ABILITIES;
}
function getActiveAbilityById(id) {
    return more_active_abilities_1.ACTIVE_ABILITIES.find((a) => a.id === id) || null;
}
function getFormations() {
    return formations_1.FORMATIONS;
}
function getFormationById(id) {
    return formations_1.FORMATIONS.find((f) => f.id === id) || null;
}
function getManuals() {
    return manuals_1.ALL_MANUALS;
}
function getManualById(id) {
    return manuals_1.ALL_MANUALS.find((m) => m.id === id) || undefined;
}
exports.default = {
    getWeapons,
    getWeaponById,
    getPassives,
    getPassiveById,
    getActiveAbilities,
    getActiveAbilityById,
    getFormations,
    getFormationById,
    getManuals,
    getManualById,
};
