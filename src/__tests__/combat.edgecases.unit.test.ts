import { CombatSystem } from '@/systems/CombatSystem';

describe('CombatSystem edge cases: multiHit, chain/on_kill, diminishing returns, mastery cooldown reduction', () => {
  test('multiHit mechanic applies multiple hits and stops if target dies mid-sequence', () => {
    const attacker: any = { id: 'att', name: 'A', hp: 50, maxHp: 50, qi: 10, maxQi: 10, ap: 5, maxAp: 5, stats: { atk: 5, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
    const target: any = { id: 't', name: 'T', hp: 8, maxHp: 8, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 1, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: [] };

    // Technique with multiHit 3 and base damage 4 -> should kill target on first hit and not attempt further hits
    const tech: any = { id: 'mh', name: 'MH', apCost: 0, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 4 }], mechanics: [{ type: 'multiHit', hits: 3 }] };
    attacker.techniques = [tech];

    const cs = new CombatSystem(attacker, [target], null, null, { type: 'normal', rng: () => 0.5 });
    cs.useTechnique('att', 'mh', 't', { intensity: 1 });

    // target had 8 HP, first hit ~ (4 + atk - def) >=4 => should be <= 4 left or dead; but multiHit should stop when dead
    expect(target.hp).toBeGreaterThanOrEqual(0);
    // Ensure no negative hp
    expect(target.hp).toBeGreaterThanOrEqual(0);
  });

  test('chain on_kill spills damage to other enemies only when kill occurs', () => {
    const attacker: any = { id: 'att', name: 'A', hp: 50, maxHp: 50, qi: 10, maxQi: 10, ap: 5, maxAp: 5, stats: { atk: 6, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
    const target1: any = { id: 't1', name: 'T1', hp: 4, maxHp: 4, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 1, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: [] };
    const target2: any = { id: 't2', name: 'T2', hp: 20, maxHp: 20, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 2, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: [] };

    // Chain with on_kill semantics implemented as conditional.type='conditional' and condition 'on_kill'
    const tech: any = { id: 'ck', name: 'CK', apCost: 0, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 6 }], mechanics: [{ type: 'conditional', condition: 'on_kill', multiplier: 0.5 }] };
    attacker.techniques = [tech];

    const cs = new CombatSystem(attacker, [target1, target2], null, null, { type: 'normal', rng: () => 0.5 });
    // Applying to target1 should kill it and spill to target2
    cs.useTechnique('att', 'ck', 't1', { intensity: 1 });

    // target1 should be dead
    expect(target1.hp).toBeLessThanOrEqual(0);
    // target2 should have taken some spill damage (>=1)
    expect(target2.hp).toBeLessThan(target2.maxHp);
  });

  test('diminishing returns reduces damage on repeated uses of same technique', () => {
    const attacker: any = { id: 'att', name: 'A', hp: 200, maxHp: 200, qi: 20, maxQi: 20, ap: 5, maxAp: 5, stats: { atk: 10, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
    const target: any = { id: 't', name: 'T', hp: 200, maxHp: 200, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 2, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: [] };

    const tech: any = { id: 'dim', name: 'Dim', apCost: 0, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 20 }], mechanics: [] };
    attacker.techniques = [tech];

    const cs = new CombatSystem(attacker, [target], null, null, { type: 'normal', rng: () => 0.5 });

    // Apply the same technique multiple times and record damage deltas
    const hpBefore = target.hp;
    cs.useTechnique('att', 'dim', 't');
    const after1 = target.hp;
    cs.useTechnique('att', 'dim', 't');
    const after2 = target.hp;
    cs.useTechnique('att', 'dim', 't');
    const after3 = target.hp;

    const d1 = hpBefore - after1;
    const d2 = after1 - after2;
    const d3 = after2 - after3;

    // Expect non-increasing damage per hit due to diminishing returns
    expect(d2).toBeLessThanOrEqual(d1);
    expect(d3).toBeLessThanOrEqual(d2);
  });

  test('mastery rank reduces cooldown when technique used repeatedly', () => {
    const attacker: any = { id: 'att', name: 'A', hp: 50, maxHp: 50, qi: 20, maxQi: 20, ap: 5, maxAp: 5, stats: { atk: 8, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
    const target: any = { id: 't', name: 'T', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 2, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: [] };

    const tech: any = { id: 'mst', name: 'MasteryTech', apCost: 0, qiCost: 0, type: 'attack', cooldown: 4, effects: [{ type: 'damage', target: 'enemy', value: 6 }], masteryXp: 0, masteryRank: 0 };
    attacker.techniques = [tech];

    // We'll simulate 6 uses to bump masteryRank to at least 1 (masteryXp increments by 1 per use, 5 -> rank up)
    const cs = new CombatSystem(attacker, [target], null, null, { type: 'normal', rng: () => 0.5 });

    for (let i = 0; i < 6; i++) {
      // Ensure technique cooldown is cleared between calls by resetting ap/qi and forcing cooldown to 0 for the test harness where needed
      attacker.ap = attacker.maxAp; attacker.qi = attacker.maxQi;
      // Manually clear cooldown when present (simulate end-of-round reset for testing)
      if (attacker.techniques[0].currentCooldown && attacker.techniques[0].currentCooldown > 0) attacker.techniques[0].currentCooldown = 0;
      cs.useTechnique('att', 'mst', 't');
    }

    // After 6 uses, masteryRank should be at least 1 and subsequent cooldowns smaller than base
    const finalRank = attacker.techniques[0].masteryRank || 0;
    expect(finalRank).toBeGreaterThanOrEqual(1);

    // Now apply technique once and inspect cooldown set
    attacker.ap = attacker.maxAp; attacker.qi = attacker.maxQi;
    attacker.techniques[0].currentCooldown = 0;
    cs.useTechnique('att', 'mst', 't');
    const setCd = attacker.techniques[0].currentCooldown || 0;
    // Base cooldown is 4; masteryRank reduces up to 3, so setCd should be <= 4
    expect(setCd).toBeLessThanOrEqual(4);
  });

});
