// A small helper to install a selector-aware jest mock for useGameStore
// Usage: call this at the top of your test file before importing components
export function mockUseGameStore(mockState: any = {}): any {
  const setUIProperty = mockState.setUIProperty ?? jest.fn();

  const base = {
    ui: { showNarrative: false },
    narrativeEngine: { destinyThreads: [] },
    player: { destinyAffinity: 0 },
    setUIProperty,
  } as any;

  // Use a shallow merge so tests can override only what they need
  const defaultState = Object.assign({}, base, mockState || {});

  // Provide a small in-memory state holder so callers can call getState/setState like the real store
  let stateHolder = { ...defaultState };

  // Build a lightweight store-like API over the state holder so callers/tests
  // can call getState(), setState(updater) and other helpers like addToInventory
  const storeApi: any = {
    getState: () => stateHolder,
    setState: (updater: any) => {
      if (typeof updater === 'function') stateHolder = updater(stateHolder);
      else stateHolder = Object.assign({}, stateHolder, updater || {});
    },
    addToInventory: (item: any) => {
      stateHolder.player = { ...(stateHolder.player || {}), inventory: [...(stateHolder.player?.inventory || []), item] };
    },
    claimMissionRewards: (missionId: string) => {
      const mission = stateHolder.story?.activeRandomMissions?.find((m: any) => m.id === missionId);
      const alreadyCompleted = Array.isArray(stateHolder.story?.completedQuests) && stateHolder.story.completedQuests.includes(missionId);
      if (!mission && !alreadyCompleted) return false;
      if (alreadyCompleted) return false;
      const mAny = mission as any;
      const eligible = mAny ? (mAny.isCompleted === true || (Array.isArray(mAny.objectives) && mAny.objectives.every((o: any) => (o.progress || 0) >= (o.value || 1)))) : true;
      if (!eligible) return false;
      const rewards: any = (mission as any)?.reward || {};
      if (typeof rewards.yuan === 'number') stateHolder.player.yuan = (stateHolder.player.yuan || 0) + rewards.yuan;
      if (rewards.spiritStones) {
        stateHolder.player.spiritStones = {
          low: (stateHolder.player.spiritStones?.low || 0) + ((rewards.spiritStones && rewards.spiritStones.low) || 0),
          mid: (stateHolder.player.spiritStones?.mid || 0) + ((rewards.spiritStones && rewards.spiritStones.mid) || 0),
          high: (stateHolder.player.spiritStones?.high || 0) + ((rewards.spiritStones && rewards.spiritStones.high) || 0)
        };
      }
      if (Array.isArray(rewards.items) && rewards.items.length > 0) rewards.items.forEach((it: any) => storeApi.addToInventory(it));
      stateHolder.story = {
        ...stateHolder.story,
        activeRandomMissions: (stateHolder.story.activeRandomMissions || []).filter((m: any) => m.id !== missionId),
        completedQuests: [...(stateHolder.story.completedQuests || []), missionId]
      };
      // unlock chained mission if present on the mission or its rewards
      try {
        const chained = (mission as any)?.chainedMission || (rewards && rewards.chainedMission);
        if (chained) {
          if (typeof chained === 'string') {
            stateHolder.story.activeRandomMissions = [...(stateHolder.story.activeRandomMissions || []), { id: chained, title: chained }];
          } else if (typeof chained === 'object') {
            stateHolder.story.activeRandomMissions = [...(stateHolder.story.activeRandomMissions || []), chained];
          }
        }
      } catch (e) { /* ignore */ }
      return true;
    },
    // Unlock a mission template object into active list
    unlockMissionTemplate: (missionTemplate: any) => {
      stateHolder.story = {
        ...stateHolder.story,
        activeRandomMissions: [...(stateHolder.story.activeRandomMissions || []), missionTemplate]
      };
      return true;
    },
    // Check expirations similar to store implementation
    checkMissionExpirations: (nowTick?: number) => {
      const tick = typeof nowTick === 'number' ? nowTick : (stateHolder.world && stateHolder.world.tick) || Date.now();
      const active = Array.isArray(stateHolder.story.activeRandomMissions) ? [...stateHolder.story.activeRandomMissions] : [];
      const remaining: any[] = [];
      const expired: any[] = [];
      for (const m of active) {
        const mAny = m as any;
        const expiresAt = (mAny && (mAny.expiresAt || mAny.expiresAtTick)) || 0;
        if (expiresAt && expiresAt <= tick) expired.push(mAny);
        else remaining.push(mAny);
      }
      stateHolder.story = { ...stateHolder.story, activeRandomMissions: remaining };
      return expired.length;
    },
    // expose the raw state fields for convenience (tests may read store.player directly)
    ...stateHolder
  };

  const currentStoreView = () => ({ ...stateHolder, claimMissionRewards: storeApi.claimMissionRewards, addToInventory: storeApi.addToInventory, getState: storeApi.getState, setState: storeApi.setState, unlockMissionTemplate: storeApi.unlockMissionTemplate, checkMissionExpirations: storeApi.checkMissionExpirations });

  const useGameStoreMock = jest.fn((selector?: any) => {
    const view = currentStoreView();
    if (typeof selector === 'function') return selector(view);
    return view;
  });

  // also provide getState and setState helpers similar to Zustand
  (useGameStoreMock as any).getState = () => currentStoreView();
  (useGameStoreMock as any).setState = (updater: any) => storeApi.setState(updater);

  // install the jest mock; expose the mock function and basic getState/setState
  jest.mock('@/store/useGameStore', () => ({ useGameStore: useGameStoreMock }));

  // Expose a simple global gameStore object compatible with older tests/systems
  try {
    (globalThis as any).gameStore = storeApi as any;
  } catch (e) {
    // ignore environments that don't allow setting globalThis
  }

  return { setUIProperty, state: stateHolder, useGameStoreMock };
}
