import computeDerivedStats from '../utils/computeStats';

const basePlayer: any = {
  baseStats: { hp: 100, qi: 100, atk: 10, def: 8, speed: 6 },
  stats: { hp: 100, qi: 100, atk: 10, def: 8, speed: 6 },
  equipment: {},
  spiritStones: { low: 0, mid: 0, high: 0 },
  skills: {},
  daoComprehension: 0,
  insight: 0,
  activeBuffs: []
};

test('computeDerivedStats baseline uses stats and defaults', () => {
  const d = computeDerivedStats(basePlayer);
  expect(d.atk).toBe(10);
  expect(d.def).toBe(8);
  expect(d.speed).toBe(6);
  // willPower falls back to spiritStones (0)
  expect(d.willPower).toBe(0);
});

test('computeDerivedStats includes equipment bonuses', () => {
  const p = { ...basePlayer, equipment: { mainHand: { id: 'sword', stats: { atk: 5 } }, armor: { id: 'plate', stats: { def: 3 } } } };
  const d = computeDerivedStats(p);
  expect(d.atk).toBe(15);
  expect(d.def).toBe(11);
});

test('computeDerivedStats prefers willPower field and buffs modify it', () => {
  const p = { ...basePlayer, willPower: 12, activeBuffs: [{ effects: { stats: { willPower: 3 } } }] };
  const d = computeDerivedStats(p);
  expect(d.willPower).toBe(15);
});
