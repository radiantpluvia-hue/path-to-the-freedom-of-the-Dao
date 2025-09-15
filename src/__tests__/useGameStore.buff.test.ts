import { useGameStore } from '@/store/useGameStore';

describe('useGameStore removeBuff', () => {
  beforeEach(() => {
    // Reset store to initial state by creating a fresh instance
    // Note: zustand's create returns a hook; getState exists on the hook function
    const store = useGameStore.getState();
    // Clear activeBuffs
    store.setPlayerProperty('activeBuffs' as any, []);
    // Reset stats
    store.setPlayerProperty('stats' as any, { atk: 10, def: 10, hp: 100, qi: 0, speed: 10 });
  });

  test('removeBuff removes and reverts applied effects', () => {
    const store = useGameStore.getState();
    // create a fake buff and apply via BuffSystem to ensure appliedEffects are set
    const item = { itemId: 'test_consumable', name: 'Test Brew', uniqueProperties: {} };
    const buff = store.buffSystem.createBuff(item, 'test', { stats: { atk: 5 } }, 5);

    // apply buff via buffSystem logic
    let player = { ...store.player } as any;
    player = store.buffSystem.applyBuff(player, buff);

    // commit to store
    store.setPlayerProperty('activeBuffs' as any, player.activeBuffs);
    store.setPlayerProperty('stats' as any, player.stats);

    expect(useGameStore.getState().player.activeBuffs.length).toBe(1);
    expect(useGameStore.getState().player.stats.atk).toBe(15);

    // now call removeBuff
    useGameStore.getState().removeBuff(player.activeBuffs[0].id);

    expect(useGameStore.getState().player.activeBuffs.length).toBe(0);
    expect(useGameStore.getState().player.stats.atk).toBe(10);
  });
});
