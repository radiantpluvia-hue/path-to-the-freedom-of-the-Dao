"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerRealmId = getPlayerRealmId;
exports.ensureRealmId = ensureRealmId;
exports.getPlayerRealmKey = getPlayerRealmKey;
const cultivationRealms_1 = require("../data/cultivationRealms");
// Conservative helpers to access legacy and normalized player realm fields.
// These avoid mass-replacing `player.realm` -> `player.realmId` and provide a
// single place to normalize access patterns. Do NOT mutate the player object
// unless `ensureRealmId` is explicitly called.
function getPlayerRealmId(player) {
    if (!player)
        return undefined;
    // Prefer explicit numeric realmId when present
    if (typeof player.realmId === 'number')
        return player.realmId;
    // Fallback: attempt to derive from legacy `realm` string if it maps to a number
    const r = player.realm;
    if (typeof r === 'number')
        return r; // some legacy saves used numbers in `realm`
    if (typeof r === 'string') {
        // Common legacy mapping: 'mortal' -> 1, 'cultivator' -> 2 etc. Keep mapping minimal and conservative.
        const MAP = {
            mortal: 1,
            cultivator: 2,
            immortal: 10,
        };
        const lower = r.toLowerCase();
        if (lower in MAP)
            return MAP[lower];
    }
    return undefined;
}
function ensureRealmId(player) {
    // If realmId exists, return it. Otherwise derive from legacy and set it.
    if (typeof player.realmId === 'number')
        return player.realmId;
    const derived = getPlayerRealmId(player) ?? 1;
    try {
        player.realmId = derived;
    }
    catch (e) { /* ignore immutable objects */ }
    return derived;
}
function getPlayerRealmKey(player) {
    if (!player)
        return cultivationRealms_1.REALM_ORDER[0] || 'mortal';
    if (player.realm && typeof player.realm === 'string')
        return player.realm;
    const id = getPlayerRealmId(player) || 1;
    return cultivationRealms_1.REALM_ORDER[id - 1] || cultivationRealms_1.REALM_ORDER[0] || 'mortal';
}
