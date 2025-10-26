/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { CombatSystem, CombatParticipant } from '@/systems/CombatSystem';

test('CombatSystem basic smoke', () => {
  const player: CombatParticipant = {
    id: 'player', name: 'Tester', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 0, maxAp: 3,
    stats: { atk: 10, def: 5, speed: 5 }, techniques: [], buffs: [], debuffs: []
  };
  const enemy: CombatParticipant = {
    id: 'e1', name: 'Enemy', hp: 50, maxHp: 50, qi: 0, maxQi: 0, ap: 0, maxAp: 2,
    stats: { atk: 6, def: 3, speed: 3 }, techniques: [], buffs: [], debuffs: []
  };
  const cs = new CombatSystem(player, [enemy], {}, null, { type: 'normal', rng: () => 0.5 });
  const state = cs.getState();
  expect(state.participants.length).toBe(2);
  expect(state.turnOrder.length).toBeGreaterThanOrEqual(2);
});
