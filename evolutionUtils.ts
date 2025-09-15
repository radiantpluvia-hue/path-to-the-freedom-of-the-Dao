import { GameState } from './utils/types';

// Cultivation helpers and breakthrough logic for the simple utils-based state
// Notes:
// - We treat player.qi as cultivation progress (used for breakthroughs)
// - We treat player.stats.qi as battle qi pool used elsewhere (left unchanged here)
// - Realm is a numeric tier: 1..10 (see src/data/realms.ts for string mapping)

// Clamp helper
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Base required qi grows quadratically with realm
export function getRequiredQiForBreakthrough(currentRealm: number): number {
  const tier = clamp(currentRealm, 1, 10);
  return 100 * tier * tier; // e.g., R1->R2 = 100, R2->R3 = 400, ..., R10->R11 = 10000
}

// Compute cultivation gain per day, factoring in talent (0–100) and daoComprehension
export function getCultivationGainPerDay(state: GameState, baseRate = 10): number {
  const talent = clamp(state.player.talent ?? 50, 0, 100) / 100; // default mid-talent
  const dao = clamp(state.player.daoComprehension ?? 0, 0, 100) / 100;
  // Talent up to +100%, dao up to +50%
  const multiplier = 1 + talent + (dao * 0.5);
  // Optional: higher realms cultivate a bit faster due to denser qi (small boost)
  const realmBonus = 1 + (Math.max(0, state.player.realm - 1) * 0.05); // +5% per realm above 1
  return Math.floor(baseRate * multiplier * realmBonus);
}

// Advance cultivation progress for N days
export function cultivate(state: GameState, days = 1, baseRate = 10): GameState {
  const gainPerDay = getCultivationGainPerDay(state, baseRate);
  const totalGain = gainPerDay * Math.max(1, days);
  return {
    ...state,
    player: {
      ...state.player,
      qi: (state.player.qi || 0) + totalGain,
    },
  };
}

// Attempt a breakthrough to the next realm if requirements are met
export function tryBreakthrough(state: GameState): { success: boolean; state: GameState; reason?: string } {
  const currentRealm = state.player.realm;
  const requiredQi = getRequiredQiForBreakthrough(currentRealm);
  const currentQi = state.player.qi || 0;

  if (currentRealm >= 10) {
    return { success: false, state, reason: 'Already at highest realm.' };
  }
  if (currentQi < requiredQi) {
    return { success: false, state, reason: `Insufficient qi: ${currentQi}/${requiredQi}` };
  }

  // Breakthrough succeeds. Reset cultivation qi, increase realm, and buff core stats slightly
  const nextRealm = currentRealm + 1;
  const statScale = 1 + (0.1 + currentRealm * 0.02); // grows with realm
  const newStats = {
    ...state.player.stats,
    hp: Math.floor(state.player.stats.hp * statScale),
    atk: Math.floor(state.player.stats.atk * statScale),
    def: Math.floor(state.player.stats.def * statScale),
    speed: Math.floor(state.player.stats.speed * (1 + 0.05)), // small universal speed boost
  };

  const updated: GameState = {
    ...state,
    player: {
      ...state.player,
      realm: nextRealm,
      qi: currentQi - requiredQi, // spent during breakthrough
      stats: newStats,
    },
  };

  return { success: true, state: updated };
}

// Placeholder remains (compat)
export const checkForEvolutions = (): string[] => {
  return [];
};