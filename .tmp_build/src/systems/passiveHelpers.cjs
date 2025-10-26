"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devSafe = exports.removeHook = exports.addHook = exports.revertStatDeltas = exports.applyStatDeltas = exports.safeInc = void 0;
const logger_1 = require("../utils/logger");
const safeInc = (obj, path, delta) => {
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const k = path[i];
        if (cur[k] == null || typeof cur[k] !== 'object')
            cur[k] = {};
        cur = cur[k];
    }
    const leaf = path[path.length - 1];
    const prev = Number(cur[leaf] || 0);
    cur[leaf] = prev + delta;
};
exports.safeInc = safeInc;
const applyStatDeltas = (player, passiveId, deltas) => {
    player._autoApplied = { ...(player._autoApplied || {}) };
    if (player._autoApplied[passiveId])
        return; // idempotent
    player._autoApplied[passiveId] = { ...(deltas || {}) };
    Object.keys(deltas || {}).forEach((k) => {
        // apply to stats if path matches
        if (k === 'cultivationSpeed') {
            (0, exports.safeInc)(player, ['stats', 'cultivationSpeed'], deltas[k]);
        }
        else if (['atk', 'def', 'speed'].includes(k)) {
            (0, exports.safeInc)(player, ['stats', k], deltas[k]);
        }
        else {
            // store other numeric fields directly
            (0, exports.safeInc)(player, [k], deltas[k]);
        }
    });
};
exports.applyStatDeltas = applyStatDeltas;
const revertStatDeltas = (player, passiveId) => {
    if (!(player._autoApplied && player._autoApplied[passiveId]))
        return;
    const applied = player._autoApplied[passiveId] || {};
    Object.keys(applied).forEach((k) => {
        const v = applied[k];
        if (k === 'cultivationSpeed') {
            (0, exports.safeInc)(player, ['stats', 'cultivationSpeed'], -v);
        }
        else if (['atk', 'def', 'speed'].includes(k)) {
            (0, exports.safeInc)(player, ['stats', k], -v);
        }
        else {
            (0, exports.safeInc)(player, [k], -v);
        }
    });
    delete player._autoApplied[passiveId];
    if (player._autoApplied && Object.keys(player._autoApplied).length === 0)
        delete player._autoApplied;
};
exports.revertStatDeltas = revertStatDeltas;
const addHook = (player, event, id, fn) => {
    player._passiveHooks = { ...(player._passiveHooks || {}) };
    const list = player._passiveHooks[event] || [];
    // avoid adding duplicate id entries
    if (list.some((it) => it.id === id))
        return;
    player._passiveHooks[event] = [...list, { id, fn }];
};
exports.addHook = addHook;
const removeHook = (player, event, id) => {
    if (!(player._passiveHooks && Array.isArray(player._passiveHooks[event])))
        return;
    player._passiveHooks[event] = player._passiveHooks[event].filter((h) => h.id !== id);
    if (player._passiveHooks[event].length === 0)
        delete player._passiveHooks[event];
    if (Object.keys(player._passiveHooks).length === 0)
        delete player._passiveHooks;
};
exports.removeHook = removeHook;
const devSafe = (fn) => {
    return (...args) => {
        try {
            return fn(...args);
        }
        catch (e) {
            const err = e;
            const msg = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
            logger_1.logger.warn('Passive hook error:', msg);
        }
    };
};
exports.devSafe = devSafe;
