import { CombatSystem, CombatTechnique, CombatParticipant } from '../src/systems/CombatSystem';

const mockStore: any = { player: { sect: 'test_sect', realmId: 1 }, adjustFactionStanding: () => {}, getSectReputation: () => 0 };
const mockRivalSystem: any = { getRival: () => null };

function makeParticipant(id: string, atk = 20, def = 5, hp = 100): CombatParticipant {
  return {
    id,
    name: id,
    hp,
    maxHp: hp,
    qi: 50,
    maxQi: 50,
    ap: 5,
    maxAp: 5,
    stats: { atk, def, speed: 10 },
    techniques: [],
    buffs: [],
    debuffs: []
  } as any;
}

describe('on_kill spill mechanics', () => {
  test('killing a target spills damage to other enemies', () => {
    const player = makeParticipant('player', 30, 5, 100);
    const enemyA = makeParticipant('enemyA', 5, 1, 10); // fragile target
    const enemyB = makeParticipant('enemyB', 5, 1, 40);

    const tech: CombatTechnique = {
      id: 'execute_and_spill',
      name: 'Execute and Spill',
      description: 'If this attack kills, spill damage to others',
      apCost: 1,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 20 }],
      mechanics: [{ type: 'conditional', condition: 'on_kill', multiplier: 0.5 } as any]
    } as any;

    player.techniques = [tech as any];

    const cs = new CombatSystem(player, [enemyA, enemyB], mockStore, mockRivalSystem, { type: 'normal', rng: () => 0.5 });
    cs.useTechnique('player', 'execute_and_spill', 'enemyA');

    const state = cs.getState();
    const a = state.participants.find(p => p.id === 'enemyA')!;
    const b = state.participants.find(p => p.id === 'enemyB')!;

    // enemyA should be dead
    expect(a.hp).toBe(0);
    // enemyB should have taken spill damage (>=1)
    expect(b.hp).toBeLessThan(40);
  });
});
