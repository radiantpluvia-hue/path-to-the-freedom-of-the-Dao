import { getDisplayRarity } from './rarityDisplay';

// Keep the older human-readable map for longer-form labels (manuals, item full names)
export const RARITY_DISPLAY_LONG: Record<string, string> = {
  common: 'Mortal',
  uncommon: 'Refined Mortal',
  rare: 'Heaven-Touched',
  epic: 'Adept',
  legendary: 'Celestial',
  mythical: 'Primordial',
  transcendent: 'Transcendent',
  // weapons.ts uses TitleCase rarities; keep mappings for those as well
  Common: 'Mortal',
  Uncommon: 'Refined Mortal',
  Rare: 'Heaven-Touched',
  Legendary: 'Celestial',
  Unique: 'True Artifact'
};

// New display function: prefer the compact label mapping (user-provided sequence),
// but fall back to the long human-readable names when appropriate.
export function displayRarity(key?: string) {
  if (!key) return 'Unknown';
  // If the compact mapping can create a label, use it
  const compact = getDisplayRarity(key);
  if (compact && compact !== String(key).trim()) return compact;
  // otherwise return the longer, human-friendly name if available
  return RARITY_DISPLAY_LONG[key] || String(key);
}

export default { RARITY_DISPLAY_LONG, displayRarity };
