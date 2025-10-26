// Test that alignment-derived passives (alignmentPassiveApplied) persist across save/load
import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';

// Minimal localStorage mock for Node environment (duplicate pattern from other tests)
const localStorageMock = (() => {
  let store: Record<string,string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  } as any;
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// Lazy import alignment helpers to avoid cycles
// eslint-disable-next-line @typescript-eslint/no-var-requires
const alignment = require('../src/systems/alignment');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bridge = require('../src/systems/AlignmentPassiveBridge');

function makeGameState() {
  return {
    player: {
      id: 'p1',
      name: 'Tester',
      reputation: 10,
      alignment: { id: 'neutral', axes: { virtue:0, order:0, independence:0, ruthlessness:0 } },
      stats: { attack: 5, defense: 2, speed: 1 },
    },
    world: { day: 0, tick: 0 },
    story: { currentAct: 'act1', storyFlags: {} },
    ui: { currentScreen: 'game' },
    systems: {}
  } as any;
}

describe('SaveLoad alignmentPassiveApplied persistence', () => {
  beforeEach(() => localStorage.clear());

  test('alignment-derived passives are reapplied if missing and persisted if present', () => {
    const gs: any = makeGameState();
    // Shift axes to become demonic (should apply bloodthirsty + forbidden_affinity passives)
    alignment.shiftPlayerAxes(gs.player, { ruthlessness: 60, virtue: -50, independence: 10 });
    // Ensure bridge applied something
    expect(Array.isArray(gs.player.alignmentPassiveApplied)).toBe(true);
    const applied = [...gs.player.alignmentPassiveApplied];
    expect(applied.length).toBeGreaterThan(0);
    const attackBefore = gs.player.stats.attack;

    // Save game
    expect(SaveLoadSystem.saveGame(gs)).toBe(true);

    // Mutate player to remove stats & applied markers to simulate fresh load scenario
    gs.player.stats.attack = 5; // reset
    delete gs.player.alignmentPassiveApplied;

    // Load game
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const loadedPlayer: any = (loaded as any).gameState.player;
    expect(Array.isArray(loadedPlayer.alignmentPassiveApplied)).toBe(true);
    // Should contain at least the originally applied passives
    applied.forEach(id => expect(loadedPlayer.alignmentPassiveApplied).toContain(id));
    // Attack should be >= original boosted attackBefore (re-applied modifiers)
    expect(loadedPlayer.stats.attack).toBeGreaterThanOrEqual(attackBefore);
  });
});
