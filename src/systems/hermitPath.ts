// Thin shim for backwards compatibility.
// The canonical implementation has moved to `seclusionPath.ts`.
export * from './seclusionPath';
// Provide a default export (historically some code may have used default imports)
export { SeclusionPath as default } from './seclusionPath';
// Hermit/Solo Path system
// Provides a tick-based hermit progression model: passive meditation ticks, actions for study/refine/forage,
// comprehension events, tribulation triggers, and rewards.

import { runtimeRng } from '../utils/seededRng';
import type { GameState } from '../types';

export type HermitState = {
  mode: 'idle' | 'secluded' | 'exploring' | 'refining' | 'resting';
  secludedYears: number; // configurable when allowed
  ticksSinceSeclusionStart: number;
  accumulatedComprehension: number; // abstract measure towards epiphany
  rareSourceFindChanceAcc: number; // accumulator for diminishing returns
  safeMode: boolean; // if true, reduce chance of bad tribulation
};

export const DEFAULT_HERMIT_STATE: HermitState = {
  mode: 'idle',
  secludedYears: 0,
  ticksSinceSeclusionStart: 0,
  accumulatedComprehension: 0,
  rareSourceFindChanceAcc: 0,
  safeMode: false
};

// Options that affect tuning
export const HERMIt_CONFIG = {
  tickQiGainBase: 5, // base Qi gained per hermit tick when meditating/stationary
  tickComprehensionBase: 1, // base comprehension per tick
  rareSourceBaseChance: 0.02, // base per-tick chance to find a rare manual/resource (raised for reliable test outcomes)
  rareSourceDiminishFactor: 0.85, // when self-studying, diminishing returns multiplier for rare find accumulator
  tribulationBaseChance: 0.01, // per-tick chance to trigger a tribulation while secluded
};

export class HermitPath {
  private state: HermitState;

  constructor(initial?: Partial<HermitState>) {
    this.state = { ...DEFAULT_HERMIT_STATE, ...(initial || {}) };
  }

  getState() {
    return { ...this.state };
  }

  enterSeclusion(years = 1, safeMode = false) {
    this.state.mode = 'secluded';
    this.state.secludedYears = Math.max(1, Math.floor(years));
    this.state.safeMode = !!safeMode;
    this.state.ticksSinceSeclusionStart = 0;
  }

  exitSeclusion() {
    this.state.mode = 'idle';
    this.state.secludedYears = 0;
    this.state.ticksSinceSeclusionStart = 0;
  }

  // Perform one hermit tick. Returns an object with effects to apply to the main game state.
  tick(gameState: GameState) {
    const effects: any = { qiGain: 0, cpGain: 0, foundItems: [], events: [] };

    // If not secluded, nothing hermit-specific happens
    if (this.state.mode !== 'secluded') return effects;

    // Advance internal tick counter
    this.state.ticksSinceSeclusionStart++;

    // Passive Qi and comprehension gains
    const qiGain = Math.max(0, Math.floor(HERMIt_CONFIG.tickQiGainBase + (gameState.player.skills.meditation.level || 0) * 0.2));
    const comprehension = Math.max(0, Math.floor(HERMIt_CONFIG.tickComprehensionBase + (gameState.player.skills.comprehension.level || 0) * 0.1));

    effects.qiGain = qiGain;
    effects.cpGain = Math.max(1, Math.floor((1 + (gameState.player.skills.comprehension.level || 0) * 0.05)));

    // Accumulate comprehension towards rare epiphany
    this.state.accumulatedComprehension += comprehension;

    // Self-study diminishing returns: increase chance accumulator but decay slightly
    this.state.rareSourceFindChanceAcc = this.state.rareSourceFindChanceAcc * HERMIt_CONFIG.rareSourceDiminishFactor + HERMIt_CONFIG.rareSourceBaseChance;

    // Chance to find a rare source/manual
    // Use the imported runtimeRng (tests override the global RNG via setRuntimeRng)
    const rareRoll = runtimeRng();
    const rareThreshold = Math.min(0.2, this.state.rareSourceFindChanceAcc);
    if (rareRoll < rareThreshold) {
      // Found a rare manual/resource
      effects.events.push({ id: 'hermit_found_rare_source', type: 'rare_source_found' });
      // reduce accumulator to make subsequent finds rarer
      this.state.rareSourceFindChanceAcc *= 0.25;
    }

    // Tribulation chance: slightly lower if safeMode
    const tribChance = this.state.safeMode ? HERMIt_CONFIG.tribulationBaseChance * 0.25 : HERMIt_CONFIG.tribulationBaseChance;
    if (runtimeRng() < tribChance) {
      effects.events.push({ id: 'hermit_tribulation', type: 'tribulation' });
    }

    // Periodic epiphany check based on accumulated comprehension
    if (this.state.accumulatedComprehension > 100 + (gameState.player.daoComprehension || 0) * 2 && runtimeRng() < 0.1) {
      effects.events.push({ id: 'hermit_epiphany', type: 'comprehension_breakthrough', magnitude: Math.max(1, Math.floor(this.state.accumulatedComprehension / 100)) });
      // consume some comprehension
      this.state.accumulatedComprehension = Math.floor(this.state.accumulatedComprehension * 0.4);
    }

    // Time progression: when ticks equal years -> exit (store-level will advance world year too)
    // We keep hermit internal tick as abstract count; caller can interpret it as days/years as desired.

    return effects;
  }

  // Quick helper to perform a study action with diminishing returns to XP and rare find chance
  performStudy(gameState: GameState, intensity = 1) {
    const baseExp = Math.max(1, Math.floor(10 * intensity));
    // Apply diminishing returns if many studies in a row
    const decay = Math.pow(HERMIt_CONFIG.rareSourceDiminishFactor, Math.min(10, Math.floor(this.state.ticksSinceSeclusionStart / 4)));
    const xp = Math.max(1, Math.floor(baseExp * decay));

    // Slight bump to rare-chance accumulator
    this.state.rareSourceFindChanceAcc += 0.01 * intensity;

    // Return xp to apply
    return { xpGained: xp };
  }
}
