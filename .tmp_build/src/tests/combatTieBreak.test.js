"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CombatSystem_1 = require("../systems/CombatSystem");
const combatConfig_1 = require("../systems/combatConfig");
describe('CombatSystem turn-order tie-breaker parity', () => {
    test('player goes first on identical speed and prowess', () => {
        const player = {
            id: 'player', name: 'Player', hp: 100, maxHp: 100, qi: 50, maxQi: 50,
            ap: 5, maxAp: 5,
            stats: { atk: 10, def: 10, speed: 10 },
            techniques: [], buffs: [], debuffs: []
        };
        const enemy = {
            id: 'enemy1', name: 'Enemy', hp: 100, maxHp: 100, qi: 50, maxQi: 50,
            ap: 5, maxAp: 5,
            stats: { atk: 10, def: 10, speed: 10 },
            techniques: [], buffs: [], debuffs: []
        };
        const cs = new CombatSystem_1.CombatSystem(player, [enemy], null, null, { type: 'normal' });
        const order = cs.getState().turnOrder;
        expect(order[0]).toBe('player');
    });
    test('computeOffensiveProwess matches inline heuristic', () => {
        const e = { stats: { atk: 20, speed: 6 } };
        const inline = (e.stats.atk || 0) + ((e.stats.speed || 0) * 0.5);
        expect((0, combatConfig_1.computeOffensiveProwess)(e)).toBe(inline);
    });
});
