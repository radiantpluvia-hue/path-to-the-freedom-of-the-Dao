"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealmIdFromPlayer = getRealmIdFromPlayer;
exports.getRealmKeyFromId = getRealmKeyFromId;
exports.getRealmKeyFromPlayer = getRealmKeyFromPlayer;
exports.normalizeGameStateRealm = normalizeGameStateRealm;
const cultivationRealms_1 = require("../data/cultivationRealms");
function getRealmIdFromPlayer(player) {
    // Prefer numeric realmId; fall back to numeric legacy 'realm' when present
    const id = Number(player?.realmId ?? player?.realm ?? 0) || 0;
    return id || 1;
}
function getRealmKeyFromId(realmId) {
    if (!realmId || realmId <= 0)
        return cultivationRealms_1.REALM_ORDER[0];
    return cultivationRealms_1.REALM_ORDER[realmId - 1] || cultivationRealms_1.REALM_ORDER[0];
}
function getRealmKeyFromPlayer(player) {
    // If the player has a realm key string in `realm`, prefer it when not numeric
    if (player?.realm && typeof player.realm === 'string')
        return player.realm;
    return getRealmKeyFromId(getRealmIdFromPlayer(player));
}
function normalizeGameStateRealm(gameState) {
    return {
        realmId: getRealmIdFromPlayer(gameState.player),
        realmKey: getRealmKeyFromPlayer(gameState.player)
    };
}
