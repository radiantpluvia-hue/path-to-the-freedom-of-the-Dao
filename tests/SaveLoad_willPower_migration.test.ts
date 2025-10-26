import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';

describe('SaveLoadSystem willPower migration', () => {
  const key = (SaveLoadSystem as any).SAVE_KEY;

  afterEach(() => {
    try { localStorage.removeItem(key); } catch (e) {}
  });

  test('backfills willPower from spiritStones when missing', () => {
    const legacySave = {
      gameVersion: '0.9.0',
      timestamp: Date.now(),
      gameState: {
        player: {
          name: 'Legacy',
          spiritStones: { low: 2, mid: 1, high: 0 },
          // willPower intentionally missing
        },
        world: { year: 1, day: 1, tick: 0 },
        story: { currentAct: 'act1' },
        ui: {},
        systems: {}
      }
    } as any;

    localStorage.setItem(key, JSON.stringify(legacySave));

    const loaded = SaveLoadSystem.loadGame({ preserveRaw: true }) as any;
    expect(loaded).not.toBeNull();
    expect(loaded.migrated).toBeDefined();
    const migrated = loaded.migrated as any;
    expect(migrated.gameState.player.willPower).toBe(2 + 1 * 5 + 0 * 25);
  });
});
