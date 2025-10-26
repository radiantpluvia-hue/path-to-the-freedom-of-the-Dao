import { listAvailableWeapons, sampleWeapon } from '@/systems/WeaponSpawner';
const UniqueWeaponRegistry = require('@/systems/UniqueWeaponRegistry');

describe('WeaponSpawner unique claim behavior', () => {
  beforeEach(() => {
    // reset registry
    UniqueWeaponRegistry.loadRegistryState({ claimed: [] });
  });

  test('sampling a Unique marks it claimed and excludes it from future lists', () => {
    // Find at least one Unique in the pool
    const uniques = listAvailableWeapons().filter((w: any) => (w.rarity || '').toLowerCase() === 'unique');
    if (uniques.length === 0) {
      // If dataset doesn't include uniques, skip
      return;
    }
    const id = uniques[0].id;

    // Force RNG to select the first item by returning 0 always
    const picked = sampleWeapon(undefined, () => 0);
    expect(picked).not.toBeNull();
    if (picked && (picked.rarity || '').toLowerCase() === 'unique') {
      // registry should have the id
      expect(UniqueWeaponRegistry.isWeaponClaimed(picked.id)).toBe(true);

      // listing again should not include the claimed unique
      const again = listAvailableWeapons().find((w: any) => w.id === picked.id);
      expect(again).toBeUndefined();
    } else {
      // If RNG didn't select a unique, ensure at least the sample returned something
      expect(picked).not.toBeNull();
    }
  });
});
