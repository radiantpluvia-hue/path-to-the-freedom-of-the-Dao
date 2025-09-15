import { getCultivationMultiplier, getDiminishingReturnFactor, adjustDamageForRealmGap } from '@/systems/cultivationUtils';

test('cultivation multiplier basic', () => {
  expect(getCultivationMultiplier()).toBeGreaterThan(0);
  expect(getCultivationMultiplier({ stage: 0 })).toBeGreaterThan(0);
  expect(getCultivationMultiplier({ stage: 5 })).toBeGreaterThan(getCultivationMultiplier({ stage: 1 }));
});

test('diminishing return factor', () => {
  expect(getDiminishingReturnFactor(1)).toBe(1);
  expect(getDiminishingReturnFactor(5)).toBeLessThan(1);
});

test('adjust damage for realm gap caps', () => {
  const dmg = adjustDamageForRealmGap({ attackerStage: 0, targetStage: 3, damage: 100, targetMaxHp: 1000 });
  expect(typeof dmg).toBe('number');
  expect(dmg).toBeGreaterThanOrEqual(1);
});
