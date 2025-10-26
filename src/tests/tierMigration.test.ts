import { migrateTier } from '@/migrations/tierMigration';

describe('migrateTier', () => {
  test('maps legacy names to new codes', () => {
    expect(migrateTier("H")).toBe('H');
    expect(migrateTier("G")).toBe('G');
    expect(migrateTier("F")).toBe('F');
    expect(migrateTier("E")).toBe('E');
    expect(migrateTier("D")).toBe('D');
    expect(migrateTier("C")).toBe('C');
    expect(migrateTier("B")).toBe('B');
  });

  test('preserves canonical codes', () => {
    expect(migrateTier('A+')).toBe('A+');
    expect(migrateTier('SSS')).toBe('SSS');
  });
});
