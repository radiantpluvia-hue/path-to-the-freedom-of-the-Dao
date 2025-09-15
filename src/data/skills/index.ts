import IMMORTAL_WORLD_SKILLS from './immortal_world_skills';
import MORTAL_WORLD_SKILLS from './mortal_world_skills';
import SECT_SKILLS from './sect_skills';
import FACTION_SKILLS from './faction_skills';
import SCHOOL_SKILLS from './school_skills';
import CURATED_SUTRAS from './curated_sutras';
// Legacy/placeholders: some mentor unlocks reference a small JSON file
// containing placeholder skill/weapon ids. Include it so tests that
// validate mentor unlock ids see these canonical placeholders.
import ALL_PLACEHOLDERS from './all_skills.json';

export {
  IMMORTAL_WORLD_SKILLS,
  MORTAL_WORLD_SKILLS,
  SECT_SKILLS,
  FACTION_SKILLS,
  SCHOOL_SKILLS
};

export const ALL_SKILLS = [
  ...CURATED_SUTRAS,
  // include any placeholder/all_skills.json entries first so they are
  // discoverable by tests that validate mentor unlock ids
  ...ALL_PLACEHOLDERS,
  ...IMMORTAL_WORLD_SKILLS,
  ...MORTAL_WORLD_SKILLS,
  ...SECT_SKILLS,
  ...FACTION_SKILLS,
  ...SCHOOL_SKILLS
];

export default ALL_SKILLS;
