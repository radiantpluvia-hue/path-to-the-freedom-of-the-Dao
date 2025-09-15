// Small seeded PRNG (LCG) for deterministic tests
export function makeSeededRng(seed: number) {
  let s = seed >>> 0;
  return function rng() {
    // Constants from Numerical Recipes
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0x7fffffff) / 0x80000000;
  };
}

// Convenience: deterministic string-based seed
export function seededFromString(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return makeSeededRng(h);
}

// Global runtime RNG that can be overridden in tests
// Expose runtime RNG via a global accessor so tests that reset modules can still override it
const GLOBAL_KEY = '__XIANXIA_RUNTIME_RNG__';
if (!(globalThis as any)[GLOBAL_KEY]) {
  (globalThis as any)[GLOBAL_KEY] = Math.random;
}

export function runtimeRng() {
  return ((globalThis as any)[GLOBAL_KEY] as () => number)();
}

export function setRuntimeRng(rng: () => number) {
  (globalThis as any)[GLOBAL_KEY] = rng;
}

export function clearRuntimeRng() {
  (globalThis as any)[GLOBAL_KEY] = Math.random;
}
