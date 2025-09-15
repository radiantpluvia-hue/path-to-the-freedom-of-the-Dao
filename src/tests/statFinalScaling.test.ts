import { applyFinalStatScaling, getRealmMultiplier } from '@/data/scalingSystem';

describe('applyFinalStatScaling', () => {
  test('soft scales daoHeart/insight, ignores already scaled combat stats', () => {
    const base = { atk: 100, def: 50, hp: 300, qi: 200, speed: 20, daoHeart: 4, insight: 6 };
    const scaled = applyFinalStatScaling(base, 'golden_immortal');
    // Combat stats unchanged by final pass (they are assumed pre-scaled upstream)
    expect(scaled.atk).toBe(base.atk);
    expect(scaled.def).toBe(base.def);
    expect(scaled.hp).toBe(base.hp);
    expect(scaled.qi).toBe(base.qi);
    expect(scaled.speed).toBe(base.speed);

    // Soft stats increase with realm
    expect(scaled.daoHeart).toBeGreaterThanOrEqual(base.daoHeart);
    expect(scaled.insight).toBeGreaterThanOrEqual(base.insight);
  });

  test('noop for zero/negative values', () => {
    const base: any = { daoHeart: 0, insight: -1 };
    const scaled = applyFinalStatScaling(base, 'chaos_saint');
    expect(scaled.daoHeart).toBe(0);
    expect(scaled.insight).toBe(-1);
  });

  test('realm multiplier sanity increases across tiers', () => {
    const m1 = getRealmMultiplier('mortal');
    const m2 = getRealmMultiplier('golden_immortal');
    const m3 = getRealmMultiplier('chaos_saint');
    expect(m2).toBeGreaterThan(m1);
    expect(m3).toBeGreaterThan(m2);
  });
});