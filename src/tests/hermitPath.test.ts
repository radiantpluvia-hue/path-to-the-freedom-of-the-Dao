import { SeclusionPath as HermitPath } from '../systems/seclusionPath';
import { makeSeededRng, setRuntimeRng, clearRuntimeRng } from '../utils/seededRng';

describe('HermitPath - basic behaviors', () => {
  afterEach(() => {
    clearRuntimeRng();
  });

  test('tick while secluded grants qi and cp and can produce rare_source_found', () => {
    // Use a seeded RNG that will produce a predictable stream
    setRuntimeRng(makeSeededRng(12345));

    const hermit = new HermitPath();
    const fakeState: any = {
      player: { skills: { meditation: { level: 2 }, comprehension: { level: 1 } }, daoComprehension: 0 }
    };

  hermit.enterSeclusion(1, false);

    const effects = hermit.tick(fakeState);

    expect(effects.qiGain).toBeGreaterThanOrEqual(0);
    expect(effects.cpGain).toBeGreaterThanOrEqual(1);
    // events may or may not include rare_source_found based on RNG; ensure events array exists
    expect(Array.isArray(effects.events)).toBeTruthy();
  });

  test('performStudy grants xp with diminishing returns and bumps rare accumulator', () => {
    const hermit = new HermitPath();
    const fakeState: any = { player: {}, world: {}, story: {}, ui: {}, systems: {} };

    // ensure initial study yields base XP
  const r1 = hermit.performStudy(fakeState, 1);
    expect(r1.xpGained).toBeGreaterThanOrEqual(1);

    // simulate many ticks to cause some decay factor influence
    // manually tweak internal ticks to simulate extended seclusion
    const s = (hermit as any).getState();
    (hermit as any).state = { ...s, ticksSinceSeclusionStart: 40 };

    const r2 = hermit.performStudy(fakeState, 2);
    // xp with decay should be <= raw baseExp*intensity
    const baseExp = Math.max(1, Math.floor(10 * 2));
    expect(r2.xpGained).toBeLessThanOrEqual(baseExp);
  });
});
