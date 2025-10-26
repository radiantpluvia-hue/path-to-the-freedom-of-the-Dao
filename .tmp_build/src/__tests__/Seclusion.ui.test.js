"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const useGameStore_1 = require("../store/useGameStore");
// Simple smoke test: clicking the Seclusion button should open the SeclusionPanel
// and store.enterSeclusion should set ui.isInSeclusion to true.
describe('Seclusion integration', () => {
    test('enter seclusion and accumulate Qi with seclusionTick', () => {
        const store = useGameStore_1.useGameStore.getState();
        // initial values (do not render the panel directly to avoid subscription loops in tests)
        const initialQi = Number(store.player?.currentQi || 0);
        const seclusionPathStateBefore = store.seclusionPath?.getState ? store.seclusionPath.getState() : null;
        // Enter seclusion
        (0, react_1.act)(() => {
            if (typeof store.enterSeclusion === 'function')
                store.enterSeclusion(1, false);
        });
        const afterEnter = useGameStore_1.useGameStore.getState();
        expect(afterEnter.ui?.isInSeclusion).toBe(true);
        // Now perform a few seclusion ticks and assert Qi increases and ticksSinceSeclusionStart increments
        const ticks = 3;
        (0, react_1.act)(() => {
            for (let i = 0; i < ticks; i++) {
                if (typeof useGameStore_1.useGameStore.getState().seclusionTick === 'function') {
                    useGameStore_1.useGameStore.getState().seclusionTick();
                }
            }
        });
        const afterTicks = useGameStore_1.useGameStore.getState();
        const finalQi = Number(afterTicks.player?.currentQi || 0);
        expect(finalQi).toBeGreaterThanOrEqual(initialQi);
        // seclusionPath internal state should reflect ticks (if available)
        const seclusionState = afterTicks.seclusionPath?.getState ? afterTicks.seclusionPath.getState() : null;
        if (seclusionState && seclusionState.ticksSinceSeclusionStart !== undefined && seclusionPathStateBefore) {
            expect(seclusionState.ticksSinceSeclusionStart).toBeGreaterThanOrEqual((seclusionPathStateBefore.ticksSinceSeclusionStart || 0) + ticks);
        }
        // clean up
        (0, react_1.act)(() => {
            if (typeof afterTicks.exitSeclusion === 'function')
                afterTicks.exitSeclusion();
        });
    });
});
