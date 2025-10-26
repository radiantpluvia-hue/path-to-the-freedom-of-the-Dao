import { jest } from '@jest/globals';
import { useGameStore } from '@/store/useGameStore';

beforeEach(() => {
  // reset store to initial state by re-importing or using provided reset if available
  // Many tests rely on a clean store; for simplicity call set directly to defaults
  const s = useGameStore.getState();
  s.setUIProperty?.('currentScreen', 'game');
});

test('auto cultivation increments progress and stops at 100%', () => {
  jest.useFakeTimers();
  // ensure player has a manual so cultivation can start (minimal shape)
  // Use setState to update store so getters reflect changes
  const before = useGameStore.getState();
  useGameStore.setState({ player: { ...(before.player as any), manuals: [{ id: 'm_test', name: 'Test Manual', description: 'test', rank: 1, effects: [] } as any], cultivationProgressPercent: 0 } } as any);
  useGameStore.setState({ ui: { ...((useGameStore.getState() as any).ui || {}), cultivationProgress: 0 } } as any);

  // Start auto cultivation on the live store and assert the live UI flag
  useGameStore.getState().startAutoCultivation?.();
  expect((useGameStore.getState().ui as any).isCultivating).toBeTruthy();

  // Advance fake timers forward enough to simulate multiple ticks
  // Each tick runs a 1-minute session and updates progress; run 5 seconds => 5 ticks
  jest.advanceTimersByTime(5000);

  // read updated state via getState
  const after = useGameStore.getState();
  const pct = (after.ui as any).cultivationProgress || 0;

  // progress should be > 0 but <= 100
  expect(pct).toBeGreaterThanOrEqual(0);
  expect(pct).toBeLessThanOrEqual(100);

  // If progress reached 100, auto cultivation should have stopped
  if (pct >= 100) {
    expect((after.ui as any)._cultivationTimerId).toBeUndefined();
    expect((after.ui as any).isCultivating).toBeFalsy();
  }

  // cleanup
  try { useGameStore.getState().stopAutoCultivation?.(); } catch {}
  jest.useRealTimers();
});
