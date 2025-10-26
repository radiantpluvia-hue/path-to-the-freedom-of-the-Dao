import { getBaseNumberMultiplier, getEnemyBaseMultiplier } from '../config/balance';

describe('Balance multipliers in test mode', () => {
  it('returns 1x for base multiplier under NODE_ENV=test', () => {
    expect(getBaseNumberMultiplier()).toBe(1);
  });

  it('returns 1x for enemy multiplier under NODE_ENV=test', () => {
    expect(getEnemyBaseMultiplier()).toBe(1);
  });
});
