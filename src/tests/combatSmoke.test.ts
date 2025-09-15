import { CombatSystem, type CombatParticipant, type CombatTechnique, type CombatContext } from '@/systems/CombatSystem';

describe('CombatSystem smoke tests', () => {
  const makeParticipant = (id: string, name: string, stats: { atk: number; def: number; speed: number }, extra?: Partial<CombatParticipant>): CombatParticipant => ({
    id,
    name,
    hp: 100,
    maxHp: 100,
    qi: 100,
    maxQi: 100,
    ap: 5,
    maxAp: 5,
    stats,
    techniques: [],
    buffs: [],
    debuffs: [],
    ...extra,
  });

  test('stance change and mastery rank increments end-to-end', () => {
    const player = makeParticipant('player', 'Hero', { atk: 10, def: 5, speed: 20 });
    const enemy = makeParticipant('rival_1', 'Bandit', { atk: 5, def: 3, speed: 10 });

    // Simple zero-cost attack to grind mastery in one turn
    const jab: CombatTechnique = {
      id: 'jab',
      name: 'Jab',
      description: 'Quick jab',
      apCost: 0,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 1 }],
      cooldown: 0,
      currentCooldown: 0,
    };
    player.techniques.push(jab);

    const context: CombatContext = { type: 'normal', debugDamageBreakdown: false };
    const system = new CombatSystem(player, [enemy], undefined as any, undefined as any, context);

    // stance techniques are injected to player; shift to offensive
    expect(system.useTechnique('player', 'stance_offensive')).toBe(true);
    const stateAfterStance = system.getState();
    const playerAfterStance = stateAfterStance.participants.find(p => p.id === 'player')!;
    expect(playerAfterStance.stance).toBe('offensive');

    // Use jab 5 times to level mastery
    for (let i = 0; i < 5; i++) {
      const ok = system.useTechnique('player', 'jab', 'rival_1');
      expect(ok).toBe(true);
    }

    const state = system.getState();
    const playerNow = state.participants.find(p => p.id === 'player')!;
    const jabNow = playerNow.techniques.find(t => t.id === 'jab')!;
    expect(jabNow.masteryRank ?? 0).toBeGreaterThanOrEqual(1);
  });

  test('enemy telegraphs intent before acting', () => {
    // Enemy is faster so they are first in turn order
    const player = makeParticipant('player', 'Hero', { atk: 8, def: 5, speed: 10 });
    const enemy = makeParticipant('rival_2', 'Rogue', { atk: 6, def: 4, speed: 50 });

    enemy.techniques.push({
      id: 'claw',
      name: 'Claw',
      description: 'A quick swipe',
      apCost: 0,
      qiCost: 0,
      type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 3 }],
      cooldown: 0,
      currentCooldown: 0,
    });

    const system = new CombatSystem(player, [enemy], undefined as any, undefined as any, { type: 'normal' });

    // First endTurn aligns to player (since constructor starts at index 0 and then advances)
    system.endTurn();
    // Second endTurn triggers enemy action, which telegraphs intent
    system.endTurn();

    const intent = system.getEnemyIntent();
    expect(intent).toBeDefined();
    expect(intent!.actorId).toBe('rival_2');
    expect(intent!.intent).toBeDefined();
  });
});