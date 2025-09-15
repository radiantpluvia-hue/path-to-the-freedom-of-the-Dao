import { getUITierLabel } from './skills';

export type Formation = {
  id: string;
  name: string;
  tier: number; // reuse skill tiers
  description?: string;
  // formation effects: simple modifiers
  atkMult?: number;
  defMult?: number;
  speedMult?: number;
  disablesPassives?: boolean; // formations can suppress passives
};

// generate 50 formations
export const FORMATION_CATALOG: Formation[] = (() => {
  const formations: Formation[] = [];
  const total = 50;
  const roots = ['Heavenly', 'Earthly', 'Shadow', 'Dragon', 'Phoenix', 'Star', 'Azure', 'Gloom'];
  for (let i = 1; i <= total; i++) {
    // ensure tier is 1..10
    const rawTier = (Math.floor((i - 1) / (total / 10)) + 1);
    const tier = Math.min(10, Math.max(1, rawTier));
    const root = roots[i % roots.length];
    const id = `formation_${i}`;
  const tierName = getUITierLabel(tier as any) || 'Grade';
  const name = `${tierName} ${root} Array ${i}`;
  // stronger multipliers to reflect grand cultivation arrays
  const atkMult = 1 + (tier - 1) * 0.15;
  const defMult = 1 + Math.max(0, (tier - 2)) * 0.10;
  const speedMult = 1 + (tier >= 4 ? 0.08 : 0);
  const disablesPassives = i % 7 === 0; // some arrays disrupt passive imprints
  const desc = `${name}: an arranged cultivation array woven with ${root.toLowerCase()} intent. It reshapes qi flow to ${atkMult > 1 ? 'amplify attacks' : 'stabilize the body'}.`;
  formations.push({ id, name, tier, description: desc, atkMult, defMult, speedMult, disablesPassives });
  }
  return formations;
})();

export function getFormationById(id: string) {
  return FORMATION_CATALOG.find(f => f.id === id);
}
