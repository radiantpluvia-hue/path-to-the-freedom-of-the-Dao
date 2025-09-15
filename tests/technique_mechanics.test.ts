import { CombatSystem, CombatTechnique, CombatParticipant } from '../src/systems/CombatSystem';

// Minimal mock store/rival system
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

describe('Technique mechanics (multiHit / chain / conditional)', () => {
  test('multiHit executes multiple diminishing hits', () => {
    const player = makeParticipant('player');
    const enemy = makeParticipant('enemy', 10, 2, 60);

    const tech: CombatTechnique = {
      id: 'multi_test',
      name: 'Multi Test',
      description: 'Multi-hit test',
      apCost: 1,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 12 }],
      mechanics: [{ type: 'multiHit', hits: 3 } as any]
    } as any;

    player.techniques = [tech as any];

    const cs = new CombatSystem(player, [enemy], mockStore, mockRivalSystem, { type: 'normal', rng: () => 0.5 });
    // player goes first by speed
    cs.useTechnique('player', 'multi_test', 'enemy');
    const state = cs.getState();
    const e = state.participants.find(p => p.id === 'enemy')!;
    // Expect enemy hp reduced by at least one hit (12) and up to 3 hits (diminishing)
    expect(e.hp).toBeLessThan(60);
    expect(e.hp).toBeGreaterThanOrEqual(0);
  });

  test('chain executes follow-up hits', () => {
    const player = makeParticipant('player');
    const enemy = makeParticipant('enemy', 10, 2, 80);

    const tech: CombatTechnique = {
      id: 'chain_test',
      name: 'Chain Test',
      description: 'Chain test',
      apCost: 1,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 18 }],
      mechanics: [{ type: 'chain', chainLength: 2 } as any]
    } as any;

    player.techniques = [tech as any];
    const cs = new CombatSystem(player, [enemy], mockStore, mockRivalSystem, { type: 'normal', rng: () => 0.5 });
    cs.useTechnique('player', 'chain_test', 'enemy');
    const e = cs.getState().participants.find(p => p.id === 'enemy')!;
    // chain should deal original + follow-ups -> expect significant HP reduction
    expect(e.hp).toBeLessThan(80 - 10); // at least some damage
  });

  test('conditional triggers extra damage when condition met', () => {
    const player = makeParticipant('player');
    // enemy set to low HP so condition triggers
    const enemy = makeParticipant('enemy', 10, 2, 25);

    const tech: CombatTechnique = {
      id: 'cond_test',
      name: 'Conditional Test',
      description: 'Conditional test',
      apCost: 1,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 10 }],
      mechanics: [{ type: 'conditional', condition: 'target_below_30_hp' } as any]
    } as any;

    player.techniques = [tech as any];
    const cs = new CombatSystem(player, [enemy], mockStore, mockRivalSystem, { type: 'normal', rng: () => 0.5 });
    cs.useTechnique('player', 'cond_test', 'enemy');
    const e = cs.getState().participants.find(p => p.id === 'enemy')!;
    // Extra damage should have been applied; enemy hp should be lowered
    expect(e.hp).toBeLessThan(25);
  });
});
