import { useGameStore } from '@/store/useGameStore';
import { registerPassive, unregisterPassive, applyPassiveToPlayer } from '@/systems/passiveRegistry';
import { CombatSystem } from '@/systems/CombatSystem';
import { setRuntimeRng, clearRuntimeRng } from '@/utils/seededRng';

describe('Weapons & Passives - stacking and proc integration', () => {
  beforeEach(() => {
    // reset store to initial state if available
    if ((useGameStore as any).getInitialState) useGameStore.setState(useGameStore.getInitialState());
  });

  test('multiple equipped items with passives stack their stat bonuses', () => {
    const store = useGameStore as any;
    // set base player attack and clear equipment
    useGameStore.setState((s: any) => ({ player: { ...s.player, stats: { ...(s.player.stats || {}), attack: 10 }, equipment: { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null, mount: null, companion: null, innerCore: null } } }));

    // register two stacking passives
    registerPassive({
      id: 'stack_passive_plus2',
      name: 'Stack +2',
      apply: (p: any) => { const pp = { ...p }; pp.stats = { ...(pp.stats || {}) }; pp.stats.attack = (pp.stats.attack || 0) + 2; return pp; },
      remove: (p: any) => { const pp = { ...p }; pp.stats = { ...(pp.stats || {}) }; pp.stats.attack = (pp.stats.attack || 0) - 2; return pp; }
    });

    registerPassive({
      id: 'stack_passive_plus3',
      name: 'Stack +3',
      apply: (p: any) => { const pp = { ...p }; pp.stats = { ...(pp.stats || {}) }; pp.stats.attack = (pp.stats.attack || 0) + 3; return pp; },
      remove: (p: any) => { const pp = { ...p }; pp.stats = { ...(pp.stats || {}) }; pp.stats.attack = (pp.stats.attack || 0) - 3; return pp; }
    });

    const item1 = { id: 'itm_stack_1', name: 'Stack Sword', slot: 'mainHand', stats: { attack: 1 }, passives: ['stack_passive_plus2'] };
    const item2 = { id: 'itm_stack_2', name: 'Stack Ring', slot: 'accessory1', stats: { attack: 2 }, passives: ['stack_passive_plus3'] };

    // equip both
    (useGameStore as any).equipItem('mainHand', item1);
    (useGameStore as any).equipItem('accessory1', item2);

    const after = useGameStore.getState().player;
    // base 10 + item stats (1+2) + passive bonuses (2+3) = 18
    expect(after.stats.attack).toBe(18);

    // unequip accessory and verify reduction
    (useGameStore as any).unequipItem('accessory1');
    const post = useGameStore.getState().player;
    // now base 10 + mainHand item (1) + mainHand passive (2) = 13
    expect(post.stats.attack).toBe(13);

    // cleanup
    unregisterPassive('stack_passive_plus2');
    unregisterPassive('stack_passive_plus3');
  });

  test('proc hooks attached via passives get invoked during damage application', () => {
    // register a passive whose proc marks the target when invoked
    registerPassive({
      id: 'test_proc_marker',
      name: 'Proc Marker',
      apply: (p: any) => p,
      remove: (p: any) => p,
      proc: (ctx: any) => {
        // deterministic check using provided rng
        const rng = ctx.rng || (() => 0);
        if (rng() < 1.0) {
          ctx.target._procMarker = (ctx.target._procMarker || 0) + 1;
        }
      }
    });

    try {
      // create simple attacker/target
  let attacker: any = { id: 'att', name: 'Attacker', hp: 50, maxHp: 50, stats: { atk: 10, def: 0 }, techniques: [], buffs: [], debuffs: [] };
  const target: any = { id: 'tgt', name: 'Target', hp: 50, maxHp: 50, stats: { atk: 5, def: 0 }, techniques: [], buffs: [], debuffs: [] };

      // apply passive to attacker so _passiveHooks.proc is attached
      attacker = applyPassiveToPlayer(attacker, 'test_proc_marker');

      // deterministically force rng
      setRuntimeRng(() => 0.0);

      const cs = new CombatSystem(attacker, [target], null, null, { type: 'normal' });
      // apply a small damage which will run proc hooks after
      cs.__test_applyDamage(attacker, target, 5);

      // proc should have run and marked the target
      expect(target._procMarker).toBeGreaterThanOrEqual(1);
    } finally {
      clearRuntimeRng();
      unregisterPassive('test_proc_marker');
    }
  });
});
