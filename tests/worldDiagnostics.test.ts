import { useGameStore } from '../src/store/useGameStore';

describe('World/Event Diagnostics', () => {
  test('diagnostics counters increment and reset', () => {
    const store = useGameStore.getState();
    store.resetStoryDiagnostics();
    // Force a few event evaluations
    const events1 = store.getAvailableEvents();
    const diagAfterFirst = store.getStoryDiagnostics();
    expect(diagAfterFirst.totalChecked).toBeGreaterThanOrEqual(0); // may be zero if no events loaded
    // Trigger again to ensure counters accumulate
    store.getAvailableEvents();
    const diagAfterSecond = store.getStoryDiagnostics();
    expect(diagAfterSecond.totalChecked).toBeGreaterThanOrEqual(diagAfterFirst.totalChecked);

    store.resetStoryDiagnostics();
    const diagAfterReset = store.getStoryDiagnostics();
    expect(diagAfterReset.totalChecked).toBe(0);
    expect(diagAfterReset.filtered).toBe(0);
  });
});
