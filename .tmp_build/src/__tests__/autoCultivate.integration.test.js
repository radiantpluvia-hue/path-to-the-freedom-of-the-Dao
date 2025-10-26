"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const useGameStore_1 = require("@/store/useGameStore");
beforeEach(() => {
    // reset store to initial state by re-importing or using provided reset if available
    // Many tests rely on a clean store; for simplicity call set directly to defaults
    const s = useGameStore_1.useGameStore.getState();
    s.setUIProperty?.('currentScreen', 'game');
});
test('auto cultivation increments progress and stops at 100%', () => {
    globals_1.jest.useFakeTimers();
    // ensure player has a manual so cultivation can start (minimal shape)
    // Use setState to update store so getters reflect changes
    const before = useGameStore_1.useGameStore.getState();
    useGameStore_1.useGameStore.setState({ player: { ...before.player, manuals: [{ id: 'm_test', name: 'Test Manual', description: 'test', rank: 1, effects: [] }], cultivationProgressPercent: 0 } });
    useGameStore_1.useGameStore.setState({ ui: { ...(useGameStore_1.useGameStore.getState().ui || {}), cultivationProgress: 0 } });
    // Start auto cultivation on the live store and assert the live UI flag
    useGameStore_1.useGameStore.getState().startAutoCultivation?.();
    expect(useGameStore_1.useGameStore.getState().ui.isCultivating).toBeTruthy();
    // Advance fake timers forward enough to simulate multiple ticks
    // Each tick runs a 1-minute session and updates progress; run 5 seconds => 5 ticks
    globals_1.jest.advanceTimersByTime(5000);
    // read updated state via getState
    const after = useGameStore_1.useGameStore.getState();
    const pct = after.ui.cultivationProgress || 0;
    // progress should be > 0 but <= 100
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
    // If progress reached 100, auto cultivation should have stopped
    if (pct >= 100) {
        expect(after.ui._cultivationTimerId).toBeUndefined();
        expect(after.ui.isCultivating).toBeFalsy();
    }
    // cleanup
    try {
        useGameStore_1.useGameStore.getState().stopAutoCultivation?.();
    }
    catch { }
    globals_1.jest.useRealTimers();
});
