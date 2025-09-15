"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CombatSystem_1 = require("../../src/systems/CombatSystem");
class MockGameStore {
    constructor() {
        this.player = { sect: 'test_sect' };
    }
    getSectReputation() { return 75; }
    getFactionStanding() { return 60; }
}
class MockRivalSystem {
    getRival(id) {
        return { personality: 'aggressive', faction: 'test_faction', relationship: 0 };
    }
}
test('debug aggressive rival stats', () => {
    const mockGameStore = new MockGameStore();
    const mockRivalSystem = new MockRivalSystem();
    const player = { id: 'player', name: 'Player', hp: 100, maxHp: 100, qi: 50, maxQi: 50, ap: 5, maxAp: 5, stats: { atk: 20, def: 15, speed: 10 }, techniques: [], buffs: [], debuffs: [] };
    const rival = { id: 'rival_aggressive', name: 'Agg', hp: 100, maxHp: 100, qi: 50, maxQi: 50, ap: 5, maxAp: 5, stats: { atk: 18, def: 16, speed: 12 }, techniques: [], buffs: [], debuffs: [] };
    const combat = new CombatSystem_1.CombatSystem(player, [rival], mockGameStore, mockRivalSystem, { type: 'rival', rivalId: 'rival_aggressive' });
    console.log('DEBUG PARTICIPANTS:', JSON.stringify(combat.getState().participants, null, 2));
});
