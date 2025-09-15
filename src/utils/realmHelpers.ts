// Helper utilities to normalize realm id / realm key access across the codebase
import { GameState } from '../types';
import { REALM_ORDER } from '../data/cultivationRealms';

export function getRealmIdFromPlayer(player: any): number {
  // Prefer numeric realmId; fall back to numeric legacy 'realm' when present
  const id = Number(player?.realmId ?? player?.realm ?? 0) || 0;
  return id || 1;
}

export function getRealmKeyFromId(realmId: number): string {
  if (!realmId || realmId <= 0) return REALM_ORDER[0];
  return REALM_ORDER[realmId - 1] || REALM_ORDER[0];
}

export function getRealmKeyFromPlayer(player: any): string {
  // If the player has a realm key string in `realm`, prefer it when not numeric
  if (player?.realm && typeof player.realm === 'string') return player.realm;
  return getRealmKeyFromId(getRealmIdFromPlayer(player));
}

export function normalizeGameStateRealm(gameState: GameState) {
  return {
    realmId: getRealmIdFromPlayer(gameState.player as any),
    realmKey: getRealmKeyFromPlayer(gameState.player as any)
  };
}
