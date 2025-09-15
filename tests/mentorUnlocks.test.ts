import ALL_SKILLS from '../src/data/skills/index';
import { allMentors } from '../src/data/mentors_runtime';

describe('Mentor unlock IDs', () => {
  const skillIds = new Set(ALL_SKILLS.map((s: any) => s.id));

  test('all mentor teaching progression unlock IDs exist in ALL_SKILLS', () => {
    const missing: string[] = [];
    allMentors.forEach((m: any) => {
      const tiers = m.teachingProgression?.tiers || [];
      tiers.forEach((t: any) => {
        const unlocks = Array.isArray(t.unlocks) ? t.unlocks : (t.unlocks ? [t.unlocks] : []);
        unlocks.forEach((u: string) => {
          if (!skillIds.has(u)) missing.push(`${m.id} -> ${u}`);
        });
      });
    });

    if (missing.length) {
      // Fail the test with precise missing list
      throw new Error('Missing skill unlock IDs referenced by mentors:\n' + missing.join('\n'));
    }
  });
});
