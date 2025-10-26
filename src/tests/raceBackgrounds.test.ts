import { RACE_BACKGROUNDS } from '@/data/raceBackgrounds';

const ALLOWED_RARITIES = ["H", "G", "F", "D"];

describe('RACE_BACKGROUNDS data validation', () => {
  test('every background has required fields and ids are unique', () => {
    const ids = new Set<string>();

    for (const race of Object.keys(RACE_BACKGROUNDS)) {
      const backgrounds = RACE_BACKGROUNDS[race];
      expect(Array.isArray(backgrounds)).toBe(true);

      backgrounds.forEach((bg) => {
        // Basic required fields
        expect(typeof bg.id).toBe('string');
        expect(bg.id.length).toBeGreaterThan(0);

        expect(typeof bg.name).toBe('string');
        expect(bg.name.length).toBeGreaterThan(0);

        // description may be optional in some legacy entries but typically present
        if (bg.description !== undefined) {
          expect(typeof bg.description).toBe('string');
        }

        expect(typeof bg.rarity).toBe('string');
        expect(ALLOWED_RARITIES).toContain(bg.rarity);

        // effects should be an object
        expect(bg.effects).toBeDefined();
        expect(typeof bg.effects).toBe('object');

        // startChance if present should be 0..1
        if (bg.startChance !== undefined) {
          expect(typeof bg.startChance).toBe('number');
          expect(bg.startChance).toBeGreaterThanOrEqual(0);
          expect(bg.startChance).toBeLessThanOrEqual(1);
        }

        // id uniqueness
        if (ids.has(bg.id)) {
          throw new Error(`Duplicate background id found: ${bg.id}`);
        }
        ids.add(bg.id);
      });
    }
  });
});
