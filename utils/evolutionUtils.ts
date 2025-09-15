import { GameState } from './types';

// Cultivation helpers and breakthrough logic for the utils-based GameState
// Assumptions:
// - player.qi is cultivation progress toward next realm
// - player.stats.qi is combat resource (untouched here)
// - prefer `player.realmId` (numeric) where available; fall back to `player.realm` for legacy data

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function getRequiredQiForBreakthrough(currentRealm: number): number {
  const tier = clamp(currentRealm, 1, 10);
  return 100 * tier * tier; // Quadratic growth per realm
}

export function getCultivationGainPerDay(state: GameState, baseRate = 10): number {
  const talent = clamp(state.player.talent ?? 50, 0, 100) / 100; // default 50 -> +50%
  const dao = clamp(state.player.daoComprehension ?? 0, 0, 100) / 100; // up to +50%
  const multiplier = 1 + talent + (dao * 0.5);
  // Prefer numeric realmId, fall back to legacy numeric realm if present
  const currentRealmId = Number(state.player.realmId ?? state.player.realm ?? 1) || 1;
  const realmBonus = 1 + (Math.max(0, currentRealmId - 1) * 0.05); // +5% per realm above 1
  return Math.floor(baseRate * multiplier * realmBonus);
}

export function cultivate(state: GameState, days = 1, baseRate = 10): GameState {
  const gain = getCultivationGainPerDay(state, baseRate) * Math.max(1, days);
  return {
    ...state,
    player: {
      ...state.player,
      qi: (state.player.qi || 0) + gain,
    },
  };
}

export function tryBreakthrough(state: GameState): { success: boolean; state: GameState; reason?: string } {
  const currentRealm = Number(state.player.realmId ?? state.player.realm ?? 1) || 1;
  const needed = getRequiredQiForBreakthrough(currentRealm);
  const cur = state.player.qi || 0;

  if (currentRealm >= 10) return { success: false, state, reason: 'Already at highest realm.' };
  if (cur < needed) return { success: false, state, reason: `Insufficient qi: ${cur}/${needed}` };

  const nextRealm = currentRealm + 1;
  const statScale = 1 + (0.1 + currentRealm * 0.02);
  const stats = {
    ...state.player.stats,
    hp: Math.floor(state.player.stats.hp * statScale),
    atk: Math.floor(state.player.stats.atk * statScale),
    def: Math.floor(state.player.stats.def * statScale),
    speed: Math.floor(state.player.stats.speed * 1.05),
  };

  return {
    success: true,
    state: {
      ...state,
      player: {
        ...state.player,
        realmId: nextRealm,
        qi: cur - needed,
        stats,
      },
    },
  };
}

export const checkForEvolutions = (): string[] => {
  return [];
};
