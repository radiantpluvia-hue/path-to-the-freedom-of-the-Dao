import { selectFromWeightedList } from '../src/utils/weightedSampling';
import { runtimeRng } from '../src/utils/seededRng';

describe('selectFromWeightedList deterministic behavior', () => {
  test('prefers items with larger weights using seeded RNG', () => {
    // Create a deterministic RNG by seeding runtimeRng if possible
    // runtimeRng returns deterministic sequence for tests in this project
    const list = [
      { id: 'a', weight: 0.01 },
      { id: 'b', weight: 0.01 },
      { id: 'c', weight: 10 }
    ];

    // Perform multiple draws using the same seeded RNG to ensure 'c' is selected predominantly
    const picks: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 50; i++) {
      const picked = selectFromWeightedList(list, (it) => it.weight, runtimeRng as any);
      if (picked) picks[picked.id]++;
    }

    // Expect that 'c' was picked at least 40 times out of 50 with heavy weight
    expect(picks.c).toBeGreaterThanOrEqual(40);
  });
});
