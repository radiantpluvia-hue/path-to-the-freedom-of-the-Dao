import alignment, { onPlayerAction, setPlayerAlignment, DEFAULT_AXES, axesToAlignment } from '@/systems/alignment';
// when running unit tests that simulate player actions, call the gu-aware wrapper
// if available so the GU system logic executes deterministically in tests.
import { onPlayerActionWithGu } from '@/systems/guBranch';

describe('alignment system basics', () => {
  test('axis shifting and alignment resolution', () => {
    const player: any = { id: 'p1', name: 'P1', reputation: 100 };

    // initial should be neutral
    setPlayerAlignment(player, DEFAULT_AXES);
    expect(player.alignment).toBeDefined();
    expect(player.alignment.id).toBe('neutral');

    // perform evil actions to push to demonic
  const actionRunner = typeof onPlayerActionWithGu === 'function' ? onPlayerActionWithGu : onPlayerAction;
  actionRunner(player, 'use_forbidden_art');
  actionRunner(player, 'kill_unarmed');
    // re-evaluate
    const a = axesToAlignment(player.alignment.axes);
    expect(['demonic', 'antihero', 'unorthodox', 'righteous', 'neutral']).toContain(a);
    // after heavy ruthlessness it should likely not be neutral
    expect(a).not.toBe('neutral');
  });
});
