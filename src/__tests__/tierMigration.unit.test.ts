import { migrateTier, revertTier, LEGACY_TO_NEW_TIER } from '@/migrations/tierMigration';

describe('tierMigration', () => {
  test('maps legacy words to canonical tiers', () => {
    expect(migrateTier('common')).toBe('H');
    expect(migrateTier('Uncommon')).toBe('G');
    expect(migrateTier('RARE')).toBe('F');
    expect(migrateTier('epic')).toBe('E');
    expect(migrateTier('legendary')).toBe('D');
    expect(migrateTier('transcendent')).toBe('B');
  });

  test('preserves tier-like inputs and suffixes', () => {
    expect(migrateTier('H')).toBe('H');
    expect(migrateTier('h+')).toBe('H+');
    expect(migrateTier('f-')).toBe('F-');
  });

  test('revertTier returns legacy words for canonical tiers', () => {
    expect(revertTier('H')).toBe('common');
    expect(revertTier('G')).toBe('uncommon');
    expect(revertTier('B')).toBe('transcendent');
    expect(revertTier('unknown')).toBeUndefined();
  });

  test('numeric and unknown inputs default to F', () => {
    expect(migrateTier('1')).toBe('F');
    expect(migrateTier('')).toBe('F');
    expect(migrateTier(null)).toBe('F');
    expect(migrateTier('some-odd-string')).toBe('F');
  });
});
