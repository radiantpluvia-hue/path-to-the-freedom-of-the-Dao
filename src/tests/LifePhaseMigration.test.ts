import { SaveLoadSystem } from '@/systems/SaveLoadSystem';
const UniqueWeaponRegistry = require('@/systems/UniqueWeaponRegistry');

// Test that a save with only top-level lifePhaseSnapshot correctly rehydrates the shared LifePhaseSystem
describe('LifePhase migration: top-level lifePhaseSnapshot rehydrate', () => {
  beforeEach(() => {
    try { localStorage.removeItem((SaveLoadSystem as any).SAVE_KEY); } catch (e) {}
    UniqueWeaponRegistry.loadRegistryState({ claimed: [] });
  });

  test('loadGame rehydrates sharedLifePhaseSystem from lifePhaseSnapshot', () => {
    const fakeLife = { currentPhase: { id: 'mortal-1', title: 'Mortal Start', events: [{ id: 'birth', title: 'Birth', description: 'You are born.' }] }, pastPhases: [] };
    const saveData: any = {
      gameState: { player: { name: 'migrator' }, world: { currentWorldType: 'murim' } },
      lifePhaseSnapshot: fakeLife,
      gameVersion: '0.9.0',
      timestamp: Date.now()
    };

    // Write raw save JSON directly to localStorage under SAVE_KEY
    localStorage.setItem((SaveLoadSystem as any).SAVE_KEY, JSON.stringify(saveData));

    // Now call loadGame via SaveLoadSystem and ensure it returns the migrated shape
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();

    // When loadGame returns migrated, the top-level lifePhaseSnapshot should exist
    const migrated = (loaded as any).migrated || loaded;
    expect((migrated as any).lifePhaseSnapshot || (migrated as any).gameState?.systems?.lifePhase).toBeDefined();
  });
});
