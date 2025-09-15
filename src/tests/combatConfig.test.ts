import { computeCombatPower } from '../systems/combatConfig';
import { PlaytestScaling } from '../utils/playtestScaling';

describe('combatConfig.computeCombatPower', () => {
  test('computes a positive number for typical stats', () => {
    const entity = { stats: { hp: 200, atk: 50, def: 30, qi: 100, speed: 20 }, daoHeart: 10 };
    const cp = computeCombatPower(entity);
    expect(typeof cp).toBe('number');
    expect(cp).toBeGreaterThan(0);
  });

  test('returns 0 for missing/zero stats but non-negative', () => {
    const entity = { stats: { hp: 0, atk: 0, def: 0, qi: 0, speed: 0 } };
    const cp = computeCombatPower(entity);
    expect(cp).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(cp)).toBe(true);
  });

  test('playtest multiplier scales computed power when enabled', () => {
    const entity = { stats: { hp: 100, atk: 20, def: 10, qi: 50, speed: 10 } };
    PlaytestScaling.setEnabled(true);
    PlaytestScaling.setCombatPowerMultiplier(2);
    const cp2 = computeCombatPower(entity);
    PlaytestScaling.setCombatPowerMultiplier(1);
    const cp1 = computeCombatPower(entity);
    expect(cp2).toBeGreaterThanOrEqual(cp1 * 1.9); // allow rounding
  });
});
