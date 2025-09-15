"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useGameStore_1 = require("@/store/useGameStore");
describe('Lore System', () => {
    beforeEach(() => {
        // Reset the store to initial state before each test
        useGameStore_1.useGameStore.setState(useGameStore_1.useGameStore.getInitialState());
    });
    it('should navigate through the lore correctly', () => {
        const store = useGameStore_1.useGameStore.getState();
        // Initial state
        expect(store.ui.currentLoreIndex).toBe(0);
        // Navigate to the next lore
        useGameStore_1.useGameStore.getState().nextLore();
        expect(useGameStore_1.useGameStore.getState().ui.currentLoreIndex).toBe(1);
        // Navigate to the next lore again
        useGameStore_1.useGameStore.getState().nextLore();
        expect(useGameStore_1.useGameStore.getState().ui.currentLoreIndex).toBe(2);
        // Skip to the end of the lore
        const loreLength = useGameStore_1.useGameStore.getState().taiYungLore.length;
        for (let i = 2; i < loreLength - 1; i++) {
            useGameStore_1.useGameStore.getState().nextLore();
        }
        // Check if it navigates to the end
        expect(useGameStore_1.useGameStore.getState().ui.currentLoreIndex).toBe(loreLength - 1);
        // Check if it transitions to the creation screen when going beyond the lore
        useGameStore_1.useGameStore.getState().nextLore();
        expect(useGameStore_1.useGameStore.getState().ui.currentScreen).toBe('creation');
        expect(useGameStore_1.useGameStore.getState().ui.showLore).toBe(false);
    });
    it('should skip lore correctly', () => {
        // Initial state
        expect(useGameStore_1.useGameStore.getState().ui.currentScreen).toBe('lore');
        expect(useGameStore_1.useGameStore.getState().ui.showLore).toBe(true);
        // Skip the lore
        useGameStore_1.useGameStore.getState().skipLore();
        // Should transition to creation screen
        expect(useGameStore_1.useGameStore.getState().ui.currentScreen).toBe('creation');
        expect(useGameStore_1.useGameStore.getState().ui.showLore).toBe(false);
    });
});
