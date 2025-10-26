import { useGameStore } from '@/store/useGameStore';

describe('travelTo', () => {
  beforeEach(() => {
    // reset store to initial state by re-importing fresh state if available
    // useGameStore provides a getState and setState; we'll snapshot and reset manually
    const s = useGameStore.getState();
    s.player.currentLocationId = null;
    s.world.tick = 0;
  });

  test('advances world.tick when durationTicks provided and sets location', () => {
    const initialTick = useGameStore.getState().world.tick || 0;
    const duration = 5;
    useGameStore.getState().travelTo({ locationId: 'mystic_valley', durationTicks: duration } as any);
    const st = useGameStore.getState();
    expect(st.world.tick).toBe(initialTick + duration);
    expect(st.player.currentLocationId).toBe('mystic_valley');
  });

  test('legacy string argument sets location immediately without advancing tick', () => {
    const initialTick = useGameStore.getState().world.tick || 0;
    useGameStore.getState().travelTo('silent_town');
    const st = useGameStore.getState();
    expect(st.world.tick).toBe(initialTick);
    expect(st.player.currentLocationId).toBe('silent_town');
  });
});
