import { checkAndApplyAlignmentUnlocks } from '@/systems/alignmentUnlocks';
import { global_alignment_unlocks_combined } from '@/events/executors/eventExecutors_global';

describe('alignmentUnlocks helper and combined executor', () => {
  test('helper unlocks correct path based on axes', () => {
    const player: any = { alignment: { id: 'neutral', axes: { virtue: 0, order: 0, independence: 0, ruthlessness: 70 } } };
    const flags: any = {};
    const unlocked = checkAndApplyAlignmentUnlocks(player, flags);
    expect(unlocked).toContain('demon_demonic_cultivator');
    expect(flags['unlocked_demonic_cultivator']).toBeTruthy();
    expect(player.background.id).toBe('demon_demonic_cultivator');
  });

  test('combined executor integrates and sets world flag', () => {
    const state: any = { player: { alignment: { id: 'neutral', axes: { virtue: 0, order: 0, independence: 45, ruthlessness: 0 } } }, story: { storyFlags: {} }, world: { flags: {} } };
    const out = (global_alignment_unlocks_combined as any)(state);
    // independence 45 shouldn't unlock antihero (needs 40 virtue<=-10) so no unlock
    expect(out.world.flags['alignmentUnlocks.last']).toBeUndefined();

    // now set axes to meet antihero
    out.player.alignment.axes.virtue = -20;
    out.player.alignment.axes.independence = 50;
    const out2 = (global_alignment_unlocks_combined as any)(out);
    // Antihero is now an alignment milestone only; it should not be forced onto player.background
    expect(out2.player.background).toBeUndefined();
    expect(out2.world.flags['alignmentUnlocks.last']).toBeDefined();
    expect((out2.world.flags['alignmentUnlocks.last'] as string[])).toContain('human_antihero');
  });
});
