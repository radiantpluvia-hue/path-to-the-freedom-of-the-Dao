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
exports.attemptTerritoryCapture = attemptTerritoryCapture;
exports.buildCaptureTransaction = buildCaptureTransaction;
exports.applyCaptureTransaction = applyCaptureTransaction;
exports.applyTerritoryInfluence = applyTerritoryInfluence;
exports.decayInfluence = decayInfluence;
exports.createDomain = createDomain;
exports.getDomainById = getDomainById;
exports.transferDomainOwnership = transferDomainOwnership;
exports.setRng = setRng;
exports.getRng = getRng;
const seededRng_1 = require("./seededRng");
let _impl = null;
try {
    // Try to resolve a runtime domainSystem implementation if present.
    // Use a Function-based require to avoid ESLint's no-var-requires complaints while
    // allowing synchronous resolution under Node/Jest.
    try {
        const nodeRequire = (typeof Function === 'function') ? Function('return require')() : null;
        if (nodeRequire) {
            const maybe = nodeRequire('../../utils/domainSystem');
            _impl = (maybe && (maybe.default || maybe)) || null;
        }
    }
    catch (eSync) {
        // ignore sync require failures and attempt dynamic import below
    }
    if (!_impl) {
        Promise.resolve().then(() => __importStar(require('../../utils/domainSystem'))).then(m => { _impl = m || null; }).catch(() => { _impl = null; });
    }
}
catch (e) {
    _impl = null;
}
function attemptTerritoryCapture(gs, territoryId, threshold, commit, funding, forceParams) {
    if (_impl && typeof _impl.attemptTerritoryCapture === 'function')
        return _impl.attemptTerritoryCapture(gs, territoryId, threshold, commit, funding, forceParams);
    // Fallback deterministic implementation for tests
    const preview = buildCaptureTransaction(gs, territoryId, threshold, funding, forceParams);
    if (!preview)
        return null;
    if (commit) {
        return applyCaptureTransaction(gs, preview);
    }
    return preview;
}
function buildCaptureTransaction(gs, territoryId, threshold, funding, forceParams) {
    if (_impl && typeof _impl.buildCaptureTransaction === 'function')
        return _impl.buildCaptureTransaction(gs, territoryId, threshold, funding, forceParams);
    // Fallback deterministic builder used by tests
    try {
        const territories = (gs && gs.world && gs.world.territories) || {};
        const territory = territories[territoryId];
        if (!territory)
            return null;
        const influence = territory.influence || {};
        const entries = Object.entries(influence).map(([k, v]) => [k, Number(v || 0)]);
        if (entries.length === 0)
            return null;
        let total = entries.reduce((s, e) => s + e[1], 0);
        if (total <= 0)
            total = 1;
        // pick attacker as highest share; tie -> favor current owner
        entries.sort((a, b) => b[1] - a[1]);
        let attacker = entries[0][0];
        if (entries.length > 1 && Math.abs(entries[0][1] - entries[1][1]) < 1e-9) {
            // tie -> favor owner if present
            if (typeof territory.ownerFactionId === 'string' && territory.ownerFactionId)
                attacker = territory.ownerFactionId;
        }
        const foundEntry = entries.find(e => e[0] === attacker);
        const attackerVal = foundEntry ? foundEntry[1] : (entries[0] ? entries[0][1] : 0);
        const share = attackerVal / total;
        const defense = territory.garrison && typeof territory.garrison.troops === 'number' ? territory.garrison.troops : 0;
        const requiredUpkeep = Math.max(0, Math.ceil(defense * 0.1));
        const ledger = {
            factionBefore: (gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury && typeof gs.world.factions[attacker].treasury.gold === 'number') ? gs.world.factions[attacker].treasury.gold : 0,
            playerBefore: (gs.player && typeof gs.player.yuan === 'number') ? gs.player.yuan : 0,
            garrisonBefore: defense
        };
        const tx = {
            territoryId,
            attackerFactionId: attacker,
            prevOwner: territory.ownerFactionId || null,
            share,
            defense,
            requiredUpkeep,
            funding: funding || 'normal',
            ledger
        };
        return tx;
    }
    catch (e) {
        return null;
    }
}
function applyCaptureTransaction(gs, tx) {
    if (_impl && typeof _impl.applyCaptureTransaction === 'function')
        return _impl.applyCaptureTransaction(gs, tx);
    // Fallback deterministic applier used by tests
    try {
        if (!tx || !tx.territoryId)
            return { success: false, reason: 'invalid_tx' };
        const territories = (gs && gs.world && gs.world.territories) || {};
        const territory = territories[tx.territoryId];
        if (!territory)
            return { success: false, reason: 'territory_missing' };
        const attacker = tx.attackerFactionId || tx.attacker || null;
        // Handle funding
        const required = typeof tx.requiredUpkeep === 'number' ? tx.requiredUpkeep : 0;
        if (tx.funding === 'normal' || !tx.funding) {
            if (attacker && gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury) {
                const f = gs.world.factions[attacker];
                const avail = typeof f.treasury.gold === 'number' ? f.treasury.gold : 0;
                const paid = Math.min(avail, required);
                f.treasury.gold = Math.max(0, avail - paid);
            }
        }
        else if (tx.funding === 'drain_player') {
            if (attacker && gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury) {
                const f = gs.world.factions[attacker];
                const paid = Math.min(typeof f.treasury.gold === 'number' ? f.treasury.gold : 0, required);
                f.treasury.gold = Math.max(0, (f.treasury.gold || 0) - paid);
                const remaining = required - paid;
                if (remaining > 0 && gs.player && typeof gs.player.yuan === 'number') {
                    const take = Math.min(gs.player.yuan, remaining);
                    gs.player.yuan = Math.max(0, gs.player.yuan - take);
                }
            }
            else if (gs.player && typeof gs.player.yuan === 'number') {
                const take = Math.min(gs.player.yuan, required);
                gs.player.yuan = Math.max(0, gs.player.yuan - take);
            }
        }
        else if (tx.funding === 'force_capture') {
            // apply attrition
            const mult = (tx.forceParams && typeof tx.forceParams.attritionMultiplier === 'number') ? tx.forceParams.attritionMultiplier : 1.0;
            if (territory.garrison && typeof territory.garrison.troops === 'number') {
                const before = territory.garrison.troops;
                const loss = Math.max(1, Math.floor(before * 0.3 * mult));
                territory.garrison.troops = Math.max(0, before - loss);
            }
            // reputation penalty
            if (gs.player && gs.player.reputation && typeof gs.player.reputation.world === 'number' && tx.forceParams && typeof tx.forceParams.reputationPenalty === 'number') {
                gs.player.reputation.world = Math.max(0, gs.player.reputation.world - tx.forceParams.reputationPenalty);
            }
        }
        // Change ownership
        territory.ownerFactionId = attacker;
        return { success: true };
    }
    catch (e) {
        return { success: false, reason: 'exception', error: String(e) };
    }
}
function applyTerritoryInfluence(gs, territoryId, factionId, amount) {
    if (_impl && typeof _impl.applyTerritoryInfluence === 'function')
        return _impl.applyTerritoryInfluence(gs, territoryId, factionId, amount);
    return false;
}
function decayInfluence(gs, territoryId, decayFactor) {
    if (_impl && typeof _impl.decayInfluence === 'function')
        return _impl.decayInfluence(gs, territoryId, decayFactor);
    return false;
}
function createDomain(gs, opts) {
    if (_impl && typeof _impl.createDomain === 'function')
        return _impl.createDomain(gs, opts);
    return null;
}
function getDomainById(gs, id) {
    if (_impl && typeof _impl.getDomainById === 'function')
        return _impl.getDomainById(gs, id);
    return null;
}
function transferDomainOwnership(gs, domainId, newOwnerFaction) {
    if (_impl && typeof _impl.transferDomainOwnership === 'function')
        return _impl.transferDomainOwnership(gs, domainId, newOwnerFaction);
    return false;
}
// Allow deterministic replay tooling to inject a runtime RNG into the full utils implementation if present
function setRng(rng) {
    if (_impl && typeof _impl.setRng === 'function') {
        try {
            _impl.setRng(rng);
            return;
        }
        catch (e) { /* ignore */ }
    }
    try {
        _impl.rng = rng;
    }
    catch (e) { /* ignore */ }
}
function getRng() {
    // Prefer an explicit getter on the implementation, then an `rng` field, then try to use a runtime seeded RNG helper
    if (_impl && typeof _impl.getRng === 'function') {
        try {
            const g = _impl.getRng();
            if (typeof g === 'function')
                return g;
        }
        catch (e) { /* ignore */ }
    }
    try {
        const maybe = _impl.rng;
        if (typeof maybe === 'function')
            return maybe;
    }
    catch (e) { /* ignore */ }
    // As a last resort, try to use a runtime seeded RNG helper if available in utils/seededRng
    try {
        if (typeof seededRng_1.runtimeRng === 'function')
            return seededRng_1.runtimeRng;
    }
    catch (e) { /* ignore */ }
    return Math.random;
}
exports.default = _impl;
