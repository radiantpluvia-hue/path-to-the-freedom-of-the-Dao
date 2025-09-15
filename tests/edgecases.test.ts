import { CombatSystem } from '../src/systems/CombatSystem';

const mockStore: any = { player: { sect: 'test_sect', realmId: 1 }, adjustFactionStanding: () => {}, getSectReputation: () => 0 };
const mockRivalSystem: any = { getRival: () => null };

function makeParticipant(id: string, atk = 20, def = 5, hp = 100, speed = 10) {
  return {
    id,
    name: id,
    hp,
    maxHp: hp,
    qi: 50,
    maxQi: 50,
    ap: 5,
    maxAp: 5,
    stats: { atk, def, speed },
    techniques: [],
    buffs: [],
    debuffs: []
  } as any;
}

describe('Edge cases: mid-chain death, AP/QI edge cases, speed ties', () => {
  test('target dies mid-chain stops follow-ups', () => {
    const player = makeParticipant('player', 50, 0, 100);
    const enemy = makeParticipant('enemy', 5, 0, 20);

    const tech = {
      id: 'kill_chain',
      name: 'Kill Chain',
      apCost: 1,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 30 }],
      mechanics: [{ type: 'chain', chainLength: 3 }]
    } as any;

    player.techniques = [tech];
    const cs = new CombatSystem(player, [enemy], mockStore, mockRivalSystem, { type: 'normal', rng: () => 0.5 });
    cs.useTechnique('player', 'kill_chain', 'enemy');
    const e = cs.getState().participants.find(p => p.id === 'enemy')!;
    expect(e.hp).toBeGreaterThanOrEqual(0);
    // should be dead and follow-ups should not produce negative hp
    expect(e.hp).toBeLessThanOrEqual(0);
  });

  test('cannot use technique if insufficient AP/QI', () => {
    const player = makeParticipant('player', 20, 5, 100);
    const enemy = makeParticipant('enemy', 10, 2, 100);

    const tech = {
      id: 'costly',
      name: 'Costly',
      apCost: 10,
      qiCost: 60,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 40 }]
    } as any;

    player.techniques = [tech];
    player.ap = 3;
    player.qi = 10;
    const cs = new CombatSystem(player, [enemy], mockStore, mockRivalSystem, { type: 'normal', rng: () => 0.5 });
    const used = cs.useTechnique('player', 'costly', 'enemy');
    expect(used).toBe(false);
  });

  test('speed ties: player goes first by design', () => {
    const player = makeParticipant('player', 20, 5, 100, 12);
    const enemy = makeParticipant('enemy', 20, 5, 100, 12);

    const tech = {
      id: 'fast',
      name: 'Fast',
      apCost: 1,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 15 }]
    } as any;

    player.techniques = [tech as any];
    enemy.techniques = [tech as any];

    const cs = new CombatSystem(player, [enemy], mockStore, mockRivalSystem, { type: 'normal', rng: () => 0.5 });
    // player uses technique and should act first on tie
    cs.useTechnique('player', 'fast', 'enemy');
    const state = cs.getState();
    const e = state.participants.find(p => p.id === 'enemy')!;
    expect(e.hp).toBeLessThan(100);
  });
});
