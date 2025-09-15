import { MAJOR_SECTS } from '../src/systems/SectSystem';
import SECT_TECHNIQUE_MAP, { getTechniquesForSect } from '../src/systems/sectTechniques';

describe('Sect techniques mapping and attachments', () => {
  test('each major sect has generated manuals and their ids are attached to sect.benefits.techniques', () => {
    for (const sect of MAJOR_SECTS) {
      const mapList = SECT_TECHNIQUE_MAP[sect.id];
      expect(mapList).toBeDefined();
      expect(Array.isArray(mapList)).toBe(true);
      // each generated manual id should be present in sect.benefits.techniques
      const attached = Array.isArray(sect.benefits?.techniques) ? sect.benefits.techniques : [];
      for (const m of mapList) {
        expect(attached).toContain(m.id);
      }
      // getTechniquesForSect should return the same list
      const getter = getTechniquesForSect(sect.id);
      expect(getter.map(s => s.id).sort()).toEqual(mapList.map(s => s.id).sort());
    }
  });
});
