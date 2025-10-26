export const INTERNAL_TO_DISPLAY: Record<string, string> = {
  // internal letter codes -> user-provided display sequence
  H: 'F',
  G: 'E',
  F: 'D',
  E: 'C',
  D: 'B',
  B: 'A',
  // map the legacy words to nearby labels as a sensible default
  common: 'F',
  uncommon: 'E',
  rare: 'D',
  epic: 'C',
  legendary: 'B',
  mythical: 'S',
  transcendent: 'SSS',
  // weapons/items may use TitleCase keys
  Common: 'F',
  Uncommon: 'E',
  Rare: 'D',
  Epic: 'C',
  Legendary: 'B',
  Mythical: 'S',
  Transcendent: 'SSS',
};

// Secondary mapping for higher-granularity special tiers if needed
export const EXTRA_LABELS: string[] = ['F','E','D','C','B','A','S','SS','SSS','X','Z'];

export function getDisplayRarity(key?: string | null): string {
  if (!key) return 'Unknown';
  const k = String(key).trim();
  // direct mapping
  if (INTERNAL_TO_DISPLAY[k]) return INTERNAL_TO_DISPLAY[k];
  // try uppercase letter
  const up = k.toUpperCase();
  if (INTERNAL_TO_DISPLAY[up]) return INTERNAL_TO_DISPLAY[up];
  // try lowercase word
  const lw = k.toLowerCase();
  if (INTERNAL_TO_DISPLAY[lw]) return INTERNAL_TO_DISPLAY[lw];
  // if key already looks like one of the display labels, return as-is
  if (EXTRA_LABELS.includes(k)) return k;
  if (EXTRA_LABELS.includes(up)) return up;
  // fallback: return original string
  return k;
}

export default { INTERNAL_TO_DISPLAY, getDisplayRarity };
