// BreakthroughChallenge: three-stance minigame skeleton

export type Stance = 'Focus' | 'Defy' | 'Flow';

export type BreakthroughOptions = {
  stance?: Stance;
  physiqueModifiers?: number; // additive modifier
  worldModifiers?: number; // additive modifier
  stanceBonus?: number; // additional bonus for chosen stance
};

export type BreakthroughResult = {
  success: boolean;
  chance: number;
  roll: number;
  reward?: any;
  penalty?: any;
};

// Simple event emitter hooks for UI or systems to subscribe
const listeners: { success: Array<(data: any) => void>; fail: Array<(data: any) => void> } = { success: [], fail: [] };

import { roll } from '../utils/rng';

export const breakthroughChallenge = {
  computeChance(baseChance: number, opts?: BreakthroughOptions) {
    const stanceBonus = opts?.stanceBonus || (opts?.stance === 'Focus' ? 0.05 : opts?.stance === 'Defy' ? 0.03 : 0.04);
    const phys = opts?.physiqueModifiers || 0;
    const world = opts?.worldModifiers || 0;
    // random noise is not applied here; left to resolve function so tests can mock Math.random
    const chance = Math.max(0, Math.min(1, baseChance + stanceBonus + phys + world));
    return chance;
  },

  attemptBreakthrough(baseChance: number, opts?: BreakthroughOptions & { autoResolve?: boolean }) : BreakthroughResult {
    const chance = this.computeChance(baseChance, opts);
  const r = roll();
  const success = r < chance;
  const result: BreakthroughResult = { success, chance, roll: r };
    if (success) {
      // simple reward structure
      result.reward = { realmGain: 1, vision: 'glimpse' };
      for (const l of listeners.success) try { l(result); } catch(e){/*ignore*/}
    } else {
      result.penalty = { qiLoss: 5 };
      for (const l of listeners.fail) try { l(result); } catch(e){/*ignore*/}
    }
    return result;
  },

  onSuccess(cb: (data: any) => void) { listeners.success.push(cb); return () => { const i = listeners.success.indexOf(cb); if (i >= 0) listeners.success.splice(i,1); }; },
  onFail(cb: (data: any) => void) { listeners.fail.push(cb); return () => { const i = listeners.fail.indexOf(cb); if (i >= 0) listeners.fail.splice(i,1); }; },

  // UI hook stub: returns a promise resolving to BreakthroughResult; UI can implement modal and call attemptBreakthrough
  showBreakthroughModal(sessionData: any, opts?: any): Promise<BreakthroughResult> {
    // For now auto-resolve if opts.autoResolve is true or UI not present
    const baseChance = sessionData && sessionData.baseChance != null ? sessionData.baseChance : 0.5;
    const result = this.attemptBreakthrough(baseChance, opts);
    return Promise.resolve(result);
  }
};
