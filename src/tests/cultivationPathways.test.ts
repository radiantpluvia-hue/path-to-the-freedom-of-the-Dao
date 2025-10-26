import CultivationSystem from '../systems/CultivationSystem';

test('select pathway and apply bonuses to stats', () => {
  const player: any = {};
  const ok = CultivationSystem.selectPathway(player, 'path_soul_refine');
  expect(ok).toBeTruthy();
  const base = { perception: 10, critChancePct: 1 };
  const result = CultivationSystem.applyPathwayBonuses(player, base);
  // Soul Refiner gives +5 perception and +2 critChancePct
  expect(result.perception).toBe(15);
  expect(result.critChancePct).toBe(3);
});
