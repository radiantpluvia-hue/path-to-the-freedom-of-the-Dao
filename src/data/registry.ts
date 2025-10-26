import { WEAPONS } from './weapons';
import { RELICS } from './relics';
import { PASSIVES } from './passives';
import { ACTIVE_ABILITIES } from './skills/more_active_abilities';
import { FORMATIONS } from './formations';
import { ALL_MANUALS } from './manuals';

// Simple, safe registry getters. Consumers should import from this file to avoid
// using project root alias imports and to have a single place to control exposures.
export function getWeapons() {
  return WEAPONS;
}

export function getRelics() {
  return RELICS;
}

export function getWeaponById(id: string) {
  return WEAPONS.find((w) => w.id === id) || null;
}

// Legacy alias expected by some tests
export function getRelicById(id: string) {
  return RELICS.find((r) => r.id === id) || null;
}

export function getPassives() {
  return PASSIVES;
}

export function getPassiveById(id: string) {
  return PASSIVES.find((p) => p.id === id) || null;
}

export function getActiveAbilities() {
  return ACTIVE_ABILITIES;
}

export function getActiveAbilityById(id: string) {
  return ACTIVE_ABILITIES.find((a) => a.id === id) || null;
}

export function getFormations() {
  return FORMATIONS;
}

export function getFormationById(id: string) {
  return FORMATIONS.find((f) => f.id === id) || null;
}

export function getManuals() {
  return ALL_MANUALS;
}

export function getManualById(id: string) {
  return ALL_MANUALS.find((m) => m.id === id) || undefined;
}

// Synchronously merge generated passives/abilities into the static arrays.
// Tests call this during Jest setup to ensure generated content is available
// via the Registry getters (which read PASSIVES / ACTIVE_ABILITIES).
export async function loadGeneratedPassivesNow() {
  try {
    // Prefer dynamic import to satisfy lint rules and work in ESM/bundlers
    const gp: any = await import('./generated/passives.generated');
    const ga: any = await import('./generated/activeAbilities.generated');
    const generatedPassives = (gp && (gp.GENERATED_PASSIVES || gp.default)) || [];
    const generatedAbilities = (ga && (ga.default || ga.GENERATED_ABILITIES)) || [];

    // Merge passives if not already present
    for (const p of generatedPassives) {
      try {
        if (!PASSIVES.find((x) => x.id === p.id)) PASSIVES.push(p);
      } catch (e) { /* ignore malformed entries */ }
    }
    // Merge active abilities
    for (const a of generatedAbilities) {
      try {
        if (!ACTIVE_ABILITIES.find((x) => x.id === a.id)) ACTIVE_ABILITIES.push(a);
      } catch (e) { /* ignore malformed entries */ }
    }
  } catch (_err) {
    // swallow: generated content is optional
  }
}

export default {
  getWeapons,
  getWeaponById,
  getPassives,
  getPassiveById,
  getActiveAbilities,
  getActiveAbilityById,
  getFormations,
  getFormationById,
  getManuals,
  getManualById,
};

// Named export alias for legacy callers
// legacy alias removed - use getRelics()/getRelicById for relic-specific lookups

// Minimal Registry object for legacy bootstrap and systems that expect a Registry API.
export const Registry = {
  _map: {} as Record<string, any>,
  register(namespace: string, data: any) {
    this._map[namespace] = data;
  },
  get(namespace: string) {
    return this._map[namespace];
  }
};

