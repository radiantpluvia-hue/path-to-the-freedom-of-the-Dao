// Helpers to consistently set/sync player.realm and player.realmId
import { REALM_ORDER } from '../data/cultivationRealms';
import { getPlayerRealmId } from './playerHelpers';

export function computeRealmKeyFromId(id: number): string {
  const idx = Math.max(0, (Number(id) || 1) - 1);
  return REALM_ORDER[idx] || REALM_ORDER[0];
}

// Pure setter: returns a shallow-cloned player with both realm and realmId set
export function setPlayerRealm(player: any, realm: string | number): any {
  if (!player) return player;
  const out = { ...player };
  if (realm === null || realm === undefined) {
    // leave as-is but ensure defaults exist
    out.realmId = out.realmId || getPlayerRealmId(out);
    out.realm = out.realm || computeRealmKeyFromId(out.realmId);
    return out;
  }
  // numeric id (or numeric string)
  if (typeof realm === 'number' || (/^\d+$/.test(String(realm)))) {
    const id = Number(realm) || getPlayerRealmId(out);
    out.realmId = id || 1;
    out.realm = computeRealmKeyFromId(out.realmId);
    return out;
  }

  // treat as string realm key
  const key = String(realm);
  out.realm = key;
  const idx = REALM_ORDER.indexOf(key);
  out.realmId = Math.max(1, idx >= 0 ? idx + 1 : (getPlayerRealmId(out) || 1));
  return out;
}

// Mutation variant: mutate the player object in-place
export function applyRealmToPlayer(player: any, realm: string | number): void {
  if (!player) return;
  const updated = setPlayerRealm(player, realm);
  // copy fields back into original object (preserve identity)
  Object.keys(updated).forEach((k) => {
    (player as any)[k] = (updated as any)[k];
  });
}

// Normalize the player's realm fields inside a game state object
export function normalizePlayerRealmInState(state: any): void {
  if (!state || !state.player) return;
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
    const idx = REALM_ORDER.indexOf(p.realm);
    p.realmId = Math.max(1, idx >= 0 ? idx + 1 : (getPlayerRealmId(p) || 1));
    return;
  }
}

export default { setPlayerRealm, applyRealmToPlayer, normalizePlayerRealmInState };
