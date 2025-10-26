/**
 * Simple in-memory registry to track globally-unique weapon spawns (artifacts).
 * Provides helpers to serialize/deserialize state for integration with save/load.
 */
const claimed = new Set<string>();

export function isWeaponClaimed(id: string): boolean {
  return claimed.has(id);
}

export function claimWeapon(id: string): boolean {
  if (claimed.has(id)) return false;
  claimed.add(id);
  return true;
}

export function releaseWeapon(id: string): boolean {
  return claimed.delete(id);
}

export function getRegistryState(): { claimed: string[] } {
  return { claimed: Array.from(claimed) };
}

export function loadRegistryState(state: { claimed?: string[] } | null | undefined): void {
  claimed.clear();
  if (!state || !Array.isArray(state.claimed)) return;
  for (const id of state.claimed) claimed.add(id);
}

export default {
  isWeaponClaimed,
  claimWeapon,
  releaseWeapon,
  getRegistryState,
  loadRegistryState
};
