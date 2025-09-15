import { getPassives, getPassiveById } from '../data/registry';
import { MAJOR_SECTS } from './SectSystem';

// Passive registry maps generated sect/manual passive ids (e.g., `${sect.id}_passive_1`) to actual Passive objects.
// We generate deterministic proxies by picking entries from PASSIVE_CATALOG and cloning them with sect-specific ids.

export const PASSIVE_REGISTRY: Record<string, any> = {};

function seedFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

// Build registry for each major sect using deterministic selection from PASSIVE_CATALOG
const PASSIVE_CATALOG = getPassives();

MAJOR_SECTS.forEach(sect => {
  const seed = seedFromString(sect.id);
  // create up to 6 passives per sect for safety
  for (let i = 1; i <= 6; i++) {
    const idx = (seed + i) % PASSIVE_CATALOG.length;
    const base = PASSIVE_CATALOG[idx];
    const id = `${sect.id}_passive_${i}`;
    // Make a bespoke manual passive by blending base values with sect flavor
    const bespoke = {
      ...base,
      id,
      name: `${sect.name} — ${base.name}`,
      source: 'manual',
      // amplify or attenuate some stats slightly to make manuals distinct
      atk: Math.max(0, Math.floor((base.atk || 0) + (sect.realm || 1) * 0.5 + i)),
      def: Math.max(0, Math.floor((base.def || 0) + (i % 3))),
      hp: Math.max(0, Math.floor((base.hp || 0) + (sect.power || 0) % 100)),
  atkPct: (base as any).atkPct ? Math.max(0, (base as any).atkPct + Math.floor(sect.realm / 2)) : (base as any).atkPct,
  defPct: (base as any).defPct ? Math.max(0, (base as any).defPct + Math.floor((i % 2))) : (base as any).defPct,
  specialEffects: Array.isArray((base as any).specialEffects) ? [...(base as any).specialEffects, `${sect.id}_flavor`] : [`${sect.id}_flavor`]
    };
    PASSIVE_REGISTRY[id] = bespoke;
  }
});

// Small helper used by tests to assert registry contents
export function _registryContains(id: string) {
  return Boolean(PASSIVE_REGISTRY[id]);
}

// Lookup: prefer explicit registry, then fall back to catalog
export function getPassiveDefinition(id: string) {
  if (!id) return undefined;
  if (PASSIVE_REGISTRY[id]) return PASSIVE_REGISTRY[id];
  return getPassiveById(id);
}

export default PASSIVE_REGISTRY;
