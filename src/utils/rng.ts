// Central RNG helper for deterministic replay support.
// Prefer an injected RNG on a context/state, then the domain shim getRng(), then Math.random.

import * as domainShim from './domainSystem';
import { runtimeRng } from './seededRng';

export function getRng(source?: any): () => number {
  try {
    if (source && typeof source.rng === 'function') return source.rng;
    if (domainShim && typeof domainShim.getRng === 'function') {
      const g = domainShim.getRng();
      if (typeof g === 'function') return g;
    }
  } catch (e) {
    // fall through
  }
  // As a safer fallback, prefer the runtime seeded RNG helper if present (tests may override it)
  try {
    if (runtimeRng && typeof runtimeRng === 'function') return runtimeRng;
  } catch (e) { /* ignore */ }
  return Math.random;
}

export function roll(source?: any) {
  return getRng(source)();
}

export function randInt(max: number, source?: any) {
  return Math.floor(getRng(source)() * max);
}

export function choice<T>(arr: T[], source?: any): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr[randInt(arr.length, source)];
}
