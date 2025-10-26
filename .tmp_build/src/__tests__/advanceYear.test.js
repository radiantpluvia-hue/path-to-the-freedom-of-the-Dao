"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useGameStore_1 = require("@/store/useGameStore");
describe('advanceYear action', () => {
    beforeEach(() => {
        // Reset minimal player state
        const s = useGameStore_1.useGameStore.getState();
        useGameStore_1.useGameStore.setState({ player: { ...s.player, age: 40, lifespan: 150 } });
    });
    test('advanceYear increments age and records event', () => {
        const s1 = useGameStore_1.useGameStore.getState();
        const initialAge = s1.player.age || 0;
        const res = useGameStore_1.useGameStore.getState().advanceYear();
        const s2 = useGameStore_1.useGameStore.getState();
        expect(res).toBe(true);
        expect(s2.player.age).toBe(initialAge + 1);
        // lifePhaseSystem snapshot should exist in systems
        expect(s2.systems).toBeDefined();
    });
});
