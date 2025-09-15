import mentors from '../src/data/mentors_enhanced.json';
import * as mentorExecutors from '../utils/mentorExecutors';

describe('Mentor data validation', () => {
  test('every mentor has a non-empty teachingProgression (supports legacy array or modern object)', () => {
    Object.values(mentors).forEach((m: any) => {
      // teachingProgression may be the legacy array-of-stages format or the newer object with a `tiers` array
      const hasArrayFormat = Array.isArray(m.teachingProgression);
      const hasObjectFormat = m.teachingProgression && Array.isArray(m.teachingProgression.tiers);
      expect(hasArrayFormat || hasObjectFormat).toBe(true);

      // extract a normalized stages array for further checks
      const stages = hasArrayFormat ? m.teachingProgression : (m.teachingProgression?.tiers || []);
      expect(Array.isArray(stages)).toBe(true);
      expect(stages.length).toBeGreaterThan(0);
    });
  });

  test('executor IDs referenced by mentors exist in mentorExecutors', () => {
    const executorIds = new Set(Object.keys(mentorExecutors));
    Object.values(mentors).forEach((m: any) => {
      const stages = Array.isArray(m.teachingProgression) ? m.teachingProgression : (m.teachingProgression?.tiers || []);
      stages.forEach((stage: any) => {
        // legacy stage.steps or newer stage.steps both supported
        (stage.steps || []).forEach((step: any) => {
          if (step && step.executorId) {
            expect(executorIds.has(step.executorId)).toBe(true);
          }
        });
      });
    });
  });
});
