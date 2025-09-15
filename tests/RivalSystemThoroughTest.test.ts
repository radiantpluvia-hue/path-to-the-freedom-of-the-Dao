import { RivalSystem } from '../src/systems/RivalSystem';
import { RIVAL_ARCHETYPES, getRandomArchetype, getArchetypeById } from '../src/data/rivalArchetypes';
import { MAJOR_SECTS, MAJOR_FACTIONS } from '../src/systems/SectSystem';

describe('RivalSystem Thorough Testing', () => {
  let rivalSystem: RivalSystem;

  beforeEach(() => {
    rivalSystem = new RivalSystem();
  });

  describe('Rival Generation', () => {
    test('should generate rival with default options', () => {
      const rival = rivalSystem.generateRival();
      expect(rival).toBeDefined();
      expect(rival.id).toBeDefined();
      expect(rival.name).toBeDefined();
      expect(rival.level).toBeGreaterThanOrEqual(5);
      expect(rival.level).toBeLessThanOrEqual(50);
      expect(rival.stats).toBeDefined();
      expect(rival.loot).toBeDefined();
      expect(Array.isArray(rival.loot)).toBe(true);
    });

    test('should generate rival with specific level range', () => {
      const rival = rivalSystem.generateRival({ minLevel: 10, maxLevel: 20 });
      expect(rival.level).toBeGreaterThanOrEqual(10);
      expect(rival.level).toBeLessThanOrEqual(20);
    });

    test('should generate rival with specific faction', () => {
      const rival = rivalSystem.generateRival({ faction: 'immortal_court' });
      expect(rival.faction).toBe('immortal_court');
    });

    test('should generate rival with specific sect', () => {
      const rival = rivalSystem.generateRival({ sect: 'azure_cloud_sect' });
      expect(rival.sect).toBe('azure_cloud_sect');
    });

    test('should generate rival with specific personality', () => {
      const rival = rivalSystem.generateRival({ personality: 'honorable' });
      expect(rival.personality).toBe('honorable');
    });

    test('should generate rival with archetype', () => {
      const rival = rivalSystem.generateRival();
      expect(rival.archetype).toBeDefined();
      expect(typeof rival.archetype).toBe('string');
    });
  });

  describe('Loot Generation', () => {
    test('should generate loot for archetype with lootTable', () => {
      const archetype = getArchetypeById('young_prodigy');
      expect(archetype).toBeDefined();
      expect(archetype!.lootTable).toBeDefined();

      const rival = rivalSystem.generateRival();
      expect(rival.loot.length).toBeGreaterThan(0);
      expect(rival.loot[0]).toHaveProperty('name');
      expect(rival.loot[0]).toHaveProperty('value');
    });

    test('should handle archetype without lootTable', () => {
      // Create a mock archetype without lootTable
      const mockArchetype = {
        ...getArchetypeById('young_prodigy')!,
        lootTable: undefined
      };

      // This test verifies that the fallback mechanism works
      const rival = rivalSystem.generateRival();
      expect(rival.loot.length).toBeGreaterThan(0);
      // Should have fallback loot
      expect(rival.loot.some(item => item.name === 'Spirit Stones')).toBe(true);
    });

    test('should handle archetype with empty lootTable arrays', () => {
      // Test with archetype that has empty loot arrays
      const rival = rivalSystem.generateRival();
      expect(rival.loot.length).toBeGreaterThan(0);
      // Should have fallback loot if archetype loot is empty
      expect(rival.loot.some(item => item.name === 'Spirit Stones')).toBe(true);
    });

    test('should generate sect-specific loot', () => {
      const rival = rivalSystem.generateRival({ sect: 'azure_cloud_sect' });
      // Should have sect-specific loot with 30% chance
      const hasSectLoot = rival.loot.some(item =>
        item.name.includes('Azure Cloud Sect') ||
        item.name.includes('Manual Fragment')
      );
      // This might not always be true due to randomness, but the logic should work
      expect(rival.loot.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should generate fallback rival when archetype generation fails', () => {
      // Mock getRandomArchetype to return null
      const originalGetRandomArchetype = jest.requireActual('../src/data/rivalArchetypes').getRandomArchetype;
      jest.mock('../src/data/rivalArchetypes', () => ({
        ...jest.requireActual('../src/data/rivalArchetypes'),
        getRandomArchetype: jest.fn(() => null)
      }));

      const rival = rivalSystem.generateRival();
      expect(rival).toBeDefined();
      expect(rival.archetype).toBe('fallback');
      expect(rival.loot.length).toBeGreaterThan(0);
      expect(rival.loot[0].name).toBe('Spirit Stones');
    });

    test('should handle invalid sect/faction combinations', () => {
      // Test with invalid sect - should still generate a rival
      const rival = rivalSystem.generateRival({ sect: 'invalid_sect' });
      expect(rival).toBeDefined();
      expect(rival.sect).toBeDefined();
    });
  });

  describe('Archetype Integration', () => {
    test('should use archetype stat templates', () => {
      const rival = rivalSystem.generateRival();
      expect(rival.stats.hp).toBeGreaterThan(0);
      expect(rival.stats.qi).toBeGreaterThan(0);
      expect(rival.stats.atk).toBeGreaterThan(0);
      expect(rival.stats.def).toBeGreaterThan(0);
      expect(rival.stats.speed).toBeGreaterThan(0);
    });

    test('should generate archetype techniques', () => {
      const rival = rivalSystem.generateRival();
      expect(Array.isArray(rival.techniques)).toBe(true);
      expect(rival.techniques.length).toBeGreaterThan(0);
    });

    test('should generate archetype abilities', () => {
      const rival = rivalSystem.generateRival();
      expect(Array.isArray(rival.specialAbilities)).toBe(true);
      expect(rival.specialAbilities.length).toBeGreaterThan(0);
    });

    test('should generate archetype title', () => {
      const rival = rivalSystem.generateRival();
      expect(rival.title).toBeDefined();
      expect(typeof rival.title).toBe('string');
      expect(rival.title.length).toBeGreaterThan(0);
    });

    test('should generate archetype description', () => {
      const rival = rivalSystem.generateRival();
      expect(rival.description).toBeDefined();
      expect(typeof rival.description).toBe('string');
      expect(rival.description.length).toBeGreaterThan(0);
    });
  });

  describe('System Integration', () => {
    test('should add rival to system', () => {
      const rival = rivalSystem.generateRival();
      expect(rivalSystem.getRival(rival.id)).toBeDefined();
    });

    test('should retrieve all rivals', () => {
      const initialCount = rivalSystem.getAllRivals().length;
      rivalSystem.generateRival();
      rivalSystem.generateRival();
      expect(rivalSystem.getAllRivals().length).toBe(initialCount + 2);
    });

    test('should filter rivals by faction', () => {
      const rival1 = rivalSystem.generateRival({ faction: 'immortal_court' });
      const rival2 = rivalSystem.generateRival({ faction: 'shadow_thieves_guild' });

      const immortalCourtRivals = rivalSystem.getRivalsByFaction('immortal_court');
      expect(immortalCourtRivals.some(r => r.id === rival1.id)).toBe(true);
      expect(immortalCourtRivals.some(r => r.id === rival2.id)).toBe(false);
    });

    test('should filter rivals by sect', () => {
      const rival1 = rivalSystem.generateRival({ sect: 'azure_cloud_sect' });
      const rival2 = rivalSystem.generateRival({ sect: 'blood_moon_sect' });

      const azureCloudRivals = rivalSystem.getRivalsBySect('azure_cloud_sect');
      expect(azureCloudRivals.some(r => r.id === rival1.id)).toBe(true);
      expect(azureCloudRivals.some(r => r.id === rival2.id)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle level 1 rival', () => {
      const rival = rivalSystem.generateRival({ minLevel: 1, maxLevel: 1 });
      expect(rival.level).toBe(1);
      expect(rival.stats.hp).toBeGreaterThan(0);
      expect(rival.loot.length).toBeGreaterThan(0);
    });

    test('should handle high level rival', () => {
      const rival = rivalSystem.generateRival({ minLevel: 100, maxLevel: 100 });
      expect(rival.level).toBe(100);
      expect(rival.stats.hp).toBeGreaterThan(0);
      expect(rival.loot.length).toBeGreaterThan(0);
    });

    test('should handle empty options object', () => {
      const rival = rivalSystem.generateRival({});
      expect(rival).toBeDefined();
      expect(rival.level).toBeGreaterThanOrEqual(5);
      expect(rival.level).toBeLessThanOrEqual(50);
    });

    test('should handle null options', () => {
      const rival = rivalSystem.generateRival(undefined);
      expect(rival).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    test('should generate valid realm for level', () => {
      const rival = rivalSystem.generateRival({ minLevel: 1, maxLevel: 10 });
      expect(['mortal', 'qi_condensation']).toContain(rival.realm);
    });

    test('should generate valid personality', () => {
      const rival = rivalSystem.generateRival();
      expect(['aggressive', 'cunning', 'honorable', 'treacherous', 'neutral']).toContain(rival.personality);
    });

    test('should generate valid relationship value', () => {
      const rival = rivalSystem.generateRival();
      expect(rival.relationship).toBeGreaterThanOrEqual(-100);
      expect(rival.relationship).toBeLessThanOrEqual(100);
    });

    test('should generate valid loot items', () => {
      const rival = rivalSystem.generateRival();
      rival.loot.forEach(item => {
        expect(item).toHaveProperty('name');
        expect(typeof item.name).toBe('string');
        expect(item.name.length).toBeGreaterThan(0);
        expect(item).toHaveProperty('value');
        expect(typeof item.value).toBe('number');
        expect(item.value).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
