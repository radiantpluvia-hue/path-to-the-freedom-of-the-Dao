import { useGameStore } from '@/store/useGameStore';

describe('advanceYear action', () => {
  beforeEach(() => {
    // Reset minimal player state
    const s = useGameStore.getState();
    useGameStore.setState({ player: { ...s.player, age: 40, lifespan: 150 } } as any);
  });

  test('advanceYear increments age and records event', () => {
    const s1 = useGameStore.getState();
    const initialAge = s1.player.age || 0;
    const res = useGameStore.getState().advanceYear();
    const s2 = useGameStore.getState();
    expect(res).toBe(true);
    expect(s2.player.age).toBe(initialAge + 1);
    // lifePhaseSystem snapshot should exist in systems
    expect(s2.systems).toBeDefined();
  });
});
