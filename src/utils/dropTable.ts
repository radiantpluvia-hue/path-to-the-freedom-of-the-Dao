import { getRng } from './rng';

export type DropEntry = { id: string; weight: number; qty?: number };
export type DropTable = DropEntry[];

// Simple weighted roll using runtimeRng() for determinism when seeded
export function rollDrop(table: DropTable, rng?: () => number) {
  const rfn = rng || getRng();
  const total = table.reduce((s, e) => s + (e.weight || 0), 0);
  if (total <= 0) return null;
  let pick = Math.abs(rfn()) * total;
  for (const e of table) {
    pick -= (e.weight || 0);
    if (pick <= 0) return { id: e.id, qty: e.qty || 1 };
  }
  // fallback to last
  const last = table[table.length - 1];
  return last ? { id: last.id, qty: last.qty || 1 } : null;
}

// Multi-tier drop tables
export const DROP_TABLES: Record<string, DropTable> = {
  tournament_common: [
    { id: 'spirit_stone_common', weight: 70, qty: 8 },
    { id: 'spirit_stone_mid', weight: 20, qty: 2 },
    { id: 'mysterious_gift', weight: 10, qty: 1 }
  ],
  tournament_rare: [
    { id: 'spirit_stone_mid', weight: 60, qty: 5 },
    { id: 'rare_manual_fragment', weight: 30, qty: 1 },
    { id: 'exquisite_gem', weight: 10, qty: 1 }
  ],
  tournament_high: [
    { id: 'rare_manual_fragment', weight: 60, qty: 1 },
    { id: 'exquisite_gem', weight: 30, qty: 1 },
    { id: 'ancient_relic', weight: 10, qty: 1 }
  ]
};

// Default and options helpers for UI
export const DEFAULT_TOURNAMENT_DROP = 'tournament_common';
export const TOURNAMENT_DROP_OPTIONS = Object.keys(DROP_TABLES);

export function rollFromTableName(name: string, rng?: () => number) {
  const t = DROP_TABLES[name];
  if (!t) return null;
  return rollDrop(t, rng);
}

