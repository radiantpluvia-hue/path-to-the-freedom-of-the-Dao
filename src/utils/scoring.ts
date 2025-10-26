// File: src/utils/scoring.ts
import { HEAVENLY_RANKING } from '../config/heavenlyDao';
import type { HeavenlyRankEntry } from '../types/heavenly';

// Note: adjust entity interface based on your game models.
export interface ScoringEntity {
  id: string;
  name: string;
  type: string;
  realm: string;
  combatPowerRaw: number; // raw numeric combat power (big numbers ok, convert to Number carefully)
  providence?: number; // raw providence points
  karmicMerit?: number;
  karmicDebt?: number;
  bloodlineMultiplier?: number; // multiplicative hooks (default 1)
  physiqueMultiplier?: number;  // multiplicative hooks (default 1)
}

const alpha = HEAVENLY_RANKING.COMPRESSION_ALPHA;

export function computePowerScore(entity: ScoringEntity): number {
  const base = Math.max(0, Number(entity.combatPowerRaw) || 0);
  // compression (avoid negative/0 issues)
  const compressed = base <= 0 ? 0 : Math.pow(base, alpha);
  const mod = (entity.bloodlineMultiplier ?? 1) * (entity.physiqueMultiplier ?? 1);
  return compressed * mod;
}

export function computeProvidenceScore(entity: ScoringEntity): number {
  const raw = Math.max(0, Number(entity.providence) || 0);
  // slight compression so very large providence doesn't dominate
  return raw <= 0 ? 0 : Math.pow(raw, 0.9);
}

export function computeKarmaScore(entity: ScoringEntity): number {
  const deeds = Math.max(0, Number((entity as any).karmicMerit) || 0);
  const sins = Math.max(0, Number((entity as any).karmicDebt) || 0);
  const value = Math.pow(deeds, 0.9) - Math.pow(sins, 0.8);
  return Math.max(0, value);
}

export function computeComposite(power: number, prov: number, karma: number): number {
  const wP = HEAVENLY_RANKING.POWER_WEIGHT;
  const wPr = HEAVENLY_RANKING.PROVIDENCE_WEIGHT;
  const wK = HEAVENLY_RANKING.KARMA_WEIGHT;
  return wP * power + wPr * prov + wK * karma;
}

export function makeEntryFromEntity(entity: ScoringEntity): HeavenlyRankEntry {
  const p = computePowerScore(entity);
  const pr = computeProvidenceScore(entity);
  const k = computeKarmaScore(entity);
  const composite = computeComposite(p, pr, k);
  return {
    id: entity.id,
    name: entity.name,
    type: (entity.type as any) || 'npc',
    realm: entity.realm,
    powerScore: p,
    providenceScore: pr,
    karmaScore: k,
    compositeScore: composite,
    lastUpdated: Date.now(),
    notableAction: null,
  };
}

export default {
  computePowerScore,
  computeProvidenceScore,
  computeKarmaScore,
  computeComposite,
  makeEntryFromEntity,
};
