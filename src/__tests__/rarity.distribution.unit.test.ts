import { RARITY_WEIGHTS } from '@/config/rarity';
import { selectFromWeightedList } from '@/utils/weightedSampling';
import { runtimeRng } from '@/utils/seededRng';

describe('RARITY_WEIGHTS sampling distribution (deterministic)', () => {
  test('sampling frequencies roughly match configured weights', () => {
    const entries = Object.keys(RARITY_WEIGHTS).map(k => ({ id: k, weight: (RARITY_WEIGHTS as any)[k] }));
    const counts: Record<string, number> = {};
    Object.keys(RARITY_WEIGHTS).forEach(k => counts[k] = 0);

    const draws = 500;
    for (let i = 0; i < draws; i++) {
      const picked = selectFromWeightedList(entries as any[], (it: any) => it.weight, runtimeRng as any);
      if (picked) counts[picked.id]++;
    }

    // Normalize frequencies and ensure ordering by weight (higher weight -> more picks)
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const sortedWeights = Object.entries(RARITY_WEIGHTS).sort((a, b) => b[1] - a[1]);

    // Check that the highest-weight rarity is the top picked
    expect(sorted[0][0]).toBe(sortedWeights[0][0]);

    // Check rough proportions: each weight's fraction should be within a small tolerance
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((s, n) => s + n, 0);
    Object.entries(RARITY_WEIGHTS).forEach(([k, w]) => {
      const expectedFrac = w / totalWeight;
      const observedFrac = counts[k] / draws;
      // Allow 10% absolute tolerance for small sample sizes
      expect(Math.abs(observedFrac - expectedFrac)).toBeLessThanOrEqual(0.10);
    });
  });
});
