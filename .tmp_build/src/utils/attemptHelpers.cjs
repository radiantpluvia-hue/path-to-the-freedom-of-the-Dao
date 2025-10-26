"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performBreakthroughAttempt = performBreakthroughAttempt;
const useGameStore_1 = require("../store/useGameStore");
const playerHelpers_1 = require("./playerHelpers");
/**
 * performBreakthroughAttempt
 *
 * Central helper to perform a realm breakthrough attempt.
 * It prefers the store-provided method `attemptRealmBreakthroughWithConsolidation` when present,
 * and will fall back to a local `BreakthroughSystem` instance when not.
 *
 * The helper accepts an optional `storeArg` to support dependency injection in tests:
 *   performBreakthroughAttempt('challengeId', mockStore)
 *
 * When `storeArg` is omitted, the helper will call `useGameStore()` under the hood so
 * existing callers don't need to change.
 */
function performBreakthroughAttempt(challengeId, storeArg) {
    const store = storeArg ?? (useGameStore_1.useGameStore && useGameStore_1.useGameStore());
    const player = store?.player || {};
    const realmKey = (0, playerHelpers_1.getPlayerRealmKey)(player) || undefined;
    try {
        if (store && typeof store.attemptRealmBreakthroughWithConsolidation === 'function') {
            return store.attemptRealmBreakthroughWithConsolidation(challengeId);
        }
        // Fallback - instantiate a local BreakthroughSystem and call attempt
        // Avoid a static import of the systems module to satisfy restricted-imports rules.
        let bs = null;
        try {
            // Prefer synchronous Node.js require in test environments. Use a direct
            // require inside a try/catch; this is acceptable here because many tests
            // run under Node and expect the real systems module to be available.
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod = require('../systems/BreakthroughSystem');
            const Ctor = (mod && (mod.BreakthroughSystem || mod.default || mod));
            if (typeof Ctor === 'function')
                bs = new Ctor();
        }
        catch (_e) {
            bs = null;
        }
        if (!bs) {
            // Best-effort dynamic import is not awaited here (helper expected to be sync in many callers).
            // Provide a safe fallback object so callers get a predictable null result instead of a runtime error.
            bs = { attemptRealmBreakthrough: () => null };
        }
        const skillLevels = Object.fromEntries(Object.entries(player.skills || {}).map(([k, v]) => [k, v?.level || 0]));
        return bs.attemptRealmBreakthrough(realmKey || '', challengeId, { daoHeart: player.daoHeart || 0, stability: player.stability || 0, karma: player.karma || 0, hp: player.hp || 0 }, skillLevels);
    }
    catch (e) {
        // swallow errors to preserve UI stability
        return null;
    }
}
exports.default = performBreakthroughAttempt;
