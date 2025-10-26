"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realmToTier = realmToTier;
exports.tierMultiplier = tierMultiplier;
exports.addProficiency = addProficiency;
exports.computeStatFromProficiency = computeStatFromProficiency;
const playerHelpers_1 = require("./playerHelpers");
// Map realm names or ids to tiers roughly. This is a conservative mapping; callers can override.
function realmToTier(realm) {
    const r = realm.toLowerCase();
    if (r.includes('mortal') || r.includes('mortal'))
        return 'early';
    if (r.includes('foundation') || r.includes('foundation'))
        return 'mid';
    if (r.includes('qi') || r.includes('qi condensation') || r.includes('condensation'))
        return 'mid';
    if (r.includes('core') || r.includes('core formation'))
        return 'late';
    if (r.includes('nascent') || r.includes('nascent soul') || r.includes('nascent'))
        return 'late';
    // fallback to early
    return 'early';
}
// Convert tier to multiplier for proficiency -> stat conversion
function tierMultiplier(tier) {
    switch (tier) {
        case 'early': return 0.01; // 100 proficiency -> +1 stat
        case 'mid': return 0.02; // 50 -> +1
        case 'late': return 0.04; // 25 -> +1
        case 'peak': return 0.08; // 12.5 -> +1
    }
}
// Add proficiency points for a stat on the player's proficiencies map
function addProficiency(state, stat, realm, points) {
    state.player.proficiencies = state.player.proficiencies || {};
    state.player.proficiencies[stat] = state.player.proficiencies[stat] || {};
    const prev = state.player.proficiencies[stat][realm] || 0;
    state.player.proficiencies[stat][realm] = prev + points;
}
// Compute effective visible stat increase for a stat based on proficiency in the player's current realm
function computeStatFromProficiency(state, stat) {
    const realm = (0, playerHelpers_1.getPlayerRealmKey)(state.player);
    const tier = realmToTier(realm);
    const pts = ((state.player.proficiencies && state.player.proficiencies[stat] && state.player.proficiencies[stat][realm]) || 0);
    const mult = tierMultiplier(tier);
    return Math.floor(pts * mult);
}
