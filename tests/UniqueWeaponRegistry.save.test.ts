import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';
// Use require to avoid TS import timing issues in tests
const UniqueWeaponRegistry = require('../src/systems/UniqueWeaponRegistry');

describe('UniqueWeaponRegistry save/load integration', () => {
  beforeEach(() => {
    // clear localStorage to avoid cross-test contamination
    try { localStorage.removeItem((SaveLoadSystem as any).SAVE_KEY); } catch (e) {}
    UniqueWeaponRegistry.loadRegistryState({ claimed: [] });
  });

  test('claimed unique persists across save/load', () => {
    // claim a fake unique id
    const id = 'esoteric_ruyi_jingu_bang';
    expect(UniqueWeaponRegistry.isWeaponClaimed(id)).toBe(false);
    const claimed = UniqueWeaponRegistry.claimWeapon(id);
    expect(claimed).toBe(true);
    expect(UniqueWeaponRegistry.isWeaponClaimed(id)).toBe(true);

    // build minimal fake game state
    const fakeGameState: any = { player: { name: 'test' }, world: { day: 1 } };
    // call save
    const ok = SaveLoadSystem.saveGame(fakeGameState as any);
    expect(ok).toBe(true);

    // reset registry, then load
    UniqueWeaponRegistry.loadRegistryState({ claimed: [] });
    expect(UniqueWeaponRegistry.isWeaponClaimed(id)).toBe(false);

    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();

    // after load, registry should have been populated
    expect(UniqueWeaponRegistry.isWeaponClaimed(id)).toBe(true);
  });
});
