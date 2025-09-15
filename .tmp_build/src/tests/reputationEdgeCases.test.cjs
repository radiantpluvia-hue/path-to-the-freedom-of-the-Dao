"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CombatSystem_1 = require("../systems/CombatSystem");
const RivalSystem_1 = require("../systems/RivalSystem");
// Minimal mocks to exercise applyFactionStatAdjustments via constructor
const fakeStore = {
    player: {
        id: 'player',
        name: 'Test Player',
        stats: { atk: 10, def: 10, speed: 10 },
        sect: 'test_sect'
    },
    getSectReputation: (sect) => NaN,
    getFactionStanding: (faction) => NaN,
};
describe('Reputation edge cases', () => {
    test('should handle NaN sect reputation gracefully', () => {
        const rivalSystem = new RivalSystem_1.RivalSystem();
        // Build a simple player and no enemies
        const player = {
            id: 'player',
            name: 'Test Player',
            hp: 100,
            maxHp: 100,
            qi: 50,
            maxQi: 50,
            ap: 5,
            maxAp: 5,
            stats: { atk: 10, def: 10, speed: 10 },
            techniques: [],
            buffs: [],
            debuffs: []
        };
        const combat = new CombatSystem_1.CombatSystem(player, [], fakeStore, rivalSystem, { type: 'normal' });
        const state = combat.getState();
        // Should construct without throwing and with stats clamped to sensible values
        expect(state.participants[0].stats.atk).toBeGreaterThanOrEqual(1);
        expect(state.participants[0].stats.def).toBeGreaterThanOrEqual(1);
        expect(state.participants[0].stats.speed).toBeGreaterThanOrEqual(1);
    });
});
