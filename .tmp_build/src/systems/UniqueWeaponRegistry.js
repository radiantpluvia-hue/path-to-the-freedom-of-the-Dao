"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeaponClaimed = isWeaponClaimed;
exports.claimWeapon = claimWeapon;
exports.releaseWeapon = releaseWeapon;
exports.getRegistryState = getRegistryState;
exports.loadRegistryState = loadRegistryState;
/**
 * Simple in-memory registry to track globally-unique weapon spawns (artifacts).
 * Provides helpers to serialize/deserialize state for integration with save/load.
 */
const claimed = new Set();
function isWeaponClaimed(id) {
    return claimed.has(id);
}
function claimWeapon(id) {
    if (claimed.has(id))
        return false;
    claimed.add(id);
    return true;
}
function releaseWeapon(id) {
    return claimed.delete(id);
}
function getRegistryState() {
    return { claimed: Array.from(claimed) };
}
function loadRegistryState(state) {
    claimed.clear();
    if (!state || !Array.isArray(state.claimed))
        return;
    for (const id of state.claimed)
        claimed.add(id);
}
exports.default = {
    isWeaponClaimed,
    claimWeapon,
    releaseWeapon,
    getRegistryState,
    loadRegistryState
};
