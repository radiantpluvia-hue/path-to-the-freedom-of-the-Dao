import { pickInitialWorldType } from '../src/store/useGameStore';

describe('World Initialization Weighting', () => {
  test('distribution favors murim ~70%', () => {
    // Monkey-patch Math.random to deterministic sequence cycling to cover range uniformly
    const originals: number[] = [];
    const total = 500;
    let seed = 0;
    const origRandom = Math.random;
    Math.random = () => {
      // simple LCG-ish progression mapped to [0,1)
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    let murim = 0; let cultivation = 0;
    for (let i = 0; i < total; i++) {
      const wt = pickInitialWorldType();
      if (wt === 'murim') murim++; else cultivation++;
    }
    Math.random = origRandom;
    const ratio = murim / total;
    expect(ratio).toBeGreaterThan(0.60);
    expect(ratio).toBeLessThan(0.80);
  });

  test('override enforces deterministic world', () => {
    (globalThis as any).__WORLD_OVERRIDE__ = 'cultivation';
    expect(pickInitialWorldType()).toBe('cultivation');
    (globalThis as any).__WORLD_OVERRIDE__ = 'murim';
    expect(pickInitialWorldType()).toBe('murim');
    delete (globalThis as any).__WORLD_OVERRIDE__;
  });
});
