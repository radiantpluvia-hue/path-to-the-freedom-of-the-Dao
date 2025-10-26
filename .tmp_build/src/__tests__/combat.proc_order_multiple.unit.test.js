"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CombatSystem_1 = require("@/systems/CombatSystem");
describe('CombatSystem passive/proc ordering with multiple hooks and RNG-driven procs', () => {
    test('multiple onHit and proc hooks execute in expected order and RNG affects proc invocation', () => {
        const log = [];
        const attacker = {
            id: 'att', name: 'Attacker', hp: 30, maxHp: 30, qi: 10, maxQi: 10, ap: 5, maxAp: 5,
            stats: { atk: 6, def: 0, speed: 3 }, techniques: [], buffs: [], debuffs: []
        };
        const target = {
            id: 'tgt', name: 'Target', hp: 25, maxHp: 25, qi: 0, maxQi: 0, ap: 5, maxAp: 5,
            stats: { atk: 1, def: 0, speed: 2 }, techniques: [], buffs: [], debuffs: []
        };
        const tech = { id: 'atk', name: 'Strike', apCost: 0, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 6 }] };
        attacker.techniques = [tech];
        // Two attacker onHit hooks - first returns extra damage 2, second returns extra damage 1
        attacker._passiveHooks = {
            onHit: [
                { id: 'a_onhit_1', fn: () => { log.push('a_onhit_1'); return 2; } },
                { id: 'a_onhit_2', fn: () => { log.push('a_onhit_2'); return 1; } }
            ],
            proc: [
                // Proc that triggers only if rng() < 0.2
                { id: 'a_proc_1', fn: ({ rng }) => { if (rng() < 0.2) {
                        log.push('a_proc_1');
                    } } },
                // Proc that triggers only if rng() < 0.9
                { id: 'a_proc_2', fn: ({ rng }) => { if (rng() < 0.9) {
                        log.push('a_proc_2');
                    } } }
            ]
        };
        // Target has a single onHit that reflects 1 damage
        target._passiveHooks = {
            onHit: [{ id: 't_onhit_1', fn: () => { log.push('t_onhit_1'); return 1; } }]
        };
        // Deterministic RNG sequence: first call for crit/miss checks (unused here), then proc checks
        const seq = [0.5, 0.15, 0.85]; // ensures a_proc_1 triggers (0.15<0.2) and a_proc_2 triggers (0.85<0.9)
        let idx = 0;
        const rng = () => seq[idx++ % seq.length];
        const cs = new CombatSystem_1.CombatSystem(attacker, [target], null, null, { type: 'normal', rng, enableCritMiss: false });
        cs.useTechnique('att', 'atk', 'tgt', { intensity: 1 });
        // Expected ordering:
        // attacker onHit hooks (in array order) -> attacker proc hooks (in array order, conditionally) -> target onHit
        expect(log[0]).toBe('a_onhit_1');
        expect(log[1]).toBe('a_onhit_2');
        // both procs should have fired given sequence
        expect(log.slice(2, 4)).toEqual(['a_proc_1', 'a_proc_2']);
        expect(log[4]).toBe('t_onhit_1');
        // Qualitative HP checks: target should have lost base + extra damage from onHit hooks
        expect(target.hp).toBeLessThan(25);
        expect(25 - target.hp).toBeGreaterThanOrEqual(3); // at least 2+1 from onHit
        // attacker should have taken 1 from target reflection
        expect(attacker.hp).toBe(29);
    });
});
