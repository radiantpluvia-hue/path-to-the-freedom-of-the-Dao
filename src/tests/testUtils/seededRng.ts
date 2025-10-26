// Simple deterministic RNG for tests using a linear congruential generator
export function createSeededRng(seed: number) {
  let state = seed >>> 0;
  return function rng() {
    // LCG constants from Numerical Recipes
    state = (1664525 * state + 1013904223) >>> 0;
    return (state & 0xffffffff) / 0x100000000;
  };
}

export function createSequenceRng(values: number[]) {
  let idx = 0;
  return function rng() {
    const v = values[idx % values.length];
    idx++;
    return v;
  };
}
