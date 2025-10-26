import { SaveLoadSystem } from '@/systems/SaveLoadSystem';
import * as RelicRegistry from '@/systems/relicRegistry';

describe('Relic registry save/load persistence', () => {
  test('claimed relics persist through SaveLoadSystem snapshot', () => {
    // ensure clean
    RelicRegistry.loadRelicRegistryState({ claimed: [] });
    // claim one relic
    const sampleId = 'relic_mountain_oath_tablet';
    RelicRegistry.claimRelic(sampleId);
    expect(RelicRegistry.isRelicClaimed(sampleId)).toBe(true);

    // Prepare minimal game state snapshot for SaveLoadSystem
    const snapshot: any = { player: {}, world: {}, story: {}, ui: {}, systems: {} };
    SaveLoadSystem.saveGame(snapshot as any);

    // clear registry and then load from saved data
    RelicRegistry.loadRelicRegistryState({ claimed: [] });
    expect(RelicRegistry.isRelicClaimed(sampleId)).toBe(false);

    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    // SaveLoadSystem.loadGame already restores relic state during load
    expect(RelicRegistry.isRelicClaimed(sampleId)).toBe(true);
  });
});
