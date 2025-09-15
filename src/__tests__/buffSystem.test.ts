import { BuffSystem } from '@/systems/BuffSystem';

describe('BuffSystem', () => {
  let sys: BuffSystem;

  beforeEach(() => {
    sys = new BuffSystem();
  });

  test('createBuff returns a Buff with expected fields', () => {
    const item = { itemId: 'potion_1', name: 'Test Potion', description: 'Test', uniqueProperties: {} };
    const buff = sys.createBuff(item, 'test', { stats: { atk: 5 } }, 3, 'ticks');

    expect(buff).toHaveProperty('id');
    expect(buff.name).toBe('Test Potion');
    expect(buff.duration).toBe(3);
    expect(buff.effects).toBeDefined();
  });

  test('applyBuff applies stat bonuses and records appliedEffects', () => {
    const item = { itemId: 'potion_2', name: 'Power Potion', uniqueProperties: {} };
    const buff = sys.createBuff(item, 'power', { stats: { atk: 10, def: { percent: 0.1 } } }, 2);

    const player: any = {
      activeBuffs: [],
      stats: { atk: 10, def: 10 },
      baseStats: { atk: 10, def: 10 }
    };

  const updated = sys.applyBuff(player, buff) as any;
  expect(updated.activeBuffs.length).toBe(1);
  expect(updated.stats.atk).toBe(20);
  // ensure appliedEffects exists and contains expected values
  expect(updated.activeBuffs[0].appliedEffects).toBeDefined();
  expect((updated.activeBuffs[0].appliedEffects.stats || {}).atk).toBe(10);
  // percent def should have been applied as floor(base * percent)
  expect((updated.activeBuffs[0].appliedEffects.stats || {}).def).toBe(Math.floor(10 * 0.1));
  });

  test('revertBuffs reverts applied stat bonuses', () => {
    const item = { itemId: 'potion_3', name: 'Minor Potion', uniqueProperties: {} };
    const buff = sys.createBuff(item, 'minor', { stats: { atk: 3 } }, 1);
    const player: any = {
      activeBuffs: [buff],
      stats: { atk: 13 },
      baseStats: { atk: 10 }
    };
    // Simulate appliedEffects
    player.activeBuffs[0].appliedEffects = { stats: { atk: 3 } };

    const reverted = sys.revertBuffs(player, [player.activeBuffs[0]]);
    expect(reverted.stats.atk).toBe(10);
  });
});
