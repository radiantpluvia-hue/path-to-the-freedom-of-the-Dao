"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
describe('mission claim smoke test', () => {
    test('mock store exposes claimMissionRewards', () => {
        const { useGameStoreMock } = (0, mockUseGameStore_1.mockUseGameStore)();
        expect(useGameStoreMock).toBeDefined();
        const view = useGameStoreMock.getState();
        // claimMissionRewards should be a function available on the store view
        expect(typeof view.claimMissionRewards).toBe('function');
    });
});
