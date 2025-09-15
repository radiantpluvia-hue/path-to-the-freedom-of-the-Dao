export type SkillTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SkillCost = {
  ap?: number; // action points
  qi?: number; // special resource
};

export type Skill = {
  id: string;
  name: string;
  tier: SkillTier; // 1 (mortal) .. 8 (dao-shattering)
  power: number; // damage multiplier / flat power
  cooldown: number; // rounds
  cost: SkillCost;
  description?: string;
  // Optional fields for manuals / special techniques
  passives?: string[]; // ids of passive effects granted or associated
  unlock?: {
    sectId?: string; // if present, manual unlocks only for members of this sect
    minRep?: number; // minimum sect reputation required
  };
  trainingCost?: {
    gold?: number;
    xp?: number;
  };
  // Gameplay mechanics metadata for manuals/techniques
  mechanics?: Array<{
    type: 'chain' | 'multiHit' | 'conditional';
    description?: string;
    // optional fields for quick metadata
    chainLength?: number;
    hits?: number;
    condition?: string; // e.g. 'target_below_30_hp', 'after_dash'
  }>;
  // If true, player's intensity slider affects AP/Qi cost for this skill (and effect values)
  scalesWithIntensity?: boolean;
  // Optional runtime fields used by the combat system for active techniques
  apCost?: number;
  qiCost?: number;
  effects?: Array<{
    type: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
    target: 'self' | 'enemy' | 'enemies' | 'all_enemies' | 'all_allies' | 'enemy_team';
    value?: number;
    duration?: number;
    stat?: string;
  }>;
};


// Using user-specified grade-style tier names. The user listed 7 names; to keep 8 tiers we add one logically-placed grade ('Celestial Grade') as a reasonable filler.
import { REALM_ORDER, CULTIVATION_REALMS } from '../../data/cultivationRealms';

// Original compatibility map for other parts of the codebase. We'll still
// export `TIER_NAMES` so existing consumers keep functioning. However, the
// visible UI label should prefer cultivation-realm-derived names which are
// generated below with `getUITierLabel`.
export const TIER_NAMES: Record<SkillTier, string> = {
  1: 'Mortal',
  2: 'Earth Grade',
  3: 'Black Grade',
  4: 'Emperor Grade',
  5: 'Divine Grade',
  6: 'Immortal Grade',
  7: 'Void Grade',
  8: 'Zenith Grade',
  9: 'Celestial Grade',
  10: 'Dao-Shattering Grade',
};

// There are 30 cultivation realms defined in `REALM_ORDER`. Map them evenly
// across the 10 SkillTier values so each visible skill tier represents three
// cultivation realms. Use the most significant realm name in the bucket as
// the visible label (or join a short range if preferred).
const REALMS_PER_TIER = Math.ceil(REALM_ORDER.length / 10);

export function getUITierLabel(tier: SkillTier): string {
  const startIndex = (tier - 1) * REALMS_PER_TIER;
  const slice = REALM_ORDER.slice(startIndex, startIndex + REALMS_PER_TIER);
  if (slice.length === 0) return TIER_NAMES[tier];
  // Use the middle realm in the bucket for a clearer representative label.
  const midIndex = Math.floor((slice.length - 1) / 2);
  const midRealmId = slice[midIndex];
  const midName = CULTIVATION_REALMS[midRealmId]?.name || TIER_NAMES[tier];
  return midName;
}

// Return the array of realm objects represented by a visible skill tier.
export function getUITierRealms(tier: SkillTier) {
  const startIndex = (tier - 1) * REALMS_PER_TIER;
  const slice = REALM_ORDER.slice(startIndex, startIndex + REALMS_PER_TIER);
  return slice.map(id => CULTIVATION_REALMS[id]).filter(Boolean);
}

import CURATED, { FORM_TECHNIQUES } from './sutras';
import SECT_TECHNIQUE_MAP from '../../systems/sectTechniques';

const PREFIXES = [
  'Qi-Core', 'Nascent', 'Tribulation', 'Heaven-sunder', 'Azure', 'Jade', 'Soulforged', 'Ancestral', 'Dragonbone', 'Phoenix-feather', 'Eternal', 'Samsara', 'Pill-refined', 'Void-wrought', 'Starfall', 'Sealing'
];

