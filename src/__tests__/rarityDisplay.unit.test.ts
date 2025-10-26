import { getDisplayRarity } from '@/utils/rarityDisplay';

describe('getDisplayRarity', () => {
  test('maps letter codes to compact labels', () => {
    expect(getDisplayRarity('H')).toBe('F');
    expect(getDisplayRarity('G')).toBe('E');
    expect(getDisplayRarity('B')).toBe('A');
  });

  test('maps legacy words and TitleCase correctly', () => {
    expect(getDisplayRarity('common')).toBe('F');
    expect(getDisplayRarity('Rare')).toBe('D');
    expect(getDisplayRarity('Mythical')).toBe('S');
  });

  test('returns display labels unchanged', () => {
    expect(getDisplayRarity('S')).toBe('S');
    expect(getDisplayRarity('SSS')).toBe('SSS');
  });

  test('handles unknowns gracefully', () => {
    expect(getDisplayRarity('')).toBe('Unknown');
    expect(getDisplayRarity(null as any)).toBe('Unknown');
    expect(getDisplayRarity('obscure-tier')).toBe('obscure-tier');
  });
});
