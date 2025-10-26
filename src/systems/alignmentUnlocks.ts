// Helper to check alignment axes/ids and unlock hidden backgrounds
export interface UnlockRule {
  id: string; // background id to unlock
  name?: string;
  // If true, this rule represents an alignment-derived milestone and should not
  // force-assign a background object on the player. Instead it will set story
  // flags and emit UI feedback. Default: false (assign background as before).
  treatAsAlignment?: boolean;
  // predicate receives player object and returns true if unlock should happen
  predicate: (player: any) => boolean;
  flag?: string; // story flag to set when unlocked
}

// Ordered rules: earlier rules have precedence when multiple match
const RULES: UnlockRule[] = [
  {
    id: 'demon_demonic_cultivator',
    name: 'Demonic Cultivator',
    predicate: (p: any) => {
      const align = p.alignment?.id;
      if (align === 'demonic') return true;
      const r = p.alignment?.axes?.ruthlessness ?? 0;
      return r >= 60;
    },
    flag: 'unlocked_demonic_cultivator'
  },
  {
    id: 'human_antihero',
    name: 'Antihero',
    // Treat antihero as an alignment milestone only; do not set player.background.
    treatAsAlignment: true,
    predicate: (p: any) => {
      const axes = p.alignment?.axes;
      if (!axes) return false;
      return (axes.independence || 0) >= 40 && (axes.virtue || 0) <= -10;
    },
    flag: 'unlocked_antihero'
  },
  {
    id: 'human_rogue_roaming',
    name: 'Rogue Cultivator',
    treatAsAlignment: true,
    predicate: (p: any) => {
      const axes = p.alignment?.axes;
      if (!axes) return false;
      return (axes.independence || 0) >= 60 && (axes.order || 0) <= -20;
    },
    flag: 'unlocked_rogue_roaming'
  }
];

// Apply rules to a player and optional storyFlags object. Returns list of unlocked ids.
export function checkAndApplyAlignmentUnlocks(player: any, storyFlags?: Record<string, any>): string[] {
  const unlocked: string[] = [];
  try {
    if (!player) return unlocked;

    for (const rule of RULES) {
      try {
        if (rule.predicate(player)) {
          // If this rule is an alignment milestone only, do not set a background.
          if (rule.treatAsAlignment) {
            if (storyFlags && rule.flag) storyFlags[rule.flag] = true;
            // Also emit unlocked id for UI/display logic but avoid mutating player.background
            unlocked.push(rule.id);
            // stop after first match to enforce precedence
            break;
          }

          // Otherwise, behave as legacy: set background if it's different
          if (!player.background || player.background.id !== rule.id) {
            player.background = { id: rule.id, name: rule.name || rule.id } as any;
            if (storyFlags && rule.flag) storyFlags[rule.flag] = true;
            unlocked.push(rule.id);
            // stop after first match to enforce precedence
            break;
          }
        }
      } catch (e) {
        // ignore predicate errors for robustness
      }
    }
  } catch (e) {
    // noop
  }
  return unlocked;
}

export default { RULES, checkAndApplyAlignmentUnlocks };
