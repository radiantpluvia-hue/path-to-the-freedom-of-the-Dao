import * as DomainUtils from '../../utils/domainSystem';
import { withReplay } from './utils/replayHarness';

function makeGameState() {
  const gs: any = { world: { territories: {}, factions: {} }, player: { yuan: 1000, reputation: { world: 100 } } };
  // create 10 territories and 3 factions
  for (let i = 0; i < 10; i++) {
    gs.world.territories['t' + i] = { id: 't' + i, influence: {}, ownerFactionId: null, garrison: { troops: 20 + i }, buildings: {} };
  }
  for (let f = 0; f < 3; f++) {
    gs.world.factions['f' + f] = { id: 'f' + f, treasury: { gold: 500 } };
  }
  return gs;
}

test('integration smoke: many captures maintain invariants', async () => {
  await withReplay('captureIntegration', async (rec) => {
  const gs = makeGameState();
  // deterministic pseudo-random using simple LCG
  let seed = 123456;
  const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

  for (let step = 0; step < 200; step++) {
    // pick random territory and faction and apply influence
    const tid = 't' + Math.floor(rand() * 10);
    const fid = 'f' + Math.floor(rand() * 3);
    const inc = Math.max(1, Math.floor(rand() * 20));
    DomainUtils.applyTerritoryInfluence?.(gs, tid, fid, inc);
    rec.push({ type: 'influence', tid, fid, inc });
    // occasionally decay
    if (step % 7 === 0) DomainUtils.decayInfluence?.(gs, tid, 0.98);
    // occasionally attempt capture commit
    if (step % 5 === 0) {
      const preview = DomainUtils.buildCaptureTransaction?.(gs, tid, 0.6, 'normal');
      if (preview && preview.attackerFactionId) {
        DomainUtils.applyCaptureTransaction?.(gs, preview);
        rec.push({ type: 'captureAttempt', preview: preview });
      }
    }
  }

  // invariants
  for (const tid of Object.keys(gs.world.territories)) {
    const t = gs.world.territories[tid];
    expect(t).toBeDefined();
    // influence keys non-negative and numbers
    if (t.influence) {
      for (const k of Object.keys(t.influence)) {
        expect(typeof t.influence[k]).toBe('number');
        expect(Number.isFinite(t.influence[k])).toBeTruthy();
        expect(t.influence[k]).toBeGreaterThanOrEqual(0);
      }
    }
    if (t.garrison) expect(t.garrison.troops).toBeGreaterThanOrEqual(0);
  }

  // faction treasuries and player funds non-negative
  for (const fid of Object.keys(gs.world.factions)) {
    expect(gs.world.factions[fid].treasury.gold).toBeGreaterThanOrEqual(0);
  }
  expect(gs.player.yuan).toBeGreaterThanOrEqual(0);
  });
});
