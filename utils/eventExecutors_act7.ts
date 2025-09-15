
import { GameState, EventExecutor } from "./types";

export const act7EventExecutors: Record<string, EventExecutor> = {
  // Example event executor structure
  "act7_event_1": (state: GameState) => {
    // Example: Discover hidden celestial manual
    state.player.inventory.push({ id: "celestial_manual", name: "Celestial Manual", qty: 1, meta: { type: "manual", rarity: "legendary" } });
    return state;
  },
  "act7_event_2": (state: GameState) => {
    // Example: Great Sect Tournament duel
    // Prefer centralized combat power metric when available; fall back to atk if not.
    let computeCombatPower: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      computeCombatPower = require('../src/systems/combatConfig').computeCombatPower;
    } catch (e) {
      try {
        // secondary fallback if built paths differ
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        computeCombatPower = require('../systems/combatConfig').computeCombatPower;
      } catch (e2) {
        computeCombatPower = null;
      }
    }

    const playerPower = computeCombatPower ? computeCombatPower(state.player) : (state.player.stats?.atk || 50);
    // Keep previous approximate behavior: rival slightly weaker than player baseline
    const rivalPower = playerPower * 0.95;
    const win = Math.random() * playerPower > rivalPower;
    if (win) {
      // Add contribution points if the property exists
      if ('contributionPoints' in state.player) {
        (state.player as any).contributionPoints += 500;
      }
    } else {
      const maxHp = state.player.stats?.hp || 100;
      state.player.stats.hp = Math.max(0, state.player.stats.hp - maxHp * 0.15);
    }
    return state;
  },
  // Fill in remaining events as no-op stubs for now
  ...Object.fromEntries(
    Array.from({ length: 28 }, (_, i) => [`act7_event_${i + 3}`, (state: GameState) => state])
  )
};
