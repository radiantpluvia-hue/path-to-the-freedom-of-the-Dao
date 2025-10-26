import LawSystem from '../systems/LawSystem';

test('law system taxation applies to faction treasuries', () => {
  const gs: any = { world: { territories: {}, factions: {} } };
  gs.world.territories['t1'] = { id: 't1', ownerFactionId: 'f1', garrison: { troops: 200 } };
  gs.world.factions['f1'] = { id: 'f1', treasury: { gold: 10 } };
  LawSystem.applyScheduledLaws(gs);
  expect(gs.world.factions['f1'].treasury.gold).toBeGreaterThan(10);
});
