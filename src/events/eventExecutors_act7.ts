/* eslint-disable no-restricted-imports -- event executors may import combat config for heuristics */
import { GameState, EventExecutor } from "../../utils/types";
import { roll } from '../utils/rng';
import { computeCombatPower } from '../systems/combatConfig';

export const act7EventExecutors: Record<string, EventExecutor> = {
  // Example event executor structure
  "act7_event_1": (state: GameState) => {
    // Example: Discover hidden celestial manual
  const item = {
    id: "celestial_manual",
    name: "Celestial Manual",
    quantity: 1,
    qty: 1,
    description: 'An illustrious celestial manual that hums with cosmic power; grants potent stat boosts or a unique passive.',
    meta: { type: "manual", rarity: "D" },
    effects: { cultivationSpeed: 1.5, atk: 25 },
    passiveId: 'celestial_insight'
  } as any;
  state.player.inventory.push(item);
    return state;
  },
  "act7_event_2": (state: GameState) => {
    // Example: Great Sect Tournament duel — use centralized combat power
     
    // Use direct import for computeCombatPower; fallback to a simple heuristic if missing
    const playerPower = (typeof computeCombatPower === 'function') ? computeCombatPower(state.player) : (state.player.stats?.atk || 50);
  const rivalPower = Math.floor(playerPower * 0.95);
  const win = roll(state) * playerPower > rivalPower;
    if (win) {
      // Add contribution points if the property exists
      if ('contributionPoints' in state.player) {
        (state.player as any).contributionPoints += 500;
      }
    } else {
      const stats = (state.player.stats = state.player.stats || { hp: 100, qi: 0, atk: 0, def: 0, speed: 0 } as any);
      const maxHp = stats.hp || 100;
      stats.hp = Math.max(0, (stats.hp || 0) - Math.floor(maxHp * 0.15));
    }
    return state;
  },
  // Fill in remaining events as no-op stubs for now
  ...Object.fromEntries(
    Array.from({ length: 28 }, (_, i) => [`act7_event_${i + 3}`, (state: GameState) => state])
  )
};
