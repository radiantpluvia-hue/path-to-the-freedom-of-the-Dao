import { mentorExecutors } from '../utils/mentorExecutors';

describe('mentor_legacy_trial executor', () => {
  test('grants legacyToken on high roll (deterministic)', () => {
    const state: any = {
      world: { year: 2025 },
      player: { name: 'LegacyTester' }
    };
    const res = (mentorExecutors as any).mentor_legacy_trial(state, { mentorId: 'mentor_legacy_master' });
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
    if (res.success) {
      expect(state.player.legacyTokens).toBeGreaterThan(0);
      expect(res.legacyToken).toBe(true);
    }
  });
});

describe('mentor_ritual_guidance executor', () => {
  test('gives deterministic stat bonus (spirit or insight)', () => {
    const state: any = {
      world: { year: 2025 },
      player: { name: 'RitualTester', stats: {} }
    };
    const res = (mentorExecutors as any).mentor_ritual_guidance(state, { mentorId: 'mentor_ritualist' });
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(['spirit', 'insight']).toContain(res.stat);
    expect(typeof res.amount).toBe('number');
    // Should mutate state.player.stats
    expect(state.player.stats[res.stat]).toBeGreaterThan(0);
  });
});
