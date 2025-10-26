// Simple Relic registry to allow future dynamic behaviors (locking, claiming, world-unique checks)
// Currently just provides helpers parallel to weapons/accessories.
import { getRelics } from '../data/registry';
import { applyEquipmentBonuses, removeEquipmentBonuses } from './EquipmentSystem';
import type { EquipmentSlot } from './EquipmentSystem';
import { applyPassiveToPlayer } from './passiveRegistry';

// Equipment bridge types kept lightweight to avoid circular imports
interface EquipmentLikeItem {
  id: string; name: string; slot: EquipmentSlot; description?: string; stats?: Record<string, number>; passives?: string[];
}

export function listRelics() {
  return getRelics();
}

export function findRelic(id: string) {
  return getRelics().find(r => r.id === id) || null;
}

// Placeholder for future unique-claim logic if needed
const claimed: Set<string> = new Set();
export function isRelicClaimed(id: string) { return claimed.has(id); }
export function claimRelic(id: string) { if (claimed.has(id)) return false; claimed.add(id); return true; }
export function releaseRelic(id: string) { claimed.delete(id); }

export function getRelicRegistryState() { return { claimed: Array.from(claimed) }; }
export function loadRelicRegistryState(state: { claimed: string[] }) { claimed.clear(); state?.claimed?.forEach(id => claimed.add(id)); }

// Map relic stat keys to canonical player stat keys used by equipment system
const STAT_KEY_MAP: Record<string,string> = { atk: 'attack', def: 'defense', hp: 'maxHp', qi: 'qiMax', crit: 'critChance' };

export function relicToEquipment(relicId: string): EquipmentLikeItem | null {
  const relic = findRelic(relicId);
  if (!relic) return null;
  const stats: Record<string, number> = {};
  if (relic.stats) {
    Object.entries(relic.stats).forEach(([k,v]) => {
      const mapped = STAT_KEY_MAP[k] || k;
      stats[mapped] = (stats[mapped] || 0) + (v || 0);
    });
  }
  // slot mapping: weapon -> mainHand, armor -> armor, accessory -> accessory1 (caller may choose alt)
  const slot = relic.slot === 'weapon' ? 'mainHand' : relic.slot === 'armor' ? 'armor' : 'accessory1';
  return { id: relic.id, name: relic.name, description: relic.description, slot, stats, passives: relic.passives || [] };
}

// Convenience: attempt to equip a relic directly onto a provided player object (mutative pattern avoided; returns new player)
export function equipRelicOnPlayer(player: any, relicId: string): any {
  const eq = relicToEquipment(relicId);
  if (!eq) return player;
  try {
  let p = { ...player };
    // Enforce mythic relic equip conflict rule: only one mythic relic at a time
    try {
      const relic = findRelic(relicId);
      if (relic && relic.rarity === 'Mythic') {
        // Scan existing equipped items for any other mythic relic ids
        const allRelics = listRelics();
        const mythicIds = new Set(allRelics.filter(r => r.rarity === 'Mythic').map(r => r.id));
        // Equipment entries have id == relic.id when converted
        const equippedRelicIds = Object.values(p.equipment || {}).map((it: any) => it && it.id).filter((id: any) => mythicIds.has(id));
        if (equippedRelicIds.length && !equippedRelicIds.includes(relic.id)) {
          // Conflict: already have a different mythic relic equipped; reject equip
            return player; // unchanged
        }
      }
    } catch { /* non-fatal */ }
    const slot = eq.slot;
    const previous = p.equipment?.[slot] || null;
    if (previous) {
      p = removeEquipmentBonuses(p, previous);
    }
    // Ensure equipment container exists
    p.equipment = { ...(p.equipment || {}) };
    // Apply bonuses + passives
  p = applyEquipmentBonuses(p, eq);
    // Guarantee passiveIds tracking if passive system uses it
    (eq.passives || []).forEach((pid: string) => {
      if (!p.passiveIds) p.passiveIds = [];
      if (!p.passiveIds.includes(pid)) p.passiveIds.push(pid);
      // In case passive registry side-effects not yet applied
      try { p = applyPassiveToPlayer(p, pid); } catch (e) { /* ignore */ }
    });
    p.equipment[slot] = eq;
    claimRelic(relicId);
    return p;
  } catch {
    return player;
  }
}

// Helper to mark relic claimed & return reference (used by market / quest integration)
export function claimRelicAndGet(relicId: string) {
  claimRelic(relicId);
  return findRelic(relicId);
}

// Force-equip variant: if another Mythic relic is equipped, remove its bonuses and equip new relic.
export function forceEquipRelicReplacingMythic(player: any, relicId: string): any {
  const eq = relicToEquipment(relicId);
  if (!eq) return player;
  try {
  let p = { ...player };
    const relic = findRelic(relicId);
    if (relic && relic.rarity === 'Mythic') {
      // remove any other mythic relic bonuses currently equipped
      const allRelics = listRelics();
      const mythicIds = new Set(allRelics.filter(r => r.rarity === 'Mythic').map(r => r.id));
      for (const [slot, equippedRaw] of Object.entries(p.equipment || {})) {
        const equipped: any = equippedRaw as any;
        if (equipped && mythicIds.has(equipped.id) && equipped.id !== relic.id) {
          p = removeEquipmentBonuses(p, equipped);
          // clear the slot
          p.equipment = { ...(p.equipment || {}) };
          (p.equipment as any)[slot] = null;
        }
      }
    }

    // Now use existing equip flow (apply bonuses, passives)
    const slot = eq.slot;
    const previous = p.equipment?.[slot] || null;
    if (previous) {
      p = removeEquipmentBonuses(p, previous);
    }
    p.equipment = { ...(p.equipment || {}) };
    p = applyEquipmentBonuses(p, eq);
    (eq.passives || []).forEach((pid: string) => {
      if (!p.passiveIds) p.passiveIds = [];
      if (!p.passiveIds.includes(pid)) p.passiveIds.push(pid);
      try { p = applyPassiveToPlayer(p, pid); } catch (e) { /* ignore */ }
    });
    p.equipment[slot] = eq;
    claimRelic(relicId);
    return p;
  } catch {
    return player;
  }
}

// Expose runtime registry on globalThis for SaveLoadSystem and test injection fallbacks
try {
  const runtime = {
    listRelics,
    findRelic,
    isRelicClaimed,
    claimRelic,
    releaseRelic,
    getRelicRegistryState,
    loadRelicRegistryState,
    relicToEquipment,
    equipRelicOnPlayer,
    claimRelicAndGet,
    forceEquipRelicReplacingMythic
  } as any;
  (globalThis as any).relicRegistry = runtime;
  (globalThis as any).RelicRegistry = runtime;
} catch (e) { /* ignore in restricted environments */ }
