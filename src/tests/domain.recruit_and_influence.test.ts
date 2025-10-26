import { DomainSystem } from '../systems/DomainSystem';

describe('DomainSystem - garrison and influence behaviors', () => {
  test('recruitGarrison initializes garrison when missing and sets troops/quality', () => {
    const state = DomainSystem.defaultState();
    state.territories['t1'] = {
      id: 't1',
      nodeType: 'village',
      ownerFactionId: null,
      influence: {},
      buildings: {},
      neighbors: [],
      rarity: "H"
    } as any;

    const ds = new DomainSystem(state);
    const ok = ds.recruitGarrison('t1', 12, 0.8);
    expect(ok).toBe(true);
    const s = ds.serialize();
  expect(s.territories.t1.garrison).toBeDefined();
  expect(s.territories.t1.garrison!.troops).toBe(12);
  expect(typeof s.territories.t1.garrison!.quality).toBe('number');
  expect(Math.abs(Number(s.territories.t1.garrison!.quality) - 0.8)).toBeLessThan(1e-9);
  });

  test('recruitGarrison computes weighted average quality correctly', () => {
    const state = DomainSystem.defaultState();
    state.territories['t2'] = {
      id: 't2',
      nodeType: 'village',
      ownerFactionId: null,
      influence: {},
      buildings: {},
      neighbors: [],
      rarity: "H",
      garrison: { troops: 10, quality: 0.5 }
    } as any;

    const ds = new DomainSystem(state);
    const ok = ds.recruitGarrison('t2', 10, 1.0);
    expect(ok).toBe(true);
    const s = ds.serialize();
  expect(s.territories.t2.garrison!.troops).toBe(20);
  // weighted average: (0.5*10 + 1.0*10)/20 = 0.75
  expect(Math.abs(Number(s.territories.t2.garrison!.quality) - 0.75)).toBeLessThan(1e-9);
  });

  test('tick applies influence decay multiplicatively', () => {
    const state = DomainSystem.defaultState();
    state.territories['t3'] = {
      id: 't3',
      nodeType: 'outpost',
      ownerFactionId: null,
      influence: { f1: 100, f2: 50 },
      buildings: {},
      neighbors: [],
      rarity: "H"
    } as any;

    const params = { influenceDecayPerTick: 0.1 };
    const ds = new DomainSystem(state, params as any);
    ds.tick(60);
    const s = ds.serialize();
    // f1 should be reduced by 10% (100 -> 90)
    expect(Math.abs((s.territories.t3.influence.f1 || 0) - 90)).toBeLessThan(1e-9);
    expect(Math.abs((s.territories.t3.influence.f2 || 0) - 45)).toBeLessThan(1e-9);
  });

  test('resolveTerritoryContests respects garrison defense (no capture when defense prevents threshold)', () => {
    const state = DomainSystem.defaultState();
    // set base influence threshold to 100 via params and garrisonWeight to 1 so defense is troops count
    state.territories['t4'] = {
      id: 't4',
      nodeType: 'town',
      ownerFactionId: null,
      influence: { att: 150, def: 0 },
      buildings: {},
      neighbors: [],
      rarity: "H",
      garrison: { troops: 100, quality: 1.0 }
    } as any;

    const params = { baseInfluenceThreshold: 100, garrisonWeight: 1.0, ownershipLeadPct: 0.1 };
    const ds = new DomainSystem(state, params as any);
    // first, defense is 100, so required threshold = base + defense = 200 -> top 150 won't capture
    ds.resolveTerritoryContests();
    const s = ds.serialize();
    expect(s.territories.t4.ownerFactionId).toBeNull();

    // reduce garrison and run again; now capture should occur
  s.territories.t4.garrison!.troops = 0;
    const ds2 = new DomainSystem(s, params as any);
    ds2.resolveTerritoryContests();
    const s2 = ds2.serialize();
    expect(s2.territories.t4.ownerFactionId).toBe('att');
  });
});
