import { tierFriendlyName, tierFullLabel } from '@/game/tierHelpers';

describe('tier helpers', () => {
  test('friendly names for base and +/-', () => {
    expect(tierFriendlyName('A')).toBe('Immortal Grade');
    expect(tierFriendlyName('A+')).toBe('High Immortal Grade');
    expect(tierFriendlyName('A-')).toBe('Low Immortal Grade');
  });

  test('full label contains code and friendly', () => {
    expect(tierFullLabel('B')).toContain('B — Emperor Grade');
    expect(tierFullLabel('C+')).toContain('C+ — High Black Grade');
  });
});
