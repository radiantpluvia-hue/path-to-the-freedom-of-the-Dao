"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeRealmKeyFromId = computeRealmKeyFromId;
exports.setPlayerRealm = setPlayerRealm;
exports.applyRealmToPlayer = applyRealmToPlayer;
exports.normalizePlayerRealmInState = normalizePlayerRealmInState;
// Helpers to consistently set/sync player.realm and player.realmId
const cultivationRealms_1 = require("../data/cultivationRealms");
const playerHelpers_1 = require("./playerHelpers");
function computeRealmKeyFromId(id) {
    const idx = Math.max(0, (Number(id) || 1) - 1);
    return cultivationRealms_1.REALM_ORDER[idx] || cultivationRealms_1.REALM_ORDER[0];
}
// Pure setter: returns a shallow-cloned player with both realm and realmId set
function setPlayerRealm(player, realm) {
    if (!player)
        return player;
    const out = { ...player };
    if (realm === null || realm === undefined) {
        // leave as-is but ensure defaults exist
        out.realmId = out.realmId || (0, playerHelpers_1.getPlayerRealmId)(out);
        out.realm = out.realm || computeRealmKeyFromId(out.realmId);
        return out;
    }
    // numeric id (or numeric string)
    if (typeof realm === 'number' || (/^\d+$/.test(String(realm)))) {
        const id = Number(realm) || (0, playerHelpers_1.getPlayerRealmId)(out);
        out.realmId = id || 1;
        out.realm = computeRealmKeyFromId(out.realmId);
        return out;
    }
    // treat as string realm key
    const key = String(realm);
    out.realm = key;
    const idx = cultivationRealms_1.REALM_ORDER.indexOf(key);
    out.realmId = Math.max(1, idx >= 0 ? idx + 1 : ((0, playerHelpers_1.getPlayerRealmId)(out) || 1));
    return out;
}
// Mutation variant: mutate the player object in-place
function applyRealmToPlayer(player, realm) {
    if (!player)
        return;
    const updated = setPlayerRealm(player, realm);
    // copy fields back into original object (preserve identity)
    Object.keys(updated).forEach((k) => {
        player[k] = updated[k];
    });
}
// Normalize the player's realm fields inside a game state object
function normalizePlayerRealmInState(state) {
    if (!state || !state.player)
        return;
    const p = state.player;
    if ((p.realm === undefined || p.realm === null || p.realm === '') && (p.realmId === undefined || p.realmId === null)) {
        // No information: set defaults
        p.realmId = p.realmId || 1;
        p.realm = computeRealmKeyFromId(p.realmId);
        return;
    }
    if ((p.realm === undefined || p.realm === null || p.realm === '') && (p.realmId !== undefined && p.realmId !== null)) {
        p.realm = computeRealmKeyFromId(p.realmId);
        return;
    }
    if ((p.realmId === undefined || p.realmId === null) && p.realm) {
        const idx = cultivationRealms_1.REALM_ORDER.indexOf(p.realm);
        p.realmId = Math.max(1, idx >= 0 ? idx + 1 : ((0, playerHelpers_1.getPlayerRealmId)(p) || 1));
        return;
    }
}
exports.default = { setPlayerRealm, applyRealmToPlayer, normalizePlayerRealmInState };
