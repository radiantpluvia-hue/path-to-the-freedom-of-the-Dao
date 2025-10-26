// Conservative helpers to access legacy and normalized player realm fields.
// These avoid mass-replacing `player.realm` -> `player.realmId` and provide a
// single place to normalize access patterns. Do NOT mutate the player object
// unless `ensureRealmId` is explicitly called.
import type { PlayerState } from '../types';
import { REALM_ORDER } from '../data/cultivationRealms';

// Conservative helpers to access legacy and normalized player realm fields.
// These avoid mass-replacing `player.realm` -> `player.realmId` and provide a
// single place to normalize access patterns. Do NOT mutate the player object
// unless `ensureRealmId` is explicitly called.

export function getPlayerRealmId(player: Partial<PlayerState> | undefined | null): number | undefined {
  if (!player) return undefined;
  // Prefer explicit numeric realmId when present
  if (typeof (player as any).realmId === 'number') return (player as any).realmId;
  // Fallback: attempt to derive from legacy `realm` string if it maps to a number
  const r = (player as any).realm;
  if (typeof r === 'number') return r; // some legacy saves used numbers in `realm`
  if (typeof r === 'string') {
    // Common legacy mapping: 'mortal' -> 1, 'cultivator' -> 2 etc. Keep mapping minimal and conservative.
    const MAP: Record<string, number> = {
      mortal: 1,
      cultivator: 2,
      immortal: 10,
    };
    const lower = r.toLowerCase();
    if (lower in MAP) return MAP[lower];
  }
  return undefined;
}

export function ensureRealmId(player: Partial<PlayerState>): number {
  // If realmId exists, return it. Otherwise derive from legacy and set it.
  if (typeof (player as any).realmId === 'number') return (player as any).realmId;
  const derived = getPlayerRealmId(player) ?? 1;
  try { (player as any).realmId = derived; } catch (e) { /* ignore immutable objects */ }
  return derived;
}

export function getPlayerRealmKey(player: Partial<PlayerState> | undefined | null): string {
  if (!player) return REALM_ORDER[0] || 'mortal';
  if ((player as any).realm && typeof (player as any).realm === 'string') return (player as any).realm;
  const id = getPlayerRealmId(player) || 1;
  return REALM_ORDER[id - 1] || REALM_ORDER[0] || 'mortal';
}
