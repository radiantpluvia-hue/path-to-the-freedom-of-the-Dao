import { GameState, HeavensListEntry } from "../../utils/types";

export interface RankConfig {
  combatWeight: number;
  karmaWeight: number;
  fameWeight?: number;
  maxEntries?: number;
}

const DEFAULT_CFG: RankConfig = { combatWeight: 0.8, karmaWeight: 0.2, fameWeight: 0.02, maxEntries: 100 };

export function scoreEntity(e: HeavensListEntry, cfg: RankConfig = DEFAULT_CFG): number {
  const fame = e.fame ?? 0;
  return e.combatPower * cfg.combatWeight + e.karma * cfg.karmaWeight + fame * (cfg.fameWeight ?? 0);
}

export function buildHeavensList(candidates: HeavensListEntry[], cfg: RankConfig = DEFAULT_CFG): HeavensListEntry[] {
  const sorted = [...candidates].sort((a, b) => {
    const sa = scoreEntity(a, cfg);
    const sb = scoreEntity(b, cfg);
    if (sb !== sa) return sb - sa;
    if ((b.karma ?? 0) !== (a.karma ?? 0)) return (b.karma ?? 0) - (a.karma ?? 0);
    if ((b.fame ?? 0) !== (a.fame ?? 0)) return (b.fame ?? 0) - (a.fame ?? 0);
    return a.name.localeCompare(b.name);
  }).slice(0, cfg.maxEntries ?? 100);

  return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function setHeavensList(state: GameState, list: HeavensListEntry[]): GameState {
  state.world.heavensList = list;
  return state;
}
