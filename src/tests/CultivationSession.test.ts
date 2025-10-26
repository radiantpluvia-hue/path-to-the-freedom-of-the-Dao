import { act } from '@testing-library/react';
import { useGameStore } from '../store/useGameStore';
import type { Rarity } from '../types';

describe('Cultivation Session Soft-Penalty and Heavy Anti-Spam', () => {
  beforeEach(() => {
    // Reset store state before each test
    const initialManual = { id: 'basic_manual', name: 'Basic Manual', description: 'A basic cultivation manual', rank: "H" as Rarity, effects: {} };
    useGameStore.setState({
      player: {
        ...useGameStore.getState().player,
        manuals: [initialManual],
        currentQi: 0,
        fatigue: 0,
        dailyCultivationCount: 0
      },
      eventLog: []
    });
  });

  test('Soft penalty applies after 3 sessions', () => {
    const store = useGameStore.getState();

    // Run 3 sessions without penalty
    for (let i = 0; i < 3; i++) {
      act(() => {
        useGameStore.getState().runCultivationSession(10);
      });
    }

    const qiAfter3 = useGameStore.getState().player.currentQi;
    const fatigueAfter3 = useGameStore.getState().player.fatigue;

    // Run 4th session with soft penalty
    act(() => {
      useGameStore.getState().runCultivationSession(10);
    });

    const qiAfter4 = useGameStore.getState().player.currentQi;
    const fatigueAfter4 = useGameStore.getState().player.fatigue;

    // Qi gained on 4th session should be less than or equal to 80% of previous average
    const avgQiPerSession = qiAfter3 / 3;
    const qiGained4 = qiAfter4 - qiAfter3;
    expect(qiGained4).toBeLessThanOrEqual(avgQiPerSession * 0.8 + 1); // +1 for rounding tolerance

    // Fatigue increase on 4th session should be more than previous average
    const fatigueIncrease3 = fatigueAfter3 || 0;
    const fatigueIncrease4 = (fatigueAfter4 || 0) - (fatigueAfter3 || 0);
    expect(fatigueIncrease4).toBeGreaterThanOrEqual(fatigueIncrease3 / 3);
  });

  test('Heavy anti-spam prevents sessions after 10', () => {
    // Run 10 sessions
    for (let i = 0; i < 10; i++) {
      act(() => {
        useGameStore.getState().runCultivationSession(10);
      });
    }

    const qiAfter10 = useGameStore.getState().player.currentQi;
    const fatigueAfter10 = useGameStore.getState().player.fatigue;
    const countAfter10 = useGameStore.getState().player.dailyCultivationCount;

    // Attempt 11th session - should be prevented
    act(() => {
      useGameStore.getState().runCultivationSession(10);
    });

    const qiAfter11 = useGameStore.getState().player.currentQi;
    const fatigueAfter11 = useGameStore.getState().player.fatigue;
    const countAfter11 = useGameStore.getState().player.dailyCultivationCount;

    // Qi, fatigue, and count should not increase after 11th session attempt
    expect(qiAfter11).toBe(qiAfter10);
    expect(fatigueAfter11).toBe(fatigueAfter10);
    expect(countAfter11).toBe(countAfter10);
  });
});
