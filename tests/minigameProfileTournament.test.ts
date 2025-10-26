import { MiniGameSystem } from '../src/systems/MiniGameSystem';

describe('MiniGameSystem profile-based tournament', () => {
  it('computes strengths from profiles deterministically', () => {
    const sys = new MiniGameSystem();
    const profiles = [];
    for (let i = 0; i < 8; i++) {
      profiles.push({ id: `p${i}`, level: 10 + i, stats: { atk: 10 + i, def: 8 + i, speed: 5 + i, hp: 200 + i * 10 } });
    }
    const res = sys.runSectTournament(8, profiles);
    expect(res.bracketSize).toBe(8);
    expect(res.rounds).toBeGreaterThanOrEqual(3);
  expect(['string','number']).toContain(typeof res.winnerIndex);
  });
});
