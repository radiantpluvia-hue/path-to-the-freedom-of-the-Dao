import * as Domain from '../../utils/domainSystem';
import ReplayPlayer from '../tools/../tools/ReplayPlayer';

// This integration test verifies deterministic replay: when we inject a seeded RNG
// and replay the same action sequence, the resulting world snapshot is stable.

describe('replay deterministic integration', () => {
  test('seeded replay produces deterministic outcome', () => {
    // build an initial simple game state
    const gs: any = {
      world: {
        territories: {
          t1: { id: 't1', ownerFactionId: null, influence: { attacker: 50, defender: 50 }, garrison: { troops: 5, quality: 1.0 }, buildings: {}, neighbors: [] }
        },
        factions: { attacker: { id: 'attacker', treasury: { gold: 50 } } }
      },
      player: { yuan: 0 }
    };

    // Provide a fixture with a numeric seed and a couple of actions
    const fixture = {
      seed: 12345,
      actions: [
        { type: 'influence', tid: 't1', fid: 'attacker', inc: 20 },
        { type: 'tick', delta: 1 }
      ]
    } as any;

    // ensure Domain accepts setRng
    const originalRng = (Domain as any).getRng && (Domain as any).getRng();

    try {
      // inject a simple deterministic RNG same as ReplayPlayer would
      let s = (fixture.seed >>> 0) as number;
      const rng = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
      if (typeof (Domain as any).setRng === 'function') (Domain as any).setRng(rng);
      else (Domain as any).rng = rng;

      // apply replay to our programmatic state
      ReplayPlayer.applyReplay(gs, fixture);

      // capture snapshot after first replay
      // normalize snapshot to remove transient timestamps (e.g. contestedSince)
      const normalize = (obj: any) => {
        try {
          const clone = JSON.parse(JSON.stringify(obj));
          if (clone && clone.world && clone.world.territories) {
            for (const k of Object.keys(clone.world.territories)) {
              const t = clone.world.territories[k];
              if (t && typeof t.contestedSince === 'string') delete t.contestedSince;
            }
          }
          return JSON.stringify(clone);
        } catch (e) { return JSON.stringify(obj); }
      };

      const snap1 = normalize(gs);

      // reset state and replay again to ensure deterministic outcome
      const gs2: any = JSON.parse(JSON.stringify({
        world: {
          territories: {
            t1: { id: 't1', ownerFactionId: null, influence: { attacker: 50, defender: 50 }, garrison: { troops: 5, quality: 1.0 }, buildings: {}, neighbors: [] }
          },
          factions: { attacker: { id: 'attacker', treasury: { gold: 50 } } }
        },
        player: { yuan: 0 }
      }));

      // re-inject same RNG seed
      s = (fixture.seed >>> 0) as number;
      const rng2 = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
      if (typeof (Domain as any).setRng === 'function') (Domain as any).setRng(rng2);
      else (Domain as any).rng = rng2;

      ReplayPlayer.applyReplay(gs2, fixture);
  const snap2 = normalize(gs2);

  expect(snap1).toBe(snap2);
    } finally {
      // restore original rng if possible
      try { if (typeof (Domain as any).setRng === 'function') (Domain as any).setRng(originalRng || null); else (Domain as any).rng = originalRng || Math.random; } catch (e) { /* ignore */ }
    }
  });
});
