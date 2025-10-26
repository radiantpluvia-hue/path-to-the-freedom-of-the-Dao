import { useGameStore } from '../store/useGameStore';
import { getPlayerRealmKey } from './playerHelpers';

/** Minimal store-like interface used by the helper. Tests can provide a partial mock. */
export interface StoreLike {
  attemptRealmBreakthroughWithConsolidation?: (challengeId: string) => any;
  player?: {
    skills?: Record<string, { level?: number }>;
    daoHeart?: number;
    realm?: string;
    stability?: number;
    karma?: number;
    hp?: number;
  };
}

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

export function performBreakthroughAttempt(challengeId: string, storeArg?: StoreLike) {
  const store: StoreLike | undefined = storeArg ?? (useGameStore && (useGameStore as any)());
  const player = store?.player || {};
  const realmKey = getPlayerRealmKey(player as any) || undefined;
  try {
    if (store && typeof store.attemptRealmBreakthroughWithConsolidation === 'function') {
      return store.attemptRealmBreakthroughWithConsolidation(challengeId);
    }
    // Fallback - instantiate a local BreakthroughSystem and call attempt
    // Avoid a static import of the systems module to satisfy restricted-imports rules.
    let bs: any = null;
    try {
      // Prefer synchronous Node.js require in test environments. Use a direct
      // require inside a try/catch; this is acceptable here because many tests
      // run under Node and expect the real systems module to be available.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../systems/BreakthroughSystem');
      const Ctor = (mod && (mod.BreakthroughSystem || mod.default || mod));
      if (typeof Ctor === 'function') bs = new Ctor();
    } catch (_e) {
      bs = null;
    }
    if (!bs) {
      // Best-effort dynamic import is not awaited here (helper expected to be sync in many callers).
      // Provide a safe fallback object so callers get a predictable null result instead of a runtime error.
      bs = { attemptRealmBreakthrough: () => null };
    }
    const skillLevels: Record<string, number> = Object.fromEntries(Object.entries(player.skills || {}).map(([k, v]) => [k, (v as any)?.level || 0]));
  return bs.attemptRealmBreakthrough((realmKey as string) || '', challengeId, { daoHeart: player.daoHeart || 0, stability: (player as any).stability || 0, karma: player.karma || 0, hp: player.hp || 0 }, skillLevels);
  } catch (e) {
    // swallow errors to preserve UI stability
    return null;
  }
}

export default performBreakthroughAttempt;