// Add simple base moves so generated techniques include basic actions as requested
const TECHNIQUES = [
  'Palm', 'Fist', 'Saber', 'Spear', 'Slash', 'Condensation', 'Core Strike', 'Heartseize', 'Tribulation Split', 'Nascent Burst', 'Seal', 'Breath', 'Roar', 'Meridian Pierce', 'Ascension Step', 'Soul Sever', 'Stab', 'Punch', 'Kick'
];

const DESCRIPTIONS_BY_TIER: Record<SkillTier, string> = {
  1: 'Mortal techniques — rudimentary cultivation moves shaped by body tempering and spirit resolve, useful for nascent practitioners.',
  2: 'Earth Grade arts — foundational cultivation methods that harden meridians and guide qi flow for battlefield endurance.',
  3: 'Black Grade methods — secretive or bloodline-touched techniques; volatile but potent when wielded with intent.',
  4: 'Emperor Grade — techniques that embody sovereign mastery over primal qi, refining essence and granting vast battlefield command.',
  5: 'Divine Grade — transcendent methods that verge on divine resonance; they prepare cultivators for true immortal thresholds and tribulation mastery.',
  6: 'Immortal Grade techniques — core-refinement methods that resonate with immortal legacies and sharpen the cultivator\'s path.',
  7: 'Void Grade techniques — manipulate void qi, distort space around the user, and twist fate lightly.',
  8: 'Zenith Grade legacies — pinnacle mortal legacies that bend fortune, sharpen tribulation, and amplify attacks.',
  9: 'Celestial Grade — heavenly doctrines and starborne methods that call down cosmic pressure and ancestor will.',
  10: 'Dao-Shattering Grade — pinnacle, legend-tier methods that echo the Dao; their use shifts battle tides and strains reality.'
};

// Programmatically generate 400 xianxia-inspired skills across 8 tiers. Each skill has deterministic stats and colorful names/descriptions.
export const SKILL_CATALOG: Skill[] = (() => {
  const skills: Skill[] = [];
  // collect all sect-specific manuals from SECT_TECHNIQUE_MAP first so we can account for them in sizing
  const sectSkills: Skill[] = [];
  Object.values(SECT_TECHNIQUE_MAP).forEach(list => list.forEach(s => sectSkills.push(s)));

  // Use imported CURATED, FORM_TECHNIQUES, and sect-specific manuals. Generate only the remainder so final catalog size stays 400
  const reserved = CURATED.length + FORM_TECHNIQUES.length + sectSkills.length;
  const total = Math.max(0, 400 - reserved);
  for (let i = 1; i <= total; i++) {
    // distribute tiers roughly evenly across 10 tiers
    const tier = (Math.floor((i - 1) / (total / 10)) + 1) as SkillTier;
  const prefix = PREFIXES[(i * 7) % PREFIXES.length];
  const tech = TECHNIQUES[(i * 13) % TECHNIQUES.length];
  const name = `${prefix} ${tech} ${i}`;
  // power scales with tier and some variety from index — amplified for cultivation-level potency
  const power = Math.round(20 + tier * 12 + ((i * 7) % 20));
  const cooldown = Math.max(1, 6 - Math.floor(tier / 1.75));
    const ap = Math.max(0, Math.ceil(tier / 2));
    const qi = tier >= 6 ? Math.ceil(tier / 2) : 0;
    const description = `${DESCRIPTIONS_BY_TIER[tier]} Often whispered in sect halls as "${name}", it ${tier >= 7 ? 'is said to awaken ancestral echoes within a cultivator' : 'is practiced widely among juniors for reliable potency' }.`;
    skills.push({
      id: `skill_${i}`,
      name: `${getUITierLabel(tier)} — ${name}`,
      tier,
      power,
      cooldown,
      cost: { ap, qi },
      description,
    });
  }
  // Merge curated sutra/mantra techniques and form-techniques into the top of the catalog so they are discoverable
  // sectSkills already collected above

  // avoid duplicates by ID
  const seen = new Set<string>();
  const merged: Skill[] = [];
  const pushUnique = (arr: Skill[]) => {
    for (const s of arr) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        merged.push(s);
      }
    }
  };

  pushUnique(CURATED);
  pushUnique(FORM_TECHNIQUES);
  pushUnique(sectSkills);
  pushUnique(skills);
  return merged;
})();

export function getSkillById(id: string): Skill | undefined {
  return SKILL_CATALOG.find(s => s.id === id);
}
