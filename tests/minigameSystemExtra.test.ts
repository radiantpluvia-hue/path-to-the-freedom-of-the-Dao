import { MiniGameSystem } from '../src/systems/MiniGameSystem';
import { makeSeededRng, setRuntimeRng, clearRuntimeRng } from '../src/utils/seededRng';

describe('MiniGameSystem extra simulations', () => {
  let sys: MiniGameSystem;
  beforeEach(() => {
    sys = new MiniGameSystem();
    setRuntimeRng(makeSeededRng(12345));
  });
  afterEach(() => { clearRuntimeRng(); });

  it('runs a sect tournament deterministically and returns a winner index', () => {
    const res = sys.runSectTournament(10);
    expect(res.bracketSize).toBeGreaterThanOrEqual(16);
    expect(typeof res.winnerIndex).toBe('number');
    expect(res.rounds).toBeGreaterThan(0);
  });

  it('runs a faction war and returns casualties and victor', () => {
    const res = sys.runFactionWar(100, 80, 20);
    expect(res.attackerCasualties).toBeGreaterThanOrEqual(0);
    expect(res.defenderCasualties).toBeGreaterThanOrEqual(0);
    expect(['attacker', 'defender', 'stalemate']).toContain(res.victor);
  });
});
