import { CombatSystem } from '../systems/CombatSystem';
import { RivalSystem } from '../systems/RivalSystem';

// Minimal mocks to exercise applyFactionStatAdjustments via constructor
const fakeStore: any = {
  player: {
    id: 'player',
    name: 'Test Player',
    stats: { atk: 10, def: 10, speed: 10 },
    sect: 'test_sect'
  },
  getSectReputation: (sect: string) => NaN,
  getFactionStanding: (faction: string) => NaN,
};

describe('Reputation edge cases', () => {
  test('should handle NaN sect reputation gracefully', () => {
    const rivalSystem = new RivalSystem();
    // Build a simple player and no enemies
    const player = {
      id: 'player',
      name: 'Test Player',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: { atk: 10, def: 10, speed: 10 },
      techniques: [],
      buffs: [],
      debuffs: []
    } as any;

    const combat = new CombatSystem(player, [], fakeStore, rivalSystem, { type: 'normal' });
    const state = combat.getState();
    // Should construct without throwing and with stats clamped to sensible values
    expect(state.participants[0].stats.atk).toBeGreaterThanOrEqual(1);
    expect(state.participants[0].stats.def).toBeGreaterThanOrEqual(1);
    expect(state.participants[0].stats.speed).toBeGreaterThanOrEqual(1);
  });
});
