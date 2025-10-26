import { SaveLoadSystem } from '@/systems/SaveLoadSystem';
const UniqueWeaponRegistry = require('@/systems/UniqueWeaponRegistry');

describe('LifePhase snapshot persistence', () => {
  beforeEach(() => {
    try { localStorage.removeItem((SaveLoadSystem as any).SAVE_KEY); } catch (e) {}
    UniqueWeaponRegistry.loadRegistryState({ claimed: [] });
  });

  test('saves and loads lifePhaseSnapshot in save data', () => {
    const fakeLife = { currentPhase: { id: 'mortal', title: 'Mortal Start', events: [{ id: 'birth', title: 'Birth', description: 'You are born.' }] }, pastPhases: [] };
    const fakeGameState: any = { player: { name: 'tester' }, systems: { lifePhase: fakeLife } };

    const ok = SaveLoadSystem.saveGame(fakeGameState as any);
    expect(ok).toBe(true);

    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    expect((loaded as any).lifePhaseSnapshot || (loaded as any).gameState?.systems?.lifePhase).toBeDefined();
  });
});
