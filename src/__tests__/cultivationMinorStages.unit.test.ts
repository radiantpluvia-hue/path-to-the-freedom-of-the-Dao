import { getMinorStageCount, CULTIVATION_REALMS } from '../data/cultivationRealms';

describe('Cultivation minor stage counts (authoritative)', () => {
  test('key realms have expected minor stage counts', () => {
    // Per user specification
    const expected: Record<string, number> = {
      qi_refinement: 12,
      foundation_establishment: 12,
      core_formation: 5,
      nascent_soul: 7,
      soul_transformation: 3,
      void_refinement: 12,
      body_integration: 5,
      tribulation_transcendence: 10,
      mahayana: 9,
      earth_loose_immortal: 5,
      loose_immortal: 3,
      heaven_immortal: 9,
      true_heaven_immortal: 8,
      mystic_immortal: 6,
      silver_immortal: 5
    };

    for (const [realm, count] of Object.entries(expected)) {
      // Use both the helper and the raw map entry to ensure consistency
      expect(getMinorStageCount(realm)).toBe(count);
      expect(CULTIVATION_REALMS[realm]).toBeDefined();
      expect(CULTIVATION_REALMS[realm].minorStages).toBe(count);
    }
  });
});
