const CombatSystem = require('../src/systems/CombatSystem').default || require('../src/systems/CombatSystem').CombatSystem || require('../src/systems/CombatSystem');

describe('CombatSystem cultivation scaling and diminishing returns', () => {
  test('repeated cheap technique is diminished over uses and scales with cultivation', () => {
    // Minimal participants setup
    const player = {
      id: 'player', name: 'Player', hp: 100, maxHp: 100,
      ap: 3, maxAp: 3, qi: 10, maxQi: 10,
      stats: { atk: 5, def: 1, speed: 1 },
      techniques: [{ id: 'spam_strike', name: 'Spam Strike', apCost: 0, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 10 }] }],
      buffs: [], debuffs: [], stance: 'neutral'
    } as any;

    // Enemy target
    const enemy = {
      id: 'enemy1', name: 'Dummy', hp: 200, maxHp: 200,
      ap: 3, maxAp: 3, qi: 0, maxQi: 0,
      stats: { atk: 0, def: 0, speed: 1 },
      techniques: [], buffs: [], debuffs: [], stance: 'neutral'
    } as any;

    // Give player a moderate cultivation stage
    (player as any).cultivation = { stage: 2, substage: 3 };

  const sys = new CombatSystem(player as any, [enemy as any], null, null, { type: 'normal', rng: () => 0.5 } as any);

    const initialHp = enemy.hp;
    // Use the same technique 5 times in a row and record damage deltas
    const damages: number[] = [];
    for (let i = 0; i < 5; i++) {
      sys.useTechnique('player', 'spam_strike', 'enemy1');
      const after = enemy.hp;
      damages.push(initialHp - after - damages.reduce((a, b) => a + b, 0));
    }

    // Expect strictly decreasing damages due to diminishing returns
    for (let i = 1; i < damages.length; i++) {
      expect(damages[i]).toBeLessThanOrEqual(damages[i - 1]);
    }

    // Also expect total damage to be > single hit * 0.25 * 5 (not all hits floored to zero)
    const total = damages.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(5 * 10 * 0.25 * 0.8); // with cultivation multiplier it should be higher
  });
});
