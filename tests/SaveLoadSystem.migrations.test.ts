import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';
import { MAX_RELEASED_ACT } from '../src/config/release';

// Minimal localStorage mock for Node environment (jest runs in Node)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

beforeEach(() => {
  localStorage.clear();
});

describe('SaveLoadSystem migrations', () => {
  test('non-ascended mortal save backfills murim', () => {
    const gs = {
      player: { realm: 'mortal' },
      // omit world to simulate older/partial save
    } as any;

    expect(SaveLoadSystem.saveGame(gs)).toBe(true);
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const world = (loaded as any).gameState.world;
    expect(world).toBeDefined();
    expect(world.currentWorldType).toBe('murim');
    expect(Boolean(world.ascended)).toBe(false);
  });

  test('player realm in ascensionRealms yields immortal and ascended=true', () => {
    const gs = {
      player: { realm: 'true_immortal' }
    } as any;

    expect(SaveLoadSystem.saveGame(gs)).toBe(true);
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const world = (loaded as any).gameState.world;
    expect(world).toBeDefined();
    expect(world.currentWorldType).toBe('immortal');
    expect(world.ascended).toBe(true);
  });

  test('world.ascended true coerces currentWorldType to immortal', () => {
    const gs = {
      player: { realm: 'mortal' },
      world: { ascended: true }
    } as any;

    expect(SaveLoadSystem.saveGame(gs)).toBe(true);
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const world = (loaded as any).gameState.world;
    expect(world).toBeDefined();
    expect(world.currentWorldType).toBe('immortal');
    expect(world.ascended).toBe(true);
  });

  test('clamps story.currentAct greater than MAX_RELEASED_ACT', () => {
    const gs = {
      player: { realm: 'mortal' },
      story: { currentAct: 'act999' }
    } as any;

    expect(SaveLoadSystem.saveGame(gs)).toBe(true);
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const currentAct = (loaded as any).gameState.story.currentAct;
    expect(typeof currentAct).toBe('string');
    const n = parseInt(String(currentAct).replace(/[^0-9]/g, ''), 10);
    expect(n).toBeLessThanOrEqual(MAX_RELEASED_ACT);
  });

  test('loadGame preserveRaw returns both raw and migrated', () => {
    const gs = {
      player: { realm: 'mortal' },
      // missing world to force migration backfill
    } as any;

    expect(SaveLoadSystem.saveGame(gs)).toBe(true);
    const result = SaveLoadSystem.loadGame({ preserveRaw: true });
    expect(result).not.toBeNull();
    // result should have raw and migrated
    expect((result as any).raw).toBeDefined();
    expect((result as any).migrated).toBeDefined();
    const raw = (result as any).raw as any;
    const migrated = (result as any).migrated as any;
    // raw should not have world.currentWorldType (older save)
    expect(raw.gameState.world === undefined || raw.gameState.world.currentWorldType === undefined).toBeTruthy();
    // migrated should have backfilled currentWorldType
    expect(migrated.gameState.world.currentWorldType).toBe('murim');
  });
});
