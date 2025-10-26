import { displayRarity, RARITY_DISPLAY_LONG } from '@/utils/rarityNames';
import { getDisplayRarity } from '@/utils/rarityDisplay';

describe('displayRarity fallback behavior', () => {
  test('prefers compact mapping over returning same key', () => {
    // INTERNAL_TO_DISPLAY maps 'H' -> 'F' for example
    expect(displayRarity('H')).toBe(getDisplayRarity('H'));
    // If a key already equals a display label, ensure it is returned as-is
    const label = 'S';
    expect(getDisplayRarity(label)).toBe(label);
    expect(displayRarity(label)).toBe(label);
  });

  test('falls back to long human-readable names when compact mapping does not change key', () => {
    // pick a long-name key present in RARITY_DISPLAY_LONG
    const longKey = Object.keys(RARITY_DISPLAY_LONG).find(k => typeof k === 'string' && k.length > 1);
    if (!longKey) throw new Error('No long-key found in RARITY_DISPLAY_LONG');
    // Ensure displayRarity uses the long name when compact mapping returns the same original key
    const compact = getDisplayRarity(longKey);
    if (compact === String(longKey).trim()) {
      expect(displayRarity(longKey)).toBe(RARITY_DISPLAY_LONG[longKey]);
    } else {
      // If compact mapping changes it, ensure displayRarity reflects that mapping
      expect(displayRarity(longKey)).toBe(compact);
    }
  });

  test('handles null/undefined gracefully', () => {
    // displayRarity should return 'Unknown' for falsy inputs
  // allow passing undefined/null in tests by casting to any
  expect((displayRarity as any)(undefined)).toBe('Unknown');
  expect((displayRarity as any)(null)).toBe('Unknown');
  });
});
