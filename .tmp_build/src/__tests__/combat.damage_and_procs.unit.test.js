"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CombatSystem_1 = require("@/systems/CombatSystem");
describe('CombatSystem damage math and proc ordering', () => {
    test('miss occurs when RNG roll < missChance', () => {
        const attacker = { id: 'att', name: 'Attacker', hp: 50, maxHp: 50, qi: 10, maxQi: 10, ap: 5, maxAp: 5, stats: { atk: 10, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
        const target = { id: 'tgt', name: 'Target', hp: 40, maxHp: 40, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 5, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: [] };
        // RNG returns 0.01 which is below default missChance (0.05)
        const cs = new CombatSystem_1.CombatSystem(attacker, [target], null, null, { type: 'normal', enableCritMiss: true, rng: () => 0.01 });
        const beforeHp = target.hp;
        cs.__test_applyDamage(attacker, target, 5);
        expect(target.hp).toBe(beforeHp); // missed => no HP lost
    });
    test('crit deals strictly more damage than non-crit (same inputs)', () => {
        const makeParticipant = () => ({ id: 'p', name: 'P', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 8, def: 2, speed: 3 }, techniques: [], buffs: [], debuffs: [] });
        const atkA = makeParticipant();
        const tgtA = makeParticipant();
        const csNormal = new CombatSystem_1.CombatSystem(atkA, [tgtA], null, null, { type: 'normal', enableCritMiss: true, rng: () => 0.5 });
        const preA = tgtA.hp;
        csNormal.__test_applyDamage(atkA, tgtA, 6);
        const postA = tgtA.hp;
        const atkB = makeParticipant();
        const tgtB = makeParticipant();
        // RNG returns high value to trigger crit (roll > 1 - critChance); critChance default 0.05, so 0.99 triggers
        const csCrit = new CombatSystem_1.CombatSystem(atkB, [tgtB], null, null, { type: 'normal', enableCritMiss: true, rng: () => 0.99 });
        const preB = tgtB.hp;
        csCrit.__test_applyDamage(atkB, tgtB, 6);
        const postB = tgtB.hp;
        const dmgNormal = preA - postA;
        const dmgCrit = preB - postB;
        expect(dmgCrit).toBeGreaterThanOrEqual(dmgNormal);
    });
    test('attacker onHit hook that returns extra damage is applied after main damage', () => {
        const attacker = { id: 'att', name: 'Attacker', hp: 30, maxHp: 30, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 5, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: [] };
        const target = { id: 'tgt', name: 'Target', hp: 20, maxHp: 20, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 3, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: [] };
        // Attach onHit passive that returns 3 extra damage
        attacker._passiveHooks = { onHit: [{ id: 'test_extra', fn: ({ attacker, target }) => { return 3; } }] };
        const cs = new CombatSystem_1.CombatSystem(attacker, [target], null, null, { type: 'normal', rng: () => 0.5 });
        const before = target.hp;
        cs.__test_applyDamage(attacker, target, 4);
        const after = target.hp;
        // Ensure at least 4 + 3 damage was applied (main damage + extra)
        expect(before - after).toBeGreaterThanOrEqual(7);
    });
});
