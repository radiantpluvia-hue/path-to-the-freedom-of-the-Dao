import { create } from 'zustand';
import { GameState } from '../src/types';
import { REALM_ORDER } from '../src/data/cultivationRealms';
import { useGameStore } from '../src/store/useGameStore';

// Lightweight test focusing on Phase 2 ascension injection & executor side-effects.

describe('Ascension Phase 2', () => {
  test('injects ascension event and executor toggles world state on acceptance', async () => {
    const store = useGameStore.getState();
    // Fast-forward player to body_integration so that breakthrough elevates to true_immortal
    try {
      const { applyRealmToPlayer } = require('../src/utils/playerSetters');
      applyRealmToPlayer(store.player, 'body_integration');
    } catch (e) {
      // fallback for test environments
      store.player.realm = 'body_integration';
      store.player.realmId = REALM_ORDER.indexOf('body_integration');
    }
    store.player.currentQi = 999999999; // ensure enough qi

    // Run breakthrough check to move to true_immortal and inject event
    useGameStore.getState().checkRealmBreakthrough();

    const afterBreak = useGameStore.getState();
    expect(afterBreak.player.realm).toBe('true_immortal');
    // Ascension event should now be present in available events (before taking it world not ascended)
    const events = afterBreak.storySystem?.getAvailableEvents(afterBreak) || afterBreak.storySystem?.getCurrentAct(afterBreak)?.events || [];
    const ascensionEvent = events.find((e: any) => e.id === 'forced_ascension_true_immortal');
    expect(ascensionEvent).toBeTruthy();
    expect(afterBreak.world.ascended).not.toBe(true);

    // Simulate triggering & choosing acceptance
    if (!ascensionEvent) return; // already asserted truthy earlier, safety
    afterBreak.storySystem?.triggerEvent(ascensionEvent.id, afterBreak);
    // Dynamic import of executor registry to get ascension executor
  const mod = await import('../src/events/executors/eventExecutors_registry');
  const getExecutorAsync = (mod as any).getExecutorAsync;
  const exec = await getExecutorAsync('global_forced_ascension');
  exec(afterBreak as unknown as GameState, {});
    const post = useGameStore.getState();
    expect(post.world.currentWorldType).toBe('immortal');
    expect(post.world.ascended).toBe(true);
  });
});
