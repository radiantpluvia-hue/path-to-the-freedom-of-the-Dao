import { GameState, EventExecutor } from "../../utils/types";

export const act7EventExecutors: Record<string, EventExecutor> = {
  // Example event executor structure
  "act7_event_1": (state: GameState) => {
    // Example: Discover hidden celestial manual
  const item = { id: "celestial_manual", name: "Celestial Manual", quantity: 1, meta: { type: "manual", rarity: "legendary" } } as any;
  // some older code expects `qty` — mirror for compatibility
  item.qty = 1;
  state.player.inventory.push(item);
    return state;
  },
  "act7_event_2": (state: GameState) => {
    // Example: Great Sect Tournament duel — use centralized combat power
     
    let computeCombatPower: ((e: any) => number) | null = null;
    try {
      // runtime require to avoid module cycles in some build setups
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      computeCombatPower = require('../systems/combatConfig').computeCombatPower;
    } catch (e) {
      computeCombatPower = null;
    }

    const playerPower = computeCombatPower ? computeCombatPower(state.player) : (state.player.stats?.atk || 50);
    const rivalPower = Math.floor(playerPower * 0.95);
    const win = Math.random() * playerPower > rivalPower;
    if (win) {
      // Add contribution points if the property exists
      if ('contributionPoints' in state.player) {
        (state.player as any).contributionPoints += 500;
      }
    } else {
      const maxHp = state.player.stats?.hp || 100;
      state.player.stats.hp = Math.max(0, state.player.stats.hp - Math.floor(maxHp * 0.15));
    }
    return state;
  },
  // Fill in remaining events as no-op stubs for now
  ...Object.fromEntries(
    Array.from({ length: 28 }, (_, i) => [`act7_event_${i + 3}`, (state: GameState) => state])
  )
};
