import WEAPONS from '../data/weapons';
import { isWeaponClaimed, claimWeapon } from './UniqueWeaponRegistry';

export type SpawnFilter = {
  category?: string;
  maxRarity?: number; // numeric rarity weight ceiling (lower = rarer)
  allowSecret?: boolean; // whether to include secretArea items
  requireQuestAllowed?: boolean; // include questRequired items
};

function weightForRarity(rarity: string): number {
  switch ((rarity || '').toLowerCase()) {
    case "H": return 60;
    case "G": return 25;
    case "F": return 10;
    case "D": return 4;
    case 'unique': return 1;
    default: return 10;
  }
}

export function listAvailableWeapons(filter?: SpawnFilter) {
  const allowSecret = !!filter?.allowSecret;
  const requireQuest = !!filter?.requireQuestAllowed;

  return WEAPONS.filter((raw: any) => {
    const w: any = raw as any;
    if (filter?.category && w.category && w.category !== filter.category) return false;
    if (!allowSecret && w.secretArea) return false;
    if (!requireQuest && w.questRequired) return false;
    if (w.rarity === 'Unique' && isWeaponClaimed(w.id)) return false;
    if (filter?.maxRarity && w.rarity) {
      const weight = weightForRarity(w.rarity);
      if (weight > filter.maxRarity) return false;
    }
    return true;
  });
}

import { randInt, getRng } from '../utils/rng';

export function sampleWeapon(filter?: SpawnFilter, rng?: () => number) {
  const pool = listAvailableWeapons(filter);
  if (!pool.length) return null;

  const weights = pool.map((w: any) => weightForRarity((w as any).rarity));
  const total = weights.reduce((a, b) => a + b, 0);
  const rngFn = rng || getRng();
  let pick = randInt(total, { rng: rngFn });
  for (let i = 0; i < pool.length; i++) {
    pick -= weights[i];
    if (pick < 0) {
    const chosen = pool[i] as any;
      // If unique, mark claimed
  if ((chosen as any).rarity === 'Unique') claimWeapon(chosen.id);
      return chosen;
    }
  }
  return pool[pool.length - 1];
}

export function registerWeaponClaim(id: string) {
  // For external usage: attempt to claim a unique weapon (returns false if already claimed)
  return claimWeapon(id);
}

export default {
  listAvailableWeapons,
  sampleWeapon,
  registerWeaponClaim
};
