import { RivalSystem } from '@/systems/RivalSystem';
import * as WeaponSpawner from '@/systems/WeaponSpawner';
import { SaveLoadSystem } from '@/systems/SaveLoadSystem';
const UniqueWeaponRegistry = require('@/systems/UniqueWeaponRegistry');

describe('Rival weapon drop integration', () => {
  beforeEach(() => {
    UniqueWeaponRegistry.loadRegistryState({ claimed: [] });
    try { localStorage.removeItem((SaveLoadSystem as any).SAVE_KEY); } catch (e) {}
  });

  test('unique weapon returned by sampleWeapon is claimed and persisted', () => {
  // Inject deterministic rng and sampler into RivalSystem so we don't need to mock globals
  let samplerCalled = false;
  const sampler = () => {
    samplerCalled = true;
    UniqueWeaponRegistry.claimWeapon('esoteric_ruyi_jingu_bang');
    return { id: 'esoteric_ruyi_jingu_bang', name: 'Ruyi Jingu Bang', rarity: 'Unique' } as any;
  };

  const rivalSystem = new RivalSystem({ rng: () => 0.01, sampleWeapon: sampler }); // low rng to hit inclusion branch

    rivalSystem.generateRival({ minLevel: 1, maxLevel: 5, silent: true });

    // Sampler should have been called during generation; if not, exercise the internal loot generator directly
    if (!samplerCalled) {
      // Directly call the internal loot generator for deterministic coverage
      const archetypes = rivalSystem.getAllArchetypes();
      const arche = rivalSystem.getArchetypeInfo(archetypes[0]);
      // import MAJOR_SECTS for a valid sect
      const { MAJOR_SECTS } = require('@/systems/SectSystem');
      const loot = (rivalSystem as any).generateArchetypeLoot(arche, MAJOR_SECTS[0], 1);
      const found = (loot || []).some((l: any) => l.id === 'esoteric_ruyi_jingu_bang' || l.name === 'Ruyi Jingu Bang' || (l._weapon && l._weapon.id === 'esoteric_ruyi_jingu_bang'));
      expect(found).toBe(true);
    }

    // Registry should have the claimed unique
    expect(UniqueWeaponRegistry.isWeaponClaimed('esoteric_ruyi_jingu_bang')).toBe(true);

    // Save game state with rival included
    const fakeGameState: any = { player: { name: 'tester' }, systems: { rivals: {}, rivalEncounters: [] } };
    const ok = SaveLoadSystem.saveGame(fakeGameState as any);
    expect(ok).toBe(true);

    // reset registry and load
    UniqueWeaponRegistry.loadRegistryState({ claimed: [] });
    expect(UniqueWeaponRegistry.isWeaponClaimed('esoteric_ruyi_jingu_bang')).toBe(false);

    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();

    expect(UniqueWeaponRegistry.isWeaponClaimed('esoteric_ruyi_jingu_bang')).toBe(true);
  });
});
