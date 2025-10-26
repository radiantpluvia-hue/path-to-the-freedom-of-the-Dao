import { onPlayerAction } from '@/systems/alignment';
import { onPlayerActionWithGu } from '@/systems/guBranch';
import { useGameStore } from '@/store/useGameStore';

describe('alignment integration (store) flow', () => {
  beforeEach(() => {
    // Reset the store to a minimal predictable state
    if ((useGameStore as any).setState) {
      (useGameStore as any).setState({
        player: { id: 'pi', name: 'Integration', alignment: { id: 'neutral', axes: { virtue: 0, order: 0, independence: 0, ruthlessness: 59 } }, background: null },
        story: { storyFlags: {} },
        eventLog: [],
        toast: null
      });
    }
  });

  it('applies unlock and writes to store eventLog and toast', () => {
    const stateBefore: any = (useGameStore as any).getState();
    const player = stateBefore.player as any;

    // perform action that pushes ruthlessness over threshold
  const runner = typeof onPlayerActionWithGu === 'function' ? onPlayerActionWithGu : onPlayerAction;
  runner(player, 'use_forbidden_art');

    const stateAfter: any = (useGameStore as any).getState();

    // background applied
    expect(stateAfter.player.background).toBeTruthy();
    expect(stateAfter.player.background.id).toBe('demon_demonic_cultivator');

    // story flag set
    expect(stateAfter.story.storyFlags['unlocked_demonic_cultivator']).toBeTruthy();

    // eventLog has last message about unlock
    const ev = stateAfter.eventLog[stateAfter.eventLog.length - 1] as string;
    expect(ev).toMatch(/unlocked a new path/i);

    // toast present
    expect(stateAfter.toast).toBeTruthy();
    expect((stateAfter.toast as any).message).toMatch(/Demonic Cultivator|unlocked a new path/i);
  });
});
