import { useGameStore } from '@/store/useGameStore';

describe('scheduled travel (tick-driven)', () => {
  beforeEach(() => {
    const s = useGameStore.getState();
    // reset minimal state
    s.player.currentMapNode = '';
    s.player.unlockedMapNodes = [];
    s.player.activeTravel = null;
    s.world.tick = 0;
  });

  test('startTravel schedules and processTravelTick resolves arrival when tick advanced', () => {
    const store = useGameStore.getState();
  const travel = (useGameStore.getState() as any).startTravel('jade_valley', { fromNodeId: null, durationTicks: 3, mode: 'ride' } as any);
  expect(travel).not.toBeNull();
  const s1 = useGameStore.getState();
  expect((s1.player as any).activeTravel).not.toBeNull();
    // advance tick by 2 -> not arrived
    useGameStore.setState(state => ({ world: { ...state.world, tick: state.world.tick + 2 } }));
  expect((useGameStore.getState() as any).processTravelTick()).toBe(false);
    // advance by 1 more
    useGameStore.setState(state => ({ world: { ...state.world, tick: state.world.tick + 1 } }));
  expect((useGameStore.getState() as any).processTravelTick()).toBe(true);
    const s2 = useGameStore.getState();
    expect(s2.player.currentMapNode).toBe('jade_valley');
  expect((s2.player.unlockedMapNodes || []).includes('jade_valley')).toBe(true);
    expect((s2.player as any).activeTravel).toBeNull();
  });
});
