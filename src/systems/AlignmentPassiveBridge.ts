// Bridge that maps alignment passive tags to concrete passive ids registered in PassiveRegistry
// and ensures they are applied/removed on the player when alignment changes.
import * as PassiveRegistry from './passiveRegistry';
import { ALIGNMENTS, type PlayerMinimal } from './alignment';

// Map alignment passive tags to registered passive ids
export const TAG_TO_PASSIVE_ID: Record<string, string> = {
  honor_bound: 'tag_honor_bound',
  sect_favored: 'tag_sect_favored',
  bloodthirsty: 'tag_bloodthirsty',
  forbidden_affinity: 'tag_forbidden_affinity',
  wildcraft: 'tag_wildcraft',
  unpredictable: 'tag_unpredictable',
  lone_wolf: 'tag_lone_wolf',
  pragmatist: 'tag_pragmatist',
};

// Apply alignment-derived passives for the player's current alignment, and remove any
// previously applied alignment passives that no longer match.
export function applyAlignmentPassives(player: PlayerMinimal): PlayerMinimal {
  try {
    const alignmentId = player.alignment?.id ?? 'neutral';
    const tags = ALIGNMENTS[alignmentId]?.passiveTags || [];
    const desiredIds = tags.map((t) => TAG_TO_PASSIVE_ID[t]).filter(Boolean);

    // Track which alignment passives are currently applied
    const applied: string[] = (player as any).alignmentPassiveApplied || [];

    // Remove any no-longer-desired alignment passives
    let p: any = { ...player };
    for (const pid of applied) {
      if (!desiredIds.includes(pid)) {
        p = PassiveRegistry.removePassiveFromPlayer(p, pid);
      }
    }

    // Apply any missing desired passives
    const newApplied: string[] = [];
    for (const pid of desiredIds) {
      // Always reapply to allow scaling bonuses (based on alignment axes) to refresh.
      if (applied.includes(pid)) {
        p = PassiveRegistry.removePassiveFromPlayer(p, pid);
      }
      p = PassiveRegistry.applyPassiveToPlayer(p, pid);
      newApplied.push(pid);
    }

    p.alignmentPassiveApplied = newApplied;
    // Keep original tags array on player for legacy consumers
    if (tags.length) {
      (p as any).passives = Array.isArray((p as any).passives) ? (p as any).passives : [];
      for (const t of tags) if (!(p as any).passives.includes(t)) (p as any).passives.push(t);
    }

    return p;
  } catch (_e) {
    return player as any;
  }
}

export default { applyAlignmentPassives };
