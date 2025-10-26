import { global_check_alignment_unlocks } from '@/events/executors/eventExecutors_global';

describe('global_check_alignment_unlocks executor', () => {
  test('sets demonic background when alignment is demonic', () => {
    const state: any = {
      player: { name: 'P', alignment: { id: 'demonic', axes: { virtue: -10, order: -5, independence: 5, ruthlessness: 70 } } },
      story: { storyFlags: {} },
      world: { flags: {} }
    };
    const out = (global_check_alignment_unlocks as any)(state);
    expect(out.player.background).toBeDefined();
    expect(out.player.background.id).toBe('demon_demonic_cultivator');
    expect(out.story.storyFlags['unlocked_demonic_cultivator']).toBeTruthy();
  });

  test('sets demonic background when ruthlessness high', () => {
    const state: any = {
      player: { name: 'P', alignment: { id: 'neutral', axes: { virtue: 0, order: 0, independence: 0, ruthlessness: 65 } } },
      story: { storyFlags: {} },
      world: { flags: {} }
    };
    const out = (global_check_alignment_unlocks as any)(state);
    expect(out.player.background).toBeDefined();
    expect(out.player.background.id).toBe('demon_demonic_cultivator');
  });
});
