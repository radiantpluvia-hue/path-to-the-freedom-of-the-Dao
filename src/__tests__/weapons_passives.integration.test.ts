import { useGameStore } from '@/store/useGameStore';
import { registerPassive, unregisterPassive, applyPassiveToPlayer } from '@/systems/passiveRegistry';

describe('weapons + passives integration', () => {
  beforeEach(() => {
    // reset store to initial state if available
    if ((useGameStore as any).getInitialState) useGameStore.setState(useGameStore.getInitialState());
  });

  test('equipping a weapon with a passive applies equipment stats and passive effects', () => {
    // register a passive that grants +7 atk and attaches an onHit hook
    registerPassive({
      id: 'test_weapon_passive_plus7',
      name: 'Weapon Might +7',
      apply: (p: any) => {
        const np = { ...p };
        np.stats = { ...(np.stats || {}) };
        np.stats.atk = (np.stats.atk || 0) + 7;
        // attach a dummy onHit hook for verification
        np._passiveHooks = { ...(np._passiveHooks || {}), onHit: [ ...(np._passiveHooks?.onHit || []), { id: 'test_weapon_passive_plus7', fn: () => {} } ] };
        return np;
      },
      remove: (p: any) => {
        const np = { ...p };
        np.stats = { ...(np.stats || {}) };
        np.stats.atk = (np.stats.atk || 0) - 7;
        if (np._passiveHooks && Array.isArray(np._passiveHooks.onHit)) np._passiveHooks.onHit = np._passiveHooks.onHit.filter((h: any) => h.id !== 'test_weapon_passive_plus7');
        return np;
      }
    });

    // prepare base stats and ensure equipment container
    useGameStore.setState((s: any) => ({ player: { ...s.player, stats: { ...(s.player.stats || {}), atk: 10 }, equipment: { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null, mount: null, companion: null, innerCore: null } } }));

    const weapon = { id: 'wpn_test_1', name: 'Test Blade', slot: 'mainHand', stats: { atk: 5 }, passives: ['test_weapon_passive_plus7'], type: 'weapon' } as any;

    // equip the weapon using the store helper (which should apply equipment stats and invoke passives)
    (useGameStore as any).equipItem('mainHand', weapon);

    const after = useGameStore.getState().player;
    // numeric check: base 10 + weapon 5 + passive 7
    expect(after.stats.atk).toBe(10 + 5 + 7);

    // passive registry should have added onHit hook to player _passiveHooks
    expect(after._passiveHooks && Array.isArray(after._passiveHooks.onHit)).toBeTruthy();
    const hasHook = after._passiveHooks.onHit.some((h: any) => h.id === 'test_weapon_passive_plus7');
    expect(hasHook).toBe(true);

    // unequip and ensure effects removed
    (useGameStore as any).unequipItem('mainHand');
    const post = useGameStore.getState().player;
    expect(post.stats.atk).toBe(10);

    unregisterPassive('test_weapon_passive_plus7');
  });
});
