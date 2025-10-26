import { MAJOR_REALM_TIERS, getRealmMultiplier } from '../data/scalingSystem';

describe('scaling monotonicity', () => {
  test('within-tier monotonic non-decreasing', () => {
    for (const [tier, realms] of Object.entries(MAJOR_REALM_TIERS)) {
      let prev = -Infinity;
      for (const r of realms) {
        const m = getRealmMultiplier(r);
        expect(m).not.toBeNaN();
        expect(m).toBeGreaterThanOrEqual(prev - 1e-12);
        prev = m;
      }
    }
  });

  test('cross-tier strict ordering (max of lower < min of higher)', () => {
    const tiers = Object.keys(MAJOR_REALM_TIERS);
    for (let i = 0; i < tiers.length - 1; i++) {
      const lower = MAJOR_REALM_TIERS[tiers[i] as keyof typeof MAJOR_REALM_TIERS];
      const higher = MAJOR_REALM_TIERS[tiers[i+1] as keyof typeof MAJOR_REALM_TIERS];
      const maxLower = Math.max(...lower.map(r => getRealmMultiplier(r)));
      const minHigher = Math.min(...higher.map(r => getRealmMultiplier(r)));
      expect(maxLower).toBeLessThan(minHigher + 1e-12);
    }
  });
});
