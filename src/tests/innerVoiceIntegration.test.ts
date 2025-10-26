import { useGameStore } from '../store/useGameStore';
import * as InnerVoice from '../systems/InnerVoice';

describe('InnerVoice integration - breakthroughs', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // reset player to a known state
    const store = (useGameStore as any).getState();
    store.player = { ...(store.player as any), realm: 'mortal', currentQi: 0, qiRequired: 100 } as any;
    // ensure global mock is used by runtime requires
    (globalThis as any).InnerVoice = { enqueueThoughtAuto: jest.fn() };
  });

  test('checkRealmBreakthrough enqueues when enabled', () => {
    // Arrange: set enough Qi
    const store = (useGameStore as any).getState();
  store.player.currentQi = 1_000_000_000;

    // Act
    (useGameStore as any).getState().checkRealmBreakthrough();

    // Assert - enqueueThoughtAuto should have been called
    const fn = (globalThis as any).InnerVoice.enqueueThoughtAuto as jest.MockedFunction<any>;
    expect(fn).toHaveBeenCalled();
  });
});
