import freshStore from './testHelpers/freshStore';

describe('Configuration driven behavior', () => {
  test('DEFAULT_STORY_SYSTEM env toggles default story system', () => {
    // reset modules and set env override
    jest.resetModules();
    (globalThis as any).__DEFAULT_STORY_SYSTEM__ = 'lifearc';
    const useGameStore = freshStore();
    const store = useGameStore.getState();
    // The store.storySystem should be an instance of the life arc system when env is set
    expect(store.storySystem).toBeDefined();
    const ctorName = store.storySystem && store.storySystem.constructor && store.storySystem.constructor.name;
    expect(ctorName.toLowerCase()).toContain('lifearc');
    // cleanup
    delete (globalThis as any).__DEFAULT_STORY_SYSTEM__;
  });

  test('PLAYTEST_SCALING env toggles scaling enabled', () => {
    jest.resetModules();
    (globalThis as any).__PLAYTEST_SCALING__ = 'true';
    const useGameStore = freshStore();
    const ps = require('../utils/playtestScaling').PlaytestScaling;
    expect(ps.isEnabled()).toBe(true);
    delete (globalThis as any).__PLAYTEST_SCALING__;
  });

  test('STORY_ALLOW_SANDBOX_EVENTS env allows sandbox gating', () => {
    jest.resetModules();
    (globalThis as any).__STORY_ALLOW_SANDBOX_EVENTS__ = 'true';
    const useGameStore = freshStore();
    const ss: any = useGameStore.getState().storySystem;
    // Inject a fake act with minRealm high so normally it would be gated
    const act = { id: 'sandbox_events', title: 'Sandbox', description: '', mainQuests: [], sideQuests: [], events: [{ id: 'e1', title: 'E', worldTypes: ['cultivation'], minRealm: 'dao' }] };
    ss.acts.set('sandbox_events', act);
    const gs = { player: useGameStore.getState().player, world: { currentWorldType: 'cultivation' }, story: { currentAct: 'sandbox_events' }, ui: {}, systems: {} };
    const evts = ss.getAvailableEvents(gs as any);
    expect(evts.length).toBeGreaterThan(0);
    delete (globalThis as any).__STORY_ALLOW_SANDBOX_EVENTS__;
  });
});
