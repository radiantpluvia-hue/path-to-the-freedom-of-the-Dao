import { getRelics, getRelicById } from '@/data/registry';
/* eslint @typescript-eslint/no-non-null-assertion: "off" */

describe('Relic catalog', () => {
  test('relics load and can be fetched by id', () => {
    const relics = getRelics();
    expect(relics.length).toBeGreaterThan(5);
    const sample = relics[0];
    const byId = getRelicById(sample.id);
    expect(byId).toBeTruthy();
    expect(byId!.id).toBe(sample.id);
  });

  test('unique style stats and passives present', () => {
    const relics = getRelics();
    const withPassives = relics.filter(r => Array.isArray(r.passives) && r.passives.length > 0);
    expect(withPassives.length).toBeGreaterThan(3);
  });
});
