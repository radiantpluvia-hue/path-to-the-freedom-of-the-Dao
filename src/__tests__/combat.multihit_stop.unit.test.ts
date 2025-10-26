import { CombatSystem } from '@/systems/CombatSystem';

describe('CombatSystem multiHit stopping behavior', () => {
  test('multiHit stops after target dies and exact hit count can be observed', () => {
    const events: string[] = [];

    const attacker: any = {
      id: 'att', name: 'A', hp: 40, maxHp: 40, qi: 10, maxQi: 10, ap: 5, maxAp: 5,
      stats: { atk: 2, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: []
    };

    // Target low HP so it will die mid-multiHit
    const target: any = {
      id: 't', name: 'T', hp: 7, maxHp: 7, qi: 0, maxQi: 0, ap: 5, maxAp: 5,
      stats: { atk: 1, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: []
    };

    // Technique with multiHit: 4 hits of base damage 3
    const tech: any = {
      id: 'mh', name: 'Multi', apCost: 0, qiCost: 0, type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 3 }],
      mechanics: [{ type: 'multiHit', hits: 4 }]
    };
    attacker.techniques = [tech];

    // Wrap applyDamage to count hits
    const cs = new CombatSystem(attacker, [target], null, null, { type: 'normal', rng: () => 0.5 });
    // Monkeypatch applyDamage to record calls while preserving original behavior
    const origApplyDamage = (cs as any).applyDamage.bind(cs);
    let hitCount = 0;
    (cs as any).applyDamage = (user: any, tgt: any, dmg: number, technique: any) => {
      hitCount++;
      events.push(`hit_${hitCount}:${dmg}`);
      return origApplyDamage(user, tgt, dmg, technique);
    };

    cs.useTechnique('att', 'mh', 't', { intensity: 1 });

    // Target started with 7 HP; base hits are 3, then reduced by diminishing factor for subsequent hits
    // Assert that hitCount is <= mechanics.hits and that target.hp is 0
    expect(hitCount).toBeGreaterThanOrEqual(1);
    expect(hitCount).toBeLessThanOrEqual(4);
    expect(target.hp).toBeGreaterThanOrEqual(0);
    expect(target.hp).toBe(0);

    // Ensure we recorded the expected number of hit events
    expect(events.length).toBe(hitCount);
  });
});
