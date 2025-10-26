import { ALL_MANUALS } from '@/data/manuals';
import { _registryContains } from '@/systems/passiveRegistry';

// Load raw seed JSON files from the repository root `data/` directory
const seedEvents = require('../../data/events/seed_events.json');
const seedItems = require('../../data/items/seed_items.json');
const seedManuals = require('../../data/manuals/seed_manuals.json');
const seedPassives = require('../../data/passives/seed_passives.json');

describe('Seed files basic validation', () => {
  test('events shape and internal references', () => {
    expect(Array.isArray(seedEvents)).toBe(true);
    const ids = seedEvents.map((e: any) => e.id);
    seedEvents.forEach((e: any) => {
      expect(typeof e.id).toBe('string');
      expect(e.title || e.name).toBeTruthy();
      expect(typeof e.description === 'string' || typeof e.description === 'undefined').toBeTruthy();
      expect(Array.isArray(e.choices)).toBe(true);
      e.choices.forEach((c: any) => {
        expect(c.id).toBeTruthy();
        expect(c.text).toBeTruthy();
      });
      if (Array.isArray(e.nextEvents)) {
        e.nextEvents.forEach((ne: any) => expect(ids).toContain(ne));
      }
    });
  });

  test('items shape sanity', () => {
    expect(Array.isArray(seedItems)).toBe(true);
    seedItems.forEach((it: any) => {
      expect(typeof it.id).toBe('string');
      expect(typeof it.name).toBe('string');
      expect(typeof it.type).toBe('string');
      expect(typeof it.rarity).toBe('string');
      // effects may be object/array or empty - ensure the key exists
      expect(it.effects !== undefined).toBe(true);
    });
  });

  test('manual seeds are present in ALL_MANUALS', () => {
    expect(Array.isArray(seedManuals)).toBe(true);
    seedManuals.forEach((m: any) => {
      expect(m.id).toBeTruthy();
      const found = ALL_MANUALS.find(x => x.id === m.id);
      expect(found).toBeDefined();
    });
  });

  test('seed passives are registered in PassiveRegistry', () => {
    expect(Array.isArray(seedPassives)).toBe(true);
    seedPassives.forEach((p: any) => {
      expect(p.id).toBeTruthy();
      expect(_registryContains(p.id)).toBe(true);
    });
  });
});
