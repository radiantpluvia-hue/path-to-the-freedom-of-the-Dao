import { numericToTier, tierToNumeric, tierLabelFor } from '../data/statTiers';
import { useGameStore } from '../store/useGameStore';

describe('statTiers', () => {
  test('numericToTier maps boundaries correctly', () => {
    expect(numericToTier(0).id).toBe('none');
    expect(numericToTier(9).id).toBe('none');
    expect(numericToTier(10).id).toBe('foundation');
    expect(numericToTier(50).id).toBe('qi_condensation');
    expect(numericToTier(200).id).toBe('core_formation');
    expect(numericToTier(800).id).toBe('nascent_soul');
    expect(numericToTier(2500).id).toBe('heavenly_king');
    expect(numericToTier(8000).id).toBe('immortal');
    expect(numericToTier(30000).id).toBe("B");
  });

  test('tierToNumeric returns median-like representative values', () => {
    expect(typeof tierToNumeric('core_formation')).toBe('number');
    expect(tierToNumeric('none')).toBeGreaterThanOrEqual(0);
  });

  test('tierLabelFor returns name', () => {
    expect(typeof tierLabelFor(250)).toBe('string');
  });
});

describe('useGameStore visible stats', () => {
  test('getVisibleStats returns hp numeric and tier labels', () => {
    const store = useGameStore.getState();
    // Set known numeric values
    useGameStore.setState({ player: { ...store.player, hp: 500, maxHp: 1000, stats: { ...store.player.stats, qi: 350, atk: 220, def: 180, speed: 45 } } } as any);
    const visible = useGameStore.getState().getVisibleStats();
    expect(visible.hp).toBe(500);
    expect(typeof visible.qi).toBe('string');
    expect(typeof visible.atk).toBe('string');
    expect(typeof visible.def).toBe('string');
    expect(typeof visible.speed).toBe('string');
  });
});
