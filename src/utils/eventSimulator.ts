import { GameEvent } from '@/types';

// A small deterministic PRNG (mulberry32) for reproducible simulations
export function seededRng(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

import { getRng } from './rng';

export function chooseByAffinity(event: GameEvent, playerAffinity: number, rng?: () => number) {
  // Each choice may have { baseWeight, affinityWeight }
  // final weight = baseWeight + affinityWeight * playerAffinity
  const weighted = event.choices.map((c: any) => {
    const base = typeof c.baseWeight === 'number' ? c.baseWeight : 1;
    const aweight = typeof c.affinityWeight === 'number' ? c.affinityWeight : 0;
    const final = base + aweight * playerAffinity;
    return { choice: c, weight: Math.max(final, 0) };
  });

  const total = weighted.reduce((s, w) => s + w.weight, 0);
  if (total <= 0) return null;
  const rfn = rng || getRng();
  let r = rfn() * total;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.choice;
  }
  return weighted[weighted.length - 1].choice;
}

export function simulateEventSelection(event: GameEvent, playerAffinity: number, trials = 1000, rng?: () => number) {
  const counts: Record<string, number> = {};
  for (let i = 0; i < trials; i++) {
    const chosen = chooseByAffinity(event, playerAffinity, rng);
    const id = chosen ? (chosen as any).id : 'none';
    counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
}
