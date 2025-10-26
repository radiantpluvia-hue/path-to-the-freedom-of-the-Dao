import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';

// Minimal localStorage mock for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => localStorage.clear());

test('loadGame preserveRaw does not modify raw and migrated has world backfilled when original lacked it', () => {
  const gs = { player: { realm: 'mortal' } } as any;
  expect(SaveLoadSystem.saveGame(gs)).toBe(true);
  const result = SaveLoadSystem.loadGame({ preserveRaw: true }) as any;
  expect(result).not.toBeNull();
  expect(result.raw).toBeDefined();
  expect(result.migrated).toBeDefined();

  // Raw should be the original and not contain a backfilled world.currentWorldType
  expect(result.raw.gameState.world === undefined || result.raw.gameState.world.currentWorldType === undefined).toBeTruthy();

  // Migrated should have a world and currentWorldType set
  expect(result.migrated.gameState.world).toBeDefined();
  expect(typeof result.migrated.gameState.world.currentWorldType).toBe('string');
});