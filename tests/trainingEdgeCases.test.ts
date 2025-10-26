import { useGameStore } from '@/store/useGameStore';
import { ALL_MANUALS } from '@/data/manuals';

describe('Training edge cases', () => {
  beforeEach(() => {
    useGameStore.getState().setPlayerProperty('realm', 'mortal');
    useGameStore.getState().setPlayerProperty('proficiencies', {} as any);
    useGameStore.getState().setPlayerProperty('manuals', [] as any);
  });

  it('trainComprehendManual with manualId fails if player does not possess the manual', () => {
    const manual = ALL_MANUALS[0];
    // Ensure player does not have that manual
    useGameStore.getState().setPlayerProperty('manuals', [] as any);
    const res = useGameStore.getState().trainComprehendManual(manual.id);
    // Now we enforce ownership so this should fail
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/do not possess/i);
  });

  it('train APIs enforce cooldowns', () => {
    // Call trainBody twice quickly; second call should be on cooldown
    const first = useGameStore.getState().trainBody();
    expect(first.success).toBe(true);
    const second = useGameStore.getState().trainBody();
    expect(second.success).toBe(false);
    expect(second.message).toMatch(/cooldown/i);
  });
});
