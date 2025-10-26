// Minimal equipment system utilities: define slots and helpers to apply/remove equipment bonuses
export const EQUIPMENT_SLOTS = ['mainHand','offHand','armor','accessory1','accessory2','mount','companion','innerCore'] as const;
export type EquipmentSlot = typeof EQUIPMENT_SLOTS[number];

export interface EquipmentItem {
  id: string;
  name: string;
  description?: string;
  slot: EquipmentSlot;
  stats?: Record<string, number>; // additive stat bonuses
  passives?: string[]; // passive ids for later wiring
  bloodlineBonus?: Record<string, number>; // optional bloodline-specific bonuses keyed by bloodline id
}

export function defaultEquipmentSnapshot() {
  const obj: Record<string, any> = {};
  EQUIPMENT_SLOTS.forEach(s => obj[s] = null);
  return obj as Record<EquipmentSlot, EquipmentItem | null>;
}

import * as PassiveRegistry from './passiveRegistry';

export function applyEquipmentBonuses(player: any, item: EquipmentItem | null) {
  if (!item) return player;
  let p = { ...player } as any;
  // apply stat bonuses
  if (item.stats) {
    p.stats = { ...(p.stats || {}) };
    Object.entries(item.stats).forEach(([k, v]) => {
      p.stats[k] = (p.stats[k] || 0) + Number(v || 0);
    });
  }
  // apply passives if present
  if (Array.isArray(item.passives)) {
    item.passives.forEach(pid => {
      p = PassiveRegistry.applyPassiveToPlayer(p, pid);
    });
  }
  return p;
}

export function removeEquipmentBonuses(player: any, item: EquipmentItem | null) {
  if (!item) return player;
  let p = { ...player } as any;
  // remove stat bonuses
  if (item.stats) {
    p.stats = { ...(p.stats || {}) };
    Object.entries(item.stats).forEach(([k, v]) => {
      p.stats[k] = (p.stats[k] || 0) - Number(v || 0);
    });
  }
  // remove passives if present
  if (Array.isArray(item.passives)) {
    item.passives.forEach(pid => {
      p = PassiveRegistry.removePassiveFromPlayer(p, pid);
    });
  }
  return p;
}

export default {
  EQUIPMENT_SLOTS,
  defaultEquipmentSnapshot,
  applyEquipmentBonuses,
  removeEquipmentBonuses
};
