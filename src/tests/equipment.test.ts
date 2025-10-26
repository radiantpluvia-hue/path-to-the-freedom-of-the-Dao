import { useGameStore } from '@/store/useGameStore';
import { registerPassive, unregisterPassive } from '@/systems/passiveRegistry';

describe('Equipment equip/unequip and passive integration', () => {
  beforeEach(() => {
    // reset store to initial state if available
    if ((useGameStore as any).getInitialState) useGameStore.setState(useGameStore.getInitialState());
  });

  test('equipping item applies stats and passive, unequipping removes both', () => {
    const store = useGameStore as any;
  const base = store.getState().player;
  // ensure base stats
  useGameStore.setState((s: any) => ({ player: { ...s.player, stats: { ...(s.player.stats || {}), attack: 10 }, equipment: { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null, mount: null, companion: null, innerCore: null } } }));

    // register a test passive that adds +5 attack
    registerPassive({
      id: 'test_passive_plus5',
      name: 'Test +5 Attack',
      apply: (p: any) => {
        const pp = { ...p };
        pp.stats = { ...(pp.stats || {}) };
        pp.stats.attack = (pp.stats.attack || 0) + 5;
        return pp;
      },
      remove: (p: any) => {
        const pp = { ...p };
        pp.stats = { ...(pp.stats || {}) };
        pp.stats.attack = (pp.stats.attack || 0) - 5;
        return pp;
      }
    });

    const item = { id: 'itm_sword_1', name: 'Test Sword', slot: 'mainHand', stats: { attack: 3 }, passives: ['test_passive_plus5'] };

    // equip
    (useGameStore as any).equipItem('mainHand', item);
  const after = useGameStore.getState().player;
  expect(after.equipment && after.equipment.mainHand).toEqual(item);
  expect(after.stats.attack).toBe(10 + 3 + 5);

    // unequip
    (useGameStore as any).unequipItem('mainHand');
  const post = useGameStore.getState().player;
  expect(post.equipment && post.equipment.mainHand).toBeNull();
  expect(post.stats.attack).toBe(10);

    unregisterPassive('test_passive_plus5');
  });
});
