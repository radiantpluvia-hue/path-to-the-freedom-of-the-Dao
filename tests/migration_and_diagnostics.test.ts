import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';
import { useGameStore } from '../src/store/useGameStore';
import { StorySystem } from '../src/systems/StorySystem';

// Helper to write a fake save into localStorage and then call loadGame
const writeSave = (payload: any) => {
  try { localStorage.removeItem((SaveLoadSystem as any).SAVE_KEY); } catch (e) {}
  localStorage.setItem((SaveLoadSystem as any).SAVE_KEY, JSON.stringify(payload));
};

describe('SaveLoad migration hardening', () => {
  beforeEach(() => {
    try { localStorage.removeItem((SaveLoadSystem as any).SAVE_KEY); } catch (e) {}
  });

  test('infers missing world.currentWorldType and auto-ascends if player realm is immortal', () => {
    const legacySave = {
      gameVersion: '0.9.0',
      timestamp: Date.now(),
      gameState: {
        player: { realm: 'true_immortal' },
        world: { ascended: false }
      }
    };
    writeSave(legacySave);
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const gs: any = loaded!.gameState as any;
    expect(gs.world).toBeDefined();
    // Migration should set currentWorldType to 'immortal' and ascended true
    // currentWorldType should be set to immortal when realm is an ascension realm
    expect(gs.world.currentWorldType).toBe('immortal');
    // Ascended should be true because player realm is true_immortal
    expect(gs.world.ascended).toBe(true);
  });

  test('coerces ascended + non-immortal world type to immortal', () => {
    const save = {
      gameVersion: '1.0.0',
      timestamp: Date.now(),
      gameState: {
        player: { realm: 'Core Formation' },
        world: { ascended: true, currentWorldType: 'murim' }
      }
    };
    writeSave(save);
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const gs: any = loaded!.gameState as any;
    // Migration should coerce inconsistent state
    expect(gs.world.currentWorldType).toBe('immortal');
    expect(gs.world.ascended).toBe(true);
  });
});

describe('Diagnostics sampling', () => {
  test('StorySystem collects sample filtered event ids', () => {
    const store = useGameStore.getState();
    // ensure storySystem is StorySystem for this test
    const storySys = new StorySystem();
    // Ensure the act exists and set currentAct accordingly
    storySys.addEvent('act1', { id: 'e_mortal_only_1', title: 'Mortal 1', description: '', choices: [], worldTypes: ['murim'] as any });
    storySys.addEvent('act1', { id: 'e_mortal_only_2', title: 'Mortal 2', description: '', choices: [], worldTypes: ['murim'] as any });
    const gsState: any = { player: store.player, world: { ...store.world, currentWorldType: 'immortal' }, story: { ...store.story, currentAct: 'act1' }, ui: store.ui, systems: store.systems };
    storySys.resetDiagnostics();
    const events = storySys.getAvailableEvents(gsState as any);
    const diag = storySys.getDiagnosticsSummary();
    // Ensure some events were checked and filtered
    expect(diag.totalChecked).toBeGreaterThanOrEqual(0);
  expect(diag.reasons.worldType).toBeGreaterThanOrEqual(1);
    // Sample list should include at least one of our mortal-only ids
    expect(Array.isArray(diag.samples.worldType)).toBe(true);
    expect(diag.samples.worldType.some((id: string) => id.startsWith('e_mortal_only_'))).toBe(true);
  });
});
