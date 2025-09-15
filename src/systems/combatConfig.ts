// Central combat scaling wrapper — Phase-1 conservative wrapper around existing scalingSystem
import * as scaling from '../data/scalingSystem';
import { PlaytestScaling } from '../utils/playtestScaling';

export const getRealmMultiplier = scaling.getRealmMultiplier;
export const scaleManualEffects = scaling.scaleManualEffects;
export const applyFinalStatScaling = scaling.applyFinalStatScaling;
export const getRarityMultiplier = scaling.getRarityMultiplier;
export const STAT_SCALING = scaling.STAT_SCALING;

// computeCombatPower: small, stable wrapper used by various systems that need a single-number
// combat power metric. This intentionally mirrors the lightweight calculation used around the
// codebase: a weighted sum of stats with optional playtest overrides.
export function computeCombatPower(entity: any, opts: { includeKarma?: boolean } = {}) {
  const e = entity || {};
  // base: hp, atk, def, qi, speed — fallbacks to 0 to be safe
  const hp = (e.stats && e.stats.hp) || e.hp || 0;
  const atk = (e.stats && e.stats.atk) || e.atk || 0;
  const def = (e.stats && e.stats.def) || e.def || 0;
  const qi = (e.stats && e.stats.qi) || e.qi || 0;
  const speed = (e.stats && e.stats.speed) || e.speed || 0;
  const daoHeart = (e.daoHeart) || (e.stats && e.stats.daoHeart) || 0;

  // Default weights chosen to be compatible with existing heuristics in the repo
  const weights = {
    hp: 0.2,
    atk: 0.4,
    def: 0.25,
    qi: 0.05,
    speed: 0.05,
    daoHeart: 0.001,
  };

  let base = hp * weights.hp + atk * weights.atk + def * weights.def + qi * weights.qi + speed * weights.speed + daoHeart * weights.daoHeart;

  // legacy fields sometimes include combatPower; prefer explicit computed value but allow manual override
  if (typeof e.combatPower === 'number' && e._preferEntityCombatPower) {
    base = e.combatPower;
  }

  // playtest hook: if playtest mode sets a global combat power multiplier, apply it here.
  try {
    if (PlaytestScaling && typeof PlaytestScaling.isEnabled === 'function' && PlaytestScaling.isEnabled()) {
      if (typeof PlaytestScaling.getCombatPowerMultiplier === 'function') {
        const m = PlaytestScaling.getCombatPowerMultiplier();
        if (isFinite(m) && m > 0) base = base * m;
      }
    }
  } catch (err) {
    // Defensive: don't let playtest helper errors break runtime behavior
    // (e.g., when running in environments that stub or partially load the helper)
  }

  // optionally include karma/fame lightly
  if (opts.includeKarma && typeof e.karma === 'number') {
    base += e.karma * 0.1;
  }

  // ensure non-negative and round
  const computed = Math.max(0, Math.round(base));
  return computed;
}

// Small helper: an offensive 'prowess' heuristic used in combat tie-breakers and realm-gap
// adjustments. Mirrors the previous local heuristics: atk + 0.5 * speed.
export function computeOffensiveProwess(entity: any) {
  const atk = (entity && entity.stats && entity.stats.atk) || entity.atk || 0;
  const speed = (entity && entity.stats && entity.stats.speed) || entity.speed || 0;
  return atk + (speed * 0.5);
}

export default {
  getRealmMultiplier,
  scaleManualEffects,
  applyFinalStatScaling,
  getRarityMultiplier,
  computeCombatPower,
  computeOffensiveProwess,
  STAT_SCALING,
};
// Centralized configuration for combat environment modifiers
export type Terrain = 'mountain' | 'forest' | 'desert' | 'city' | 'sect_grounds';
export type Weather = 'clear' | 'rain' | 'storm' | 'fog';

export interface EnvMultiplier { atk: number; def: number; dmg: number }

export const TERRAIN_MULTIPLIERS: Record<Terrain, EnvMultiplier> = {
  mountain: { atk: 1.05, def: 1.05, dmg: 1.0 },
  forest: { atk: 0.95, def: 1.05, dmg: 1.0 },
  desert: { atk: 1.1,  def: 1.0,  dmg: 1.0 },
  city: { atk: 1.0,  def: 1.0,  dmg: 1.0 },
  sect_grounds: { atk: 1.0,  def: 1.1,  dmg: 1.0 },
};

export const WEATHER_MULTIPLIERS: Record<Weather, EnvMultiplier> = {
  clear: { atk: 1.0, def: 1.0, dmg: 1.0 },
  rain:  { atk: 1.0, def: 1.0, dmg: 0.95 },
  storm: { atk: 1.0, def: 1.0, dmg: 1.1 },
  fog:   { atk: 0.9, def: 1.0, dmg: 1.0 },
};