import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';

// Mock localStorage for Node.js environment (jest)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('SaveLoadSystem narrative snapshot round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should include narrativeSnapshot when narrativeEngine is present in systems', () => {
    const fakeGameState: any = {
      player: {},
      world: {},
      story: {},
      ui: {},
      systems: {
        narrativeEngine: {
          karmaHistory: [{ reason: 'test', value: 1 }],
          destinyThreads: [{ id: 'thread1', strength: 5 }],
          legacyRemnants: [{ id: 'rem1' }],
          heavenlyDaoInsights: [{ insight: 'fate' }]
        }
      }
    };

    const ok = SaveLoadSystem.saveGame(fakeGameState);
    expect(ok).toBe(true);

    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.narrativeSnapshot).toBeDefined();
    const snap = (loaded as any).narrativeSnapshot;
    expect(Array.isArray(snap.karmaHistory)).toBe(true);
    expect(snap.karmaHistory.length).toBe(1);
    expect(snap.karmaHistory[0].reason).toBe('test');
    expect(Array.isArray(snap.destinyThreads)).toBe(true);
    expect(snap.destinyThreads[0].id).toBe('thread1');
  });

  test('should provide defaults when narrativeSnapshot missing in older saves', () => {
    // Simulate older save with no narrativeSnapshot
    const legacySave = {
      gameState: { player: {}, world: {}, story: {}, ui: {}, systems: {} },
      gameVersion: '0.9.0',
      timestamp: Date.now()
    } as any;

    localStorage.setItem('cultivation_game_save', JSON.stringify(legacySave));
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.narrativeSnapshot).toBeDefined();
    const snap = (loaded as any).narrativeSnapshot;
    expect(Array.isArray(snap.karmaHistory)).toBe(true);
    expect(Array.isArray(snap.destinyThreads)).toBe(true);
    expect(Array.isArray(snap.legacyRemnants)).toBe(true);
    expect(Array.isArray(snap.heavenlyDaoInsights)).toBe(true);
  });
});
