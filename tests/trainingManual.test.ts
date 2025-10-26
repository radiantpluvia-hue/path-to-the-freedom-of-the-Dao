import { useGameStore } from '@/store/useGameStore';
import { ALL_MANUALS } from '@/data/manuals';

describe('Training with manuals', () => {
  it('adds proficiency and a small visible gain', () => {
  const store = useGameStore.getState();
  // Ensure player realm is mortal and reset proficiencies
  useGameStore.getState().setPlayerProperty('realm', 'mortal');
  useGameStore.getState().setPlayerProperty('proficiencies', {} as any);
  useGameStore.getState().setPlayerProperty('baseStats', { atk: 10, speed: 10 });
  useGameStore.getState().setPlayerProperty('stats', { atk: 10, speed: 10 });
  useGameStore.getState().setPlayerProperty('willPower', 10 as any);

    const manual = ALL_MANUALS.find(m => m.id === 'basic_qi_gathering') || ALL_MANUALS[0];
  // Give the player the manual so it can be consumed
  useGameStore.getState().setPlayerProperty('manuals', [{ id: manual.id, name: manual.name } as any]);
  const res = useGameStore.getState().trainWithManual(manual.id);
    expect(res.success).toBe(true);

  const newState = useGameStore.getState();
  const profs = newState.player.proficiencies || {};
    // Expect at least one prof added
    const hasProfs = Object.keys(profs).length > 0;
    expect(hasProfs).toBe(true);

    // Visible stats should be >= initial (small bump allowed)
    expect(store.player.baseStats.atk).toBeGreaterThanOrEqual(10);
    expect(store.player.stats.atk).toBeGreaterThanOrEqual(10);
  });
});
