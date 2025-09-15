import { ALL_BLOODLINES } from '../data/bloodlines_fixed';
import { ALL_PHYSIQUES } from '../data/physiques';
import { getManuals } from '../data/registry';
import type { Manual } from '../types';
import { scaleBloodlineStats, scalePhysiqueStats, scaleCultivationSpeed, getRealmMultiplier, applyFinalStatScaling } from '../data/scalingSystem';

// Types kept simple to satisfy tests
export function calculateIntegratedStats(
  bloodlineId: string,
  physiqueId: string,
  manualIds: string[],
  realm: string
) {
  const b = ALL_BLOODLINES.find(x => x.id === bloodlineId);
  const p = ALL_PHYSIQUES.find(x => x.id === physiqueId);
  const ALL_MANUALS = getManuals();
  const manuals = manualIds
    .map(id => ALL_MANUALS.find(m => m.id === id))
    .filter((m): m is Manual => Boolean(m));

  const baseStats = { qi: 100, atk: 10, def: 10, hp: 100, speed: 10 } as Record<string, number>;

  if (b?.effects.stats) {
    // Convert StatEffect -> number (use base if provided)
    const bloodlineBase: Record<string, number> = {};
    Object.entries(b.effects.stats || {}).forEach(([k, v]: [string, any]) => {
      bloodlineBase[k] = typeof v === 'object' && v.base !== undefined ? v.base : v;
    });
    const bs = scaleBloodlineStats(bloodlineBase, realm);
    Object.entries(bs).forEach(([k, v]) => baseStats[k] = (baseStats[k] || 0) + v);
  }
  if (p?.effects.stats) {
    // Extract numeric base stats from StatEffect objects
    const physiqueBase: Record<string, number> = {};
    Object.entries(p.effects.stats || {}).forEach(([k, v]: [string, any]) => {
      physiqueBase[k] = typeof v === 'object' && v.base !== undefined ? v.base : v;
    });
    const ps = scalePhysiqueStats(physiqueBase, realm);
    Object.entries(ps).forEach(([k, v]) => baseStats[k] = (baseStats[k] || 0) + v);
  }
  let cultivationSpeed = 1.0;
  const physiqueSpeed = typeof p?.effects.cultivation_speed === 'number' ? p.effects.cultivation_speed : 0;
  cultivationSpeed += scaleCultivationSpeed(physiqueSpeed, realm);

  // Manual effects (only numeric additive fields common in tests)
  // Normalize manual effect keys and apply numeric additive effects. Supports both snake_case and camelCase keys.
  // Improved normalization: accept snake_case, camelCase, and some common aliases.
  const normalizeManualEffects = (m: Manual) => {
    const e = (m.effects || {}) as Record<string, any>;
    const out: Record<string, number> = {};

    const toCamel = (k: string) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    // Alias map: map common manual effect keys to canonical keys used in characterAdvancement
    const aliasMap: Record<string, string[]> = {
      qi: ['qi', 'qiGathering', 'qi_gathering'],
      atk: ['atk', 'attack'],
      def: ['def', 'defense'],
      hp: ['hp', 'health', 'hp_max'],
      cultivationSpeed: ['cultivationSpeed', 'cultivation_speed', 'cultivationRate'],
      daoHeart: ['daoHeart', 'dao_heart'],
      insight: ['insight'],
      speed: ['speed', 'speedPct', 'speed_pct']
    };

    // Normalize numeric entries directly present
    Object.entries(e).forEach(([k, v]) => {
      const ck = toCamel(k);
      if (typeof v === 'number') out[ck] = v;
    });

    // Also consider aliases (if an alias exists and not already set)
    Object.entries(aliasMap).forEach(([canon, aliases]) => {
      if (out[canon]) return; // already set by direct mapping
      for (const a of aliases) {
        const aCamel = toCamel(a);
        if (typeof e[a] === 'number') { out[canon] = e[a]; break; }
        if (typeof (e as any)[aCamel] === 'number') { out[canon] = (e as any)[aCamel]; break; }
      }
    });

    return out;
  };

  manuals.forEach(m => {
    const effects = normalizeManualEffects(m);
    ['atk','def','hp','qi','cultivationSpeed','daoHeart','insight','speed'].forEach(key => {
      const v = effects[key];
      if (typeof v === 'number') {
        if (key === 'cultivationSpeed') {
          // cultivationSpeed stacks additively into the cultivationSpeed accumulator
          cultivationSpeed += v * getRealmMultiplier(realm);
        } else {
          baseStats[key] = (baseStats[key] || 0) + v * getRealmMultiplier(realm);
        }
      }
    });
    // If manuals influence cultivation speed via a different key (e.g., cultivation_speed), it's now normalized above.
  });

  // Apply a final centralized scaling pass to remaining stats that were not already scaled upstream.
  const finalStats = applyFinalStatScaling(baseStats, realm);

  const specialAbilities = [
    ...(b?.effects.special || []),
    ...(p?.effects.special || []),
    ...manuals.flatMap(m => (m.effects as any)?.special || [])
  ];

  return {
    baseStats: finalStats,
    cultivationSpeed,
    specialAbilities,
  };
}

export function getRecommendedCombinations() {
  // Simple recommendation: pick first items with non-empty specials
  const bloodline = ALL_BLOODLINES.find((b: any) => (b.effects.special || []).length > 0) || ALL_BLOODLINES[0];
  const physique = ALL_PHYSIQUES.find(p => (p.effects.special || []).length > 0) || ALL_PHYSIQUES[0];
  const manual = getManuals()[0];
  return [{
    bloodlineId: bloodline.id,
    physiqueId: physique.id,
    manualIds: [manual.id],
    synergy: 1,
    description: `Synergy of ${bloodline.name}, ${physique.name}, and ${manual.name}`
  }];
}

export function canAwakenBloodline(bloodlineId: string, realm: string, qi: number): boolean {
  const b = ALL_BLOODLINES.find((x: any) => x.id === bloodlineId);
  if (!b) return false;
  const req = b.awakening_requirements || {} as any;
  const realmOk = !req.realm || req.realm === realm;
  const qiOk = !req.qi || qi >= req.qi;
  return !!(realmOk && qiOk);
}