import { CombatSystem } from '@/systems/CombatSystem';

describe('CombatSystem passive/proc ordering', () => {
  test('attacker onHit -> attacker proc -> target onHit ordering is respected', () => {
    const log: string[] = [];

    const attacker: any = {
      id: 'att', name: 'Attacker', hp: 20, maxHp: 20, qi: 10, maxQi: 10, ap: 5, maxAp: 5,
      stats: { atk: 5, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: []
    };

    const target: any = {
      id: 'tgt', name: 'Target', hp: 10, maxHp: 10, qi: 0, maxQi: 0, ap: 5, maxAp: 5,
      stats: { atk: 1, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: []
    };

    // Simple technique: single damage 5
    const tech: any = {
      id: 'simple', name: 'Simple Strike', apCost: 0, qiCost: 0, type: 'attack',
      effects: [{ type: 'damage', target: 'enemy', value: 5 }]
    };
    attacker.techniques = [tech];

    // Attach passive hook arrays expected by CombatSystem
    (attacker as any)._passiveHooks = {
      onHit: [
        {
          id: 'att_onhit_1',
          fn: ({ attacker: a, target: t }: any) => {
            log.push('attacker_onHit');
            // return extra damage to be applied to target
            return 2;
          }
        }
      ],
      proc: [
        {
          id: 'att_proc_1',
          fn: ({ attacker: a, target: t }: any) => {
            log.push('attacker_proc');
            // no direct damage, just record ordering
          }
        }
      ]
    };

    (target as any)._passiveHooks = {
      onHit: [
        {
          id: 'tgt_onhit_1',
          fn: ({ attacker: a, target: t, damage }: any) => {
            log.push('target_onHit');
            // deal 1 damage back to attacker
            return 1;
          }
        }
      ]
    };

    // Use a deterministic RNG that won't produce crits/misses (0.5)
    const rng = () => 0.5;

    const cs = new CombatSystem(attacker, [target], null, null, { type: 'normal', rng, enableCritMiss: false });

    // Execute technique
    cs.useTechnique('att', 'simple', 'tgt', { intensity: 1 });

  // Validate ordering
  expect(log).toEqual(['attacker_onHit', 'attacker_proc', 'target_onHit']);

  // Validate HP changes qualitatively (avoid brittle exact damage math):
  // - target should have lost at least the extra 2 damage from attacker's onHit
  // - attacker should have taken the 1 damage returned by target's onHit
  const targetHpBefore = 10;
  expect(target.hp).toBeLessThan(targetHpBefore);
  expect(targetHpBefore - target.hp).toBeGreaterThanOrEqual(2);

  expect(attacker.hp).toBe(19);
  });
});
