import { useGameStore } from '@/store/useGameStore';

describe('Mini-game Store API', () => {
  beforeEach(() => {
    // Reset active mini-game and tick
    useGameStore.setState(state => ({
      world: { ...state.world, tick: 100 },
      ui: { ...state.ui, activeMiniGame: null },
      eventLog: []
    }));
  });

  it('should start and complete a mini-game session', () => {
    const sessionId = useGameStore.getState().startMiniGame('reaction_test', 'medium');
    const state1 = useGameStore.getState();
    expect(sessionId).toBeTruthy();
    expect(state1.ui.activeMiniGame).toBeTruthy();
    expect(state1.ui.activeMiniGame?.id).toBe('reaction_test');

    const outcome = useGameStore.getState().completeMiniGame({ moves: 25, timeLeft: 150, timeLimit: 300 });
    const state2 = useGameStore.getState();
    expect(outcome).not.toBeNull();
    expect((outcome as any).score).toBeGreaterThan(0);
    expect(state2.ui.activeMiniGame).toBeNull();
  });
});