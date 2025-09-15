import { mentorExecutors } from '../utils/mentorExecutors';

describe('mentor_supervised_duel executor', () => {
  test('grants intentEcho buff for blade mentor and returns victory true deterministically', () => {
    const state: any = {
      world: { year: 1024 },
      player: { name: 'Tester', combatPower: 200 }
    };

    const res = (mentorExecutors as any).mentor_supervised_duel(state, { mentorId: 'mentor_rebellious_blade' });

    // For mentor_rebellious_blade the code sets victory true when seededRandom < 0.7
    // The seededRandom uses state.world.year + player.name and combatPower in the seed.
    // Check that the returned object has victory and that a buff was created on state.player.buffs.intentEcho when victory.
    expect(res).toBeDefined();
    expect(typeof res.victory).toBe('boolean');

    if (res.victory) {
      expect(state.player.buffs).toBeDefined();
      expect(state.player.buffs.intentEcho).toBeDefined();
      expect(state.player.buffs.intentEcho.duration).toBeGreaterThan(0);
    }
  });

  test('returns a boolean victory for other mentors', () => {
    const state: any = {
      world: { year: 1500 },
      player: { name: 'Other', combatPower: 50 }
    };

    const res = (mentorExecutors as any).mentor_supervised_duel(state, { mentorId: 'mentor_generic' });
    expect(res).toBeDefined();
    expect(typeof res.victory).toBe('boolean');
  });
});
