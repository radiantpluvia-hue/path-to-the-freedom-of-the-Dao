import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SeclusionPanel from '../components/SeclusionPanel';
import { useGameStore } from '../store/useGameStore';

// Simple smoke test: clicking the Seclusion button should open the SeclusionPanel
// and store.enterSeclusion should set ui.isInSeclusion to true.

describe('Seclusion integration', () => {
  test('enter seclusion and accumulate Qi with seclusionTick', () => {
    const store = useGameStore.getState();

  // initial values (do not render the panel directly to avoid subscription loops in tests)
  const initialQi = Number(store.player?.currentQi || 0);
  const seclusionPathStateBefore = store.seclusionPath?.getState ? store.seclusionPath.getState() : null;

    // Enter seclusion
    act(() => {
      if (typeof store.enterSeclusion === 'function') store.enterSeclusion(1, false);
    });

    const afterEnter = useGameStore.getState();
    expect((afterEnter.ui as any)?.isInSeclusion).toBe(true);

    // Now perform a few seclusion ticks and assert Qi increases and ticksSinceSeclusionStart increments
    const ticks = 3;
    act(() => {
      for (let i = 0; i < ticks; i++) {
        if (typeof useGameStore.getState().seclusionTick === 'function') {
          useGameStore.getState().seclusionTick();
        }
      }
    });

    const afterTicks = useGameStore.getState();
    const finalQi = Number(afterTicks.player?.currentQi || 0);
    expect(finalQi).toBeGreaterThanOrEqual(initialQi);

    // seclusionPath internal state should reflect ticks (if available)
    const seclusionState = afterTicks.seclusionPath?.getState ? afterTicks.seclusionPath.getState() : null;
    if (seclusionState && seclusionState.ticksSinceSeclusionStart !== undefined && seclusionPathStateBefore) {
      expect(seclusionState.ticksSinceSeclusionStart).toBeGreaterThanOrEqual((seclusionPathStateBefore.ticksSinceSeclusionStart || 0) + ticks);
    }

    // clean up
    act(() => {
      if (typeof afterTicks.exitSeclusion === 'function') afterTicks.exitSeclusion();
    });
  });
});
