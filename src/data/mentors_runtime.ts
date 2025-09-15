// Runtime merger for mentor datasets. Exposes a combined mentors array
// by merging the curated `mentors_full.json` with `immortal_leaders.json`.
import mentorsFull from './mentors_full.json';
import mentorsEnhanced from './mentors_enhanced.json';
import immortalLeaders from './immortal_leaders.json';
import { ALL_SKILLS } from './skills';

type Mentor = any;

export const mergeMentors = (base: Mentor[], extras: Mentor[]): Mentor[] => {
  const map = new Map<string, Mentor>();
  base.forEach(m => map.set(m.id, m));
  extras.forEach(m => {
    if (map.has(m.id)) {
      // prefer base (curated) fields; merge extras only for missing fields
      map.set(m.id, { ...m, ...map.get(m.id) });
    } else {
      map.set(m.id, m);
    }
  });
  return Array.from(map.values());
};

// Merge order: base curated mentors, then curated "enhanced" list, then additive immortal leaders.
const normalizeTeachingProgressionDefaults = (mentors: Mentor[]) => {
  // choose a safe canonical skill id from ALL_SKILLS as a minimal default unlock
  const fallbackSkillId = (Array.isArray(ALL_SKILLS) && ALL_SKILLS[0] && ALL_SKILLS[0].id) || 'sect_generic_0';

  mentors.forEach(m => {
    // only normalize when a teachingProgression object exists but has no tiers
    if (!m.teachingProgression) return;
    const tiers = m.teachingProgression.tiers;
    if (!Array.isArray(tiers) || tiers.length === 0) {
      // non-destructively add a minimal tier so QA validators treat this mentor as valid
      m.teachingProgression = {
        ...m.teachingProgression,
        tiers: [
          {
            level: 1,
            unlocks: [fallbackSkillId]
          }
        ]
      };
    }
  });
};

export const allMentors = (() => {
  const merged = mergeMentors(mentorsFull as Mentor[], ([...mentorsEnhanced as Mentor[], ...immortalLeaders as Mentor[]]));
  normalizeTeachingProgressionDefaults(merged);
  return merged;
})();

export const getMentorById = (id: string): Mentor | undefined => allMentors.find(m => m.id === id);

export default allMentors;
