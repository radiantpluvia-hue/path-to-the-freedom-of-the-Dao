export type PassiveTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Passive = {
  id: string;
  name: string;
  tier: PassiveTier;
  description?: string;
  // simple flat stat modifications for now
  atk?: number;
  def?: number;
  hp?: number;
  qiMax?: number;
  apMax?: number;
  // percent-based modifiers (e.g., +10% atk)
  atkPct?: number;
  defPct?: number;
  speedPct?: number;
  // special effects represented by tags
  specialEffects?: string[];
  // source tags: 'bloodline' | 'physique' | 'manual' | 'item'
  source?: string;
};

// Programmatically generate 100 passives across tiers and sources
export const PASSIVE_CATALOG: Passive[] = (() => {
  const passives: Passive[] = [];
  const total = 100;
  const prefixes = ['Bloodline', 'Spirit', 'Sage', 'Trueform', 'Pill-refined', 'Ancestral', 'Heavenly', 'Soulbound', 'Meridian', 'Voidborn'];
  const effects = ['Endurance', 'Rage', 'Clarity', 'Vigor', 'Perception', 'Resolve', 'Fortitude', 'Swiftness'];
  const sources = ['bloodline', 'physique', 'manual'];
  for (let i = 1; i <= total; i++) {
    const tier = (Math.floor((i - 1) / (total / 8)) + 1) as PassiveTier;
    const prefix = prefixes[i % prefixes.length];
    const effect = effects[(i * 7) % effects.length];
    const source = sources[i % sources.length];
    const id = `passive_${i}`;
  const name = `${prefix} ${effect} ${i}`;
    // scale modestly by tier
  // amplify passive effects for stronger cultivation flavor
  const atk = Math.floor((tier >= 2 ? tier * 2 : 0) + (tier >= 6 ? 4 : 0));
  const def = Math.floor(tier * 1.5);
  const hp = Math.floor(tier * 40 + (i % 20));
  const qiMax = tier >= 4 ? Math.ceil(tier / 1.2) : 0;
  const apMax = tier >= 3 ? 1 + Math.floor(tier / 5) : 0;
  // occasionally give percent-based modifiers or special effects for variety
  const atkPct = i % 11 === 0 ? Math.round(5 + tier * 1) : undefined;
  const defPct = i % 13 === 0 ? Math.round(4 + tier * 1) : undefined;
  const speedPct = i % 17 === 0 ? Math.round(3 + Math.floor(tier / 2)) : undefined;
  const specialEffects = (i % 19 === 0) ? ['resonance_boost'] : undefined;
  const description = `(${source}) ${name}: a cultivation imprint that grants +${atk} ATK, +${def} DEF, and bolsters the body by +${hp} HP. ${atkPct ? `+${atkPct}% ATK.` : ''} Tier: ${tier}`;
  passives.push({ id, name, tier, atk, def, hp, qiMax, apMax, atkPct, defPct, speedPct, specialEffects, source, description });
  }
  return passives;
})();

export function getPassiveById(id: string) {
  return PASSIVE_CATALOG.find(p => p.id === id);
}
