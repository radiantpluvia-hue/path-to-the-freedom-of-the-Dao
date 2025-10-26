import alignment, { onPlayerAction } from '@/systems/alignment';
import { onPlayerActionWithGu } from '@/systems/guBranch';
import { useGameStore } from '@/store/useGameStore';

describe('alignment onPlayerAction -> unlock flow', () => {
  it('unlocks demonic cultvator when ruthlessness threshold reached and emits UI feedback', () => {
    // prepare a minimal player state
    const player: any = { id: 'p1', name: 'Test', alignment: { id: 'neutral', axes: { virtue: 0, order: 0, independence: 0, ruthlessness: 55 } } };

    // mock store getters
    const storeMock: any = {
      story: { storyFlags: {} },
      addEventLog: jest.fn(),
      showToast: jest.fn(),
    };

    // bind to useGameStore getState/setState used in code
    (useGameStore as any).getState = () => storeMock;
    (useGameStore as any).setState = (fnOrObj: any) => {
      if (typeof fnOrObj === 'function') {
        const res = fnOrObj(storeMock);
        Object.assign(storeMock, res);
      } else Object.assign(storeMock, fnOrObj);
    };

    // perform an action that increases ruthlessness beyond threshold
  const runner = typeof onPlayerActionWithGu === 'function' ? onPlayerActionWithGu : onPlayerAction;
  runner(player, 'use_forbidden_art');

    // check background assigned
    expect(player.background).toBeTruthy();
    expect(player.background.id).toBe('demon_demonic_cultivator');

    // check story flag set
    expect(storeMock.story.storyFlags['unlocked_demonic_cultivator']).toBeTruthy();

    // check UI feedback called
    expect(storeMock.addEventLog).toHaveBeenCalled();
    expect(storeMock.showToast).toHaveBeenCalled();
  });
});
