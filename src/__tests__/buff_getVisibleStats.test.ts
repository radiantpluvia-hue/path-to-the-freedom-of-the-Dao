import { useGameStore } from '@/store/useGameStore';

describe('buff affects getVisibleStats', () => {
  beforeEach(() => {
    const s = useGameStore.getState();
    s.setPlayerProperty('activeBuffs' as any, []);
    s.setPlayerProperty('stats' as any, { atk: 10, def: 5, hp: 100, qi: 0, speed: 3 });
  });

  test('applying an atk buff updates visible atk value', () => {
    const store = useGameStore.getState();
    const item = { itemId: 'test_potion', name: 'Might Tonic', uniqueProperties: {} };
    const buff = store.buffSystem.createBuff(item, 'might', { stats: { atk: 4 } }, 10);

    // apply buff to a cloned player and then commit the changes to the store
    let player = { ...store.player } as any;
    player = store.buffSystem.applyBuff(player, buff);

    store.setPlayerProperty('activeBuffs' as any, player.activeBuffs);
    store.setPlayerProperty('stats' as any, player.stats);

  // Numeric stats should be updated on the player.stats object
  const numericAtk = useGameStore.getState().player.stats.atk;
  expect(numericAtk).toBeGreaterThanOrEqual(14);

  // getVisibleStats returns tier labels for atk/def/speed
  const visible = useGameStore.getState().getVisibleStats();
  expect(typeof visible.atk).toBe('string');
  });
});
