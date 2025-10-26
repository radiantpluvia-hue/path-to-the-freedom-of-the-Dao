import { onPlayerAction } from '@/systems/alignment';
import { onPlayerActionWithGu } from '@/systems/guBranch';
import { useGameStore } from '@/store/useGameStore';

describe('alignment unlocks - additional rules', () => {
  beforeEach(() => {
    // reset store mock helpers if present
    (useGameStore as any).getState = () => ({ story: { storyFlags: {} } });
    (useGameStore as any).setState = (v: any) => {};
  });

  it('unlocks antihero when independence high and virtue low', () => {
    const player: any = { id: 'p2', name: 'AntiTest', alignment: { id: 'neutral', axes: { virtue: -15, order: 0, independence: 45, ruthlessness: 0 } } };
    const storeMock: any = { story: { storyFlags: {} }, addEventLog: jest.fn(), showToast: jest.fn() };
    (useGameStore as any).getState = () => storeMock;
    (useGameStore as any).setState = (fnOrObj: any) => { if (typeof fnOrObj === 'function') Object.assign(storeMock, fnOrObj(storeMock)); else Object.assign(storeMock, fnOrObj); };

  const runner = typeof onPlayerActionWithGu === 'function' ? onPlayerActionWithGu : onPlayerAction;
  runner(player, 'refuse_sect_mission');

    // Antihero is now an alignment milestone and should NOT be forced onto player.background.
    expect(player.background).toBeFalsy();
    expect(storeMock.story.storyFlags['unlocked_antihero']).toBeTruthy();
    expect(storeMock.addEventLog).toHaveBeenCalled();
  });

  it('unlocks rogue roaming when independence very high and order low', () => {
    const player: any = { id: 'p3', name: 'RogueTest', alignment: { id: 'neutral', axes: { virtue: 0, order: -30, independence: 62, ruthlessness: 0 } } };
    const storeMock: any = { story: { storyFlags: {} }, addEventLog: jest.fn(), showToast: jest.fn() };
    (useGameStore as any).getState = () => storeMock;
    (useGameStore as any).setState = (fnOrObj: any) => { if (typeof fnOrObj === 'function') Object.assign(storeMock, fnOrObj(storeMock)); else Object.assign(storeMock, fnOrObj); };

  const runner = typeof onPlayerActionWithGu === 'function' ? onPlayerActionWithGu : onPlayerAction;
  runner(player, 'refuse_sect_mission');

    // Rogue roaming is an alignment milestone only; background should not be assigned.
    expect(player.background).toBeFalsy();
    expect(storeMock.story.storyFlags['unlocked_human_rogue_roaming'] || storeMock.story.storyFlags['unlocked_rogue_roaming']).toBeTruthy();
    expect(storeMock.showToast).toHaveBeenCalled();
  });

  it('honors precedence - demonic should take precedence over antihero if both match', () => {
    // Construct axes that match both demonic ruthlessness and antihero independence/virtue
    const player: any = { id: 'p4', name: 'PrecedenceTest', alignment: { id: 'neutral', axes: { virtue: -20, order: 0, independence: 50, ruthlessness: 65 } } };
    const storeMock: any = { story: { storyFlags: {} }, addEventLog: jest.fn(), showToast: jest.fn() };
    (useGameStore as any).getState = () => storeMock;
    (useGameStore as any).setState = (fnOrObj: any) => { if (typeof fnOrObj === 'function') Object.assign(storeMock, fnOrObj(storeMock)); else Object.assign(storeMock, fnOrObj); };

  const runner = typeof onPlayerActionWithGu === 'function' ? onPlayerActionWithGu : onPlayerAction;
  runner(player, 'betray_ally');

    expect(player.background).toBeTruthy();
    // RULES list has demonic first, so demonic should be applied
    expect(player.background.id).toBe('demon_demonic_cultivator');
    expect(storeMock.story.storyFlags['unlocked_demonic_cultivator']).toBeTruthy();
  });
});
