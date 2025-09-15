export {};
const CombatSystem = require('../src/systems/CombatSystem').default || require('../src/systems/CombatSystem').CombatSystem || require('../src/systems/CombatSystem');

describe('CombatSystem smoke test (deterministic 1v1)', () => {
  test('basic attack deals expected damage and consumes AP deterministically', () => {
    const player = {
      id: 'player', name: 'Hero', hp: 50, maxHp: 50,
      ap: 3, maxAp: 3, qi: 5, maxQi: 5,
      stats: { atk: 4, def: 1, speed: 2 },
      techniques: [{ id: 'strike', name: 'Strike', apCost: 1, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 8 }] }],
      buffs: [], debuffs: [], stance: 'neutral'
    } as any;

    const enemy = {
      id: 'enemy1', name: 'Bandit', hp: 30, maxHp: 30,
      ap: 2, maxAp: 2, qi: 0, maxQi: 0,
      stats: { atk: 2, def: 0, speed: 1 },
      techniques: [], buffs: [], debuffs: [], stance: 'neutral'
    } as any;

    // Inject deterministic RNG via context
    const ctx = { type: 'normal', rng: () => 0.42 };

    const sys = new CombatSystem(player as any, [enemy as any], null, null, ctx as any);

    // Initially, turn order should put the faster participant first (player.speed=2)
    const state = sys.getState();
    expect(state.turnOrder[0]).toBe('player');

    // Use technique and assert AP and HP changes
    const used = sys.useTechnique('player', 'strike', 'enemy1');
    expect(used).toBe(true);

    // After using, player AP should have reduced by technique apCost (1)
  const p = sys.getState().participants.find((pp: any) => pp.id === 'player');
  expect(p?.ap).toBe(2);

    // Enemy should have taken damage; compute expected damage roughly: base(8) + atk(4) - def(0) = 12 (terrain/weather multipliers ~1)
  const e = sys.getState().participants.find((pp: any) => pp.id === 'enemy1');
  expect(e?.hp).toBeLessThan(30);
  expect(e?.hp).toBeGreaterThanOrEqual(18); // <=12 damage should leave at least 18 HP

    // Ensure combat state still ongoing (enemy alive)
    expect(sys.getState().status).toBe('ongoing');
  });
});
