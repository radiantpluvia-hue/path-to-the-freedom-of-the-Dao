let _realmHelpers: any = null;

export async function getRealmHelpers(): Promise<any> {
  if (_realmHelpers) return _realmHelpers;
  try {
    const mod = await import('./realmHelpers');
    _realmHelpers = mod;
    return _realmHelpers;
  } catch (e) {
    return null;
  }
}

// Synchronous fallback: attempt to use cached module, otherwise use a best-effort shim
export function getRealmKeyFromPlayerSync(player: any): string {
  if (_realmHelpers && typeof _realmHelpers.getRealmKeyFromPlayer === 'function') {
    return _realmHelpers.getRealmKeyFromPlayer(player);
  }
  // Best-effort fallback: prefer explicit 'realm' field, then 'realmId' mapping by name
  if (!player) return 'unknown';
  if (typeof player.realm === 'string' && player.realm.length) return player.realm;
  if (typeof player.realmId === 'number') return String(player.realmId);
  return 'unknown';
}

export function clearRealmHelpersCache() {
  _realmHelpers = null;
}

// Provide small pure helpers here so UI code can import them without pulling in the heavy module
export function costForNextRealm(currentRealmId: number): number {
  const baseCost = 10;
  const scalingFactor = 1.5;
  return Math.floor(baseCost * Math.pow(scalingFactor, currentRealmId - 1));
}

export function canAdvanceRealm(player: any): boolean {
  const currentRealmId = Number(player?.realmId ?? player?.realm ?? 1) || 1;
  const requiredInsight = costForNextRealm(currentRealmId);
  return (player?.insightPoints || 0) >= requiredInsight;
}
