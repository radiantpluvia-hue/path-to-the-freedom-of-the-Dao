import dataIndex from '@/data/index';
import { ALL_MANUALS } from '@/data/manuals';
import { _registryContains } from '@/systems/passiveRegistry';

describe('seed schema validation', () => {
  test('items have valid effect shapes', () => {
  const items = ((dataIndex as any).SEED_ITEMS || []);
    items.forEach((it: any) => {
      expect(it).toHaveProperty('id');
      expect(it).toHaveProperty('name');
      // effects should be an array of { type: string, value: number }
      expect(Array.isArray(it.effects)).toBe(true);
      it.effects.forEach((ef: any) => {
        expect(typeof ef.type).toBe('string');
        expect(typeof ef.value === 'number' || typeof ef.value === 'object').toBe(true);
      });
    });
  });

  test('manuals contain required fields and shapes', () => {
  const manuals = ((dataIndex as any).SEED_MANUALS || []);
    manuals.forEach((m: any) => {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('title');
      expect(m).toHaveProperty('effects');
      // effects should be an array of objects with at least 'stat' and 'amount'
      expect(Array.isArray(m.effects)).toBe(true);
      m.effects.forEach((e: any) => {
        expect(typeof e.stat).toBe('string');
        expect(typeof e.amount).toBe('number');
      });
      // ensure the manual id exists in the runtime ALL_MANUALS (merge step)
      const exists = ALL_MANUALS.some((am: any) => am.id === m.id);
      expect(exists).toBe(true);
    });
  });

  test('passives register in passive registry and have basic fields', () => {
  const passives = ((dataIndex as any).SEED_PASSIVES || []);
    passives.forEach((p: any) => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('description');
      // ensure registry contains them
      expect(_registryContains(p.id)).toBe(true);
    });
  });
});
