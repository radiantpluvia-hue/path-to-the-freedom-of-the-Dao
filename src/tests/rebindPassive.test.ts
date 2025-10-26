import { SaveLoadSystem } from '@/systems/SaveLoadSystem';
import {
  registerPassive,
  unregisterPassive,
  applyPassiveToPlayer,
  removePassiveFromPlayer,
} from '@/systems/passiveRegistry';

describe('SaveLoad passive rebind', () => {
  beforeEach(() => {
    try { localStorage.removeItem((SaveLoadSystem as any).SAVE_KEY); } catch (e) {}
    try { unregisterPassive('test_rebind_passive'); } catch (e) {}
  });

  test('rebinds runtime hooks after load and reverts stat deltas on remove', () => {
    // Register a minimal passive that persists a stat delta under _autoApplied
    registerPassive({
      id: 'test_rebind_passive',
      name: 'Test Rebind Passive',
      apply: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        // Apply +5 atk and persist the applied value so SaveLoadSystem considers it
        out.stats.atk = (out.stats.atk || 0) + 5;
        out._autoApplied = { ...(out._autoApplied || {}), ['test_rebind_passive']: { atk: 5 } };
        return out;
      },
      remove: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        out.stats.atk = Math.max(0, (out.stats.atk || 0) - 5);
        if (out._autoApplied) {
          delete out._autoApplied['test_rebind_passive'];
          if (Object.keys(out._autoApplied).length === 0) delete out._autoApplied;
        }
        return out;
      },
      onHit: (ctx: any) => {
        // simple hook: return damage + 2
        return (ctx && (ctx.damage || 0)) + 2;
      }
    });

    // Prepare a minimal game state and apply the passive
  const fakeGameState: any = { player: { name: 'tester', stats: { atk: 1 } } };
  const appliedPlayer = applyPassiveToPlayer(fakeGameState.player, 'test_rebind_passive');
  // ensure the saved gameState contains the applied player object
  fakeGameState.player = appliedPlayer;

    // Sanity: delta applied and runtime hook attached
    expect(appliedPlayer.stats.atk).toBe(6);
    expect(appliedPlayer._autoApplied && appliedPlayer._autoApplied['test_rebind_passive']).toBeDefined();
    expect(appliedPlayer._passiveHooks && Array.isArray(appliedPlayer._passiveHooks.onHit) && appliedPlayer._passiveHooks.onHit.some((h: any) => h.id === 'test_rebind_passive')).toBeTruthy();

    // Save and load via SaveLoadSystem which should rebind runtime hooks from registry
    const ok = SaveLoadSystem.saveGame(fakeGameState as any);
    expect(ok).toBe(true);

    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).not.toBeNull();
    const loadedPlayer = (loaded as any).gameState.player;

    // After load, _autoApplied should remain and runtime hook should be re-attached by rebind logic
    expect(loadedPlayer._autoApplied && loadedPlayer._autoApplied['test_rebind_passive']).toBeDefined();
    expect(loadedPlayer._passiveHooks && Array.isArray(loadedPlayer._passiveHooks.onHit) && loadedPlayer._passiveHooks.onHit.some((h: any) => h.id === 'test_rebind_passive')).toBeTruthy();

    // Remove the passive using registry helper; it should revert the stat delta and remove hooks
    const afterRemove = removePassiveFromPlayer(loadedPlayer, 'test_rebind_passive');
    expect(!(afterRemove._autoApplied && afterRemove._autoApplied['test_rebind_passive'])).toBeTruthy();
    expect(!afterRemove._passiveHooks || !afterRemove._passiveHooks.onHit).toBeTruthy();
    expect(afterRemove.stats.atk).toBe(1);

    // Cleanup registry
    unregisterPassive('test_rebind_passive');
  });
});
