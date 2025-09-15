const { allMentors } = require('../src/data/mentors_runtime');
const { SKILL_CATALOG, getSkillById } = require('../src/components/minigames/skills');
const { ALL_SKILLS } = require('../src/data/skills');

describe('Mentor QA: teaching progression and unlock mappings', () => {
  test('each mentor has a teachingProgression with ordered tiers and valid unlock ids', () => {
    expect(Array.isArray(allMentors)).toBe(true);
    const skillIds = new Set(SKILL_CATALOG.map((s: any) => s.id));
    // include all canonical skills (mortal/immortal/sect/faction/school) so mentor unlocks can point
    // to data-driven skills outside the minigame catalog
    if (Array.isArray(ALL_SKILLS)) {
      for (const s of ALL_SKILLS) {
        if (s && typeof s.id === 'string') skillIds.add(s.id);
      }
    }

    allMentors.forEach((m: any) => {
      // Only validate mentors that are flagged as immortal leaders or have teachingProgression
      if (!m.teachingProgression) return;

      const tiers = m.teachingProgression.tiers || [];
      expect(Array.isArray(tiers)).toBe(true);
      // tiers should not be empty
      expect(tiers.length).toBeGreaterThan(0);

      // Ensure tiers are strictly ascending by level
      let prev = -Infinity;
      tiers.forEach((t: any) => {
        expect(typeof t.level).toBe('number');
        expect(t.level).toBeGreaterThan(prev);
        prev = t.level;

        // Each tier must have unlocks array if present and each unlock must exist in skill catalog
        if (Array.isArray(t.unlocks)) {
          t.unlocks.forEach((uid: string) => {
            // allow some legacy placeholders but assert they appear in catalog for QA
            expect(typeof uid).toBe('string');
            const exists = !!getSkillById(uid) || skillIds.has(uid);
            if (!exists) {
              // provide a helpful diagnostic message for failures
              throw new Error(`Missing skill id "${uid}" in SKILL_CATALOG for mentor "${m.id || m.name || '<unknown>'}" tier level ${t.level}`);
            }
          });
        }
      });
    });
  });
});
