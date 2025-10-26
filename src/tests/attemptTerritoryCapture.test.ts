import { attemptTerritoryCapture } from '../../utils/domainSystem';

// Type guard to assert the returned object is a CapturePreview/Result with expected fields
function isCaptureLike(x: any): x is { newOwner?: string | null; previousOwner?: string | null; share?: number; requiredUpkeep?: number; upkeepPaid?: boolean; garrisonAfter?: any } {
  return x && typeof x === 'object' && ('share' in x || 'requiredUpkeep' in x || 'newOwner' in x || 'previousOwner' in x);
}

describe('attemptTerritoryCapture utils', () => {
  test('preview does not commit and returns expected preview fields', () => {
    const gs: any = {
      world: {
        territories: {
          t1: {
            id: 't1',
            ownerFactionId: null,
            influence: { attacker: 60, defender: 40 },
            buildings: {},
            neighbors: []
          }
        },
        factions: {}
      }
    };

  const preview = attemptTerritoryCapture(gs as any, 't1', 0.6, false);
  expect(preview).not.toBeNull();
  if (!preview) throw new Error('preview unexpectedly null');
  expect(isCaptureLike(preview)).toBe(true);
  if (!isCaptureLike(preview)) throw new Error('preview not capture-like');
  expect(preview.newOwner).toBe('attacker');
  expect(preview.previousOwner).toBeNull();
  // share should be 0.6
  expect(Math.abs((preview.share ?? 0) - 0.6)).toBeLessThan(1e-9);
    // ensure world was not mutated (owner remains null)
    expect(gs.world.territories.t1.ownerFactionId).toBeNull();
  });

  test('commit will set owner, deduct treasury and apply garrison attrition when treasury exists', () => {
    const gs: any = {
      world: {
        territories: {
          t2: {
            id: 't2',
            ownerFactionId: null,
            influence: { attacker: 60, defender: 40 },
            buildings: {},
            garrison: { troops: 10, quality: 1.0 },
            neighbors: []
          }
        },
        factions: {
          attacker: { id: 'attacker', treasury: { gold: 100 } }
        }
      }
    };

  const res = attemptTerritoryCapture(gs as any, 't2', 0.6, true);
  expect(res).not.toBeNull();
  if (!res) throw new Error('res unexpectedly null');
  expect(isCaptureLike(res)).toBe(true);
  if (!isCaptureLike(res)) throw new Error('res not capture-like');
  expect(res.newOwner).toBe('attacker');
    // owner should be set on territory
    expect(gs.world.territories.t2.ownerFactionId).toBe('attacker');
    // requiredUpkeep should be present and deducted from treasury
  expect(typeof (res.requiredUpkeep ?? undefined)).toBe('number');
    expect(gs.world.factions.attacker.treasury.gold).toBeGreaterThanOrEqual(0);
    // upkeepPaid should be true when treasury covered
  expect(res.upkeepPaid).toBe(true);
    // garrison troops reduced according to casualty pct (share 0.6 => casualties = round(10*0.6)=6 => left 4)
    expect(gs.world.territories.t2.garrison.troops).toBe(4);
  expect(res.garrisonAfter && res.garrisonAfter.troops).toBe(4);
  });

  test('commit without faction treasury will still transfer owner but upkeepPaid is false', () => {
    const gs: any = {
      world: {
        territories: {
          t3: {
            id: 't3',
            ownerFactionId: null,
            influence: { attacker: 60, defender: 40 },
            buildings: {},
            garrison: { troops: 8, quality: 1.0 },
            neighbors: []
          }
        },
        factions: {
          attacker: { id: 'attacker' } // no treasury field
        }
      }
    };

  const res = attemptTerritoryCapture(gs as any, 't3', 0.6, true);
  expect(res).not.toBeNull();
  if (!res) throw new Error('res unexpectedly null');
  expect(isCaptureLike(res)).toBe(true);
  if (!isCaptureLike(res)) throw new Error('res not capture-like');
  expect(res.newOwner).toBe('attacker');
  expect(res.upkeepPaid).toBe(false);
  // owner should be updated despite no treasury
  expect(gs.world.territories.t3.ownerFactionId).toBe('attacker');
  // garrison should be reduced accordingly
  const expectedTroopsLeft = Math.max(0, 8 - Math.round(8 * Math.min(0.9, res.share ?? 0)));
  expect(gs.world.territories.t3.garrison.troops).toBe(expectedTroopsLeft);
  });
});
