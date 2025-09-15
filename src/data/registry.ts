import { WEAPONS } from './weapons';
import { PASSIVES } from './passives';
import { ACTIVE_ABILITIES } from './skills/more_active_abilities';
import { FORMATIONS } from './formations';
import { ALL_MANUALS } from './manuals';

// Simple, safe registry getters. Consumers should import from this file to avoid
// using project root alias imports and to have a single place to control exposures.
export function getWeapons() {
  return WEAPONS;
}

export function getWeaponById(id: string) {
  return WEAPONS.find((w) => w.id === id) || null;
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

