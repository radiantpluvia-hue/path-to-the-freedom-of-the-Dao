"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealmHelpers = getRealmHelpers;
exports.getRealmKeyFromPlayerSync = getRealmKeyFromPlayerSync;
exports.clearRealmHelpersCache = clearRealmHelpersCache;
exports.costForNextRealm = costForNextRealm;
exports.canAdvanceRealm = canAdvanceRealm;
let _realmHelpers = null;
async function getRealmHelpers() {
    if (_realmHelpers)
        return _realmHelpers;
    try {
        const mod = await Promise.resolve().then(() => __importStar(require('./realmHelpers')));
        _realmHelpers = mod;
        return _realmHelpers;
    }
    catch (e) {
        return null;
    }
}
// Synchronous fallback: attempt to use cached module, otherwise use a best-effort shim
function getRealmKeyFromPlayerSync(player) {
    if (_realmHelpers && typeof _realmHelpers.getRealmKeyFromPlayer === 'function') {
        return _realmHelpers.getRealmKeyFromPlayer(player);
    }
    // Best-effort fallback: prefer explicit 'realm' field, then 'realmId' mapping by name
    if (!player)
        return 'unknown';
    if (typeof player.realm === 'string' && player.realm.length)
        return player.realm;
    if (typeof player.realmId === 'number')
        return String(player.realmId);
    return 'unknown';
}
function clearRealmHelpersCache() {
    _realmHelpers = null;
}
// Provide small pure helpers here so UI code can import them without pulling in the heavy module
function costForNextRealm(currentRealmId) {
    const baseCost = 10;
    const scalingFactor = 1.5;
    return Math.floor(baseCost * Math.pow(scalingFactor, currentRealmId - 1));
}
function canAdvanceRealm(player) {
    const currentRealmId = Number(player?.realmId ?? player?.realm ?? 1) || 1;
    const requiredInsight = costForNextRealm(currentRealmId);
    return (player?.insightPoints || 0) >= requiredInsight;
}
