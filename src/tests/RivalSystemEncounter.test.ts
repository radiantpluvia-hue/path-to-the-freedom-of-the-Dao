import { RivalSystem } from '../systems/RivalSystem';
import { RivalEncounter } from '../types';

describe('RivalSystem Encounter Functionality', () => {
  let rivalSystem: RivalSystem;

  beforeEach(() => {
    rivalSystem = new RivalSystem();
  });

  describe('addRivalEncounter method', () => {
    it('should add a new encounter with correct properties', () => {
      const encounterData = {
        rivalId: 'test_rival_1',
        type: 'chance' as const,
        location: 'Azure Cloud Sect',
        description: 'A chance encounter during training',
        outcome: 'victory' as const,
        lootGained: [{ name: 'Spirit Stones', description: 'Low grade spirit stones', value: 50 }],
        reputationChange: { 'azure_cloud_sect': 10 },
        year: 2024
      };

      const encounterId = rivalSystem.addRivalEncounter(encounterData);

      // Verify the encounter was added
      const encounters = rivalSystem.getRivalEncounters();
      expect(encounters).toHaveLength(1);

      const addedEncounter = encounters[0];
      expect(addedEncounter.id).toBe(encounterId);
      expect(addedEncounter.rivalId).toBe(encounterData.rivalId);
      expect(addedEncounter.type).toBe(encounterData.type);
      expect(addedEncounter.location).toBe(encounterData.location);
      expect(addedEncounter.description).toBe(encounterData.description);
      expect(addedEncounter.outcome).toBe(encounterData.outcome);
      expect(addedEncounter.lootGained).toEqual(encounterData.lootGained);
      expect(addedEncounter.reputationChange).toEqual(encounterData.reputationChange);
      expect(addedEncounter.year).toBe(encounterData.year);
      expect(addedEncounter.timestamp).toBeDefined();
      expect(typeof addedEncounter.timestamp).toBe('number');
    });

    it('should generate unique IDs for each encounter', () => {
      const encounterData1 = {
        rivalId: 'test_rival_1',
        type: 'provoked' as const,
        location: 'Training Grounds',
        outcome: 'defeat' as const,
        lootGained: [],
        reputationChange: {},
        year: 2024
      };

      const encounterData2 = {
        rivalId: 'test_rival_2',
        type: 'defense' as const,
        location: 'Sect Entrance',
        outcome: 'victory' as const,
        lootGained: [],
        reputationChange: {},
        year: 2024
      };

      const id1 = rivalSystem.addRivalEncounter(encounterData1);
      const id2 = rivalSystem.addRivalEncounter(encounterData2);

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^encounter_\d+_\w+$/);
      expect(id2).toMatch(/^encounter_\d+_\w+$/);
    });

    it('should handle encounters without optional description', () => {
      const encounterData = {
        rivalId: 'test_rival_1',
        type: 'competition' as const,
        location: 'Tournament Arena',
        outcome: 'fled' as const,
        lootGained: [],
        reputationChange: {},
        year: 2024
      };

      const encounterId = rivalSystem.addRivalEncounter(encounterData);
      const encounters = rivalSystem.getRivalEncounters();
      const addedEncounter = encounters[0];

      expect(addedEncounter.description).toBeUndefined();
    });
  });

  describe('getRivalEncounters method', () => {
    beforeEach(() => {
      // Add some test encounters
      rivalSystem.addRivalEncounter({
        rivalId: 'rival_1',
        type: 'chance',
        location: 'Forest',
        outcome: 'victory',
        lootGained: [],
        reputationChange: {},
        year: 2024
      });

      rivalSystem.addRivalEncounter({
        rivalId: 'rival_2',
        type: 'provoked',
        location: 'City',
        outcome: 'defeat',
        lootGained: [],
        reputationChange: {},
        year: 2024
      });

      rivalSystem.addRivalEncounter({
        rivalId: 'rival_1',
        type: 'defense',
        location: 'Sect',
        outcome: 'truce',
        lootGained: [],
        reputationChange: {},
        year: 2024
      });
    });

    it('should return all encounters when no rivalId is specified', () => {
      const encounters = rivalSystem.getRivalEncounters();
      expect(encounters).toHaveLength(3);
    });

    it('should return only encounters for specific rival when rivalId is provided', () => {
      const rival1Encounters = rivalSystem.getRivalEncounters('rival_1');
      expect(rival1Encounters).toHaveLength(2);

      const rival2Encounters = rivalSystem.getRivalEncounters('rival_2');
      expect(rival2Encounters).toHaveLength(1);

      const nonExistentEncounters = rivalSystem.getRivalEncounters('non_existent');
      expect(nonExistentEncounters).toHaveLength(0);
    });

    it('should return encounters in chronological order by timestamp', () => {
      const encounters = rivalSystem.getRivalEncounters();
      for (let i = 1; i < encounters.length; i++) {
        const currentTimestamp = encounters[i].timestamp;
        const previousTimestamp = encounters[i - 1].timestamp;
        if (currentTimestamp !== undefined && previousTimestamp !== undefined) {
          expect(currentTimestamp).toBeGreaterThanOrEqual(previousTimestamp);
        }
      }
    });
  });

  describe('Integration with existing RivalSystem functionality', () => {
    it('should work with default rivals', () => {
      // The RivalSystem constructor initializes default rivals
      const rivals = rivalSystem.getAllRivals();
      expect(rivals.length).toBeGreaterThan(0);

      // Add an encounter for one of the default rivals
      const firstRival = rivals[0];
      const encounterId = rivalSystem.addRivalEncounter({
        rivalId: firstRival.id,
        type: 'chance',
        location: 'Training Grounds',
        outcome: 'victory',
        lootGained: [{ name: 'Spirit Stones', description: 'Cultivation resource', value: 100 }],
        reputationChange: { [firstRival.sect]: 5 },
        year: 2024
      });

      // Verify the encounter was added
      const encounters = rivalSystem.getRivalEncounters(firstRival.id);
      expect(encounters).toHaveLength(1);
      expect(encounters[0].id).toBe(encounterId);
      expect(encounters[0].rivalId).toBe(firstRival.id);
    });

    it('should handle all encounter types correctly', () => {
      const encounterTypes: Array<'chance' | 'provoked' | 'defense' | 'competition'> = [
        'chance', 'provoked', 'defense', 'competition'
      ];

      encounterTypes.forEach(type => {
        const encounterId = rivalSystem.addRivalEncounter({
          rivalId: 'test_rival',
          type,
          location: 'Test Location',
          outcome: 'victory',
          lootGained: [],
          reputationChange: {},
          year: 2024
        });

        const encounters = rivalSystem.getRivalEncounters();
        const encounter = encounters.find(e => e.id === encounterId);
        expect(encounter?.type).toBe(type);
      });
    });

    it('should handle all encounter outcomes correctly', () => {
      const outcomes: Array<'victory' | 'defeat' | 'fled' | 'truce'> = [
        'victory', 'defeat', 'fled', 'truce'
      ];

      outcomes.forEach(outcome => {
        const encounterId = rivalSystem.addRivalEncounter({
          rivalId: 'test_rival',
          type: 'chance',
          location: 'Test Location',
          outcome,
          lootGained: [],
          reputationChange: {},
          year: 2024
        });

        const encounters = rivalSystem.getRivalEncounters();
        const encounter = encounters.find(e => e.id === encounterId);
        expect(encounter?.outcome).toBe(outcome);
      });
    });
  });

  describe('Type safety and interface compliance', () => {
    it('should create encounters that match RivalEncounter interface', () => {
      const encounterData = {
        rivalId: 'test_rival',
        type: 'chance' as const,
        location: 'Test Location',
        description: 'Test encounter',
        outcome: 'victory' as const,
        lootGained: [{ name: 'Test Item', description: 'A test item', value: 10 }],
        reputationChange: { 'test_faction': 5 },
        year: 2024
      };

      const encounterId = rivalSystem.addRivalEncounter(encounterData);
      const encounters = rivalSystem.getRivalEncounters();
      const encounter = encounters[0];

      // Verify all required properties are present and correctly typed
      expect(typeof encounter.id).toBe('string');
      expect(typeof encounter.rivalId).toBe('string');
      expect(['chance', 'provoked', 'defense', 'competition']).toContain(encounter.type);
      expect(typeof encounter.location).toBe('string');
      expect(typeof encounter.outcome).toBe('string');
      expect(Array.isArray(encounter.lootGained)).toBe(true);
      expect(typeof encounter.reputationChange).toBe('object');
      expect(typeof encounter.year).toBe('number');
      expect(typeof encounter.timestamp).toBe('number');

      // Verify optional properties
      expect(encounter.description).toBeDefined();
    });

    it('should handle timestamp property correctly', () => {
      const beforeTime = Date.now();

      const encounterId = rivalSystem.addRivalEncounter({
        rivalId: 'test_rival',
        type: 'chance',
        location: 'Test',
        outcome: 'victory',
        lootGained: [],
        reputationChange: {},
        year: 2024
      });

      const afterTime = Date.now();
      const encounters = rivalSystem.getRivalEncounters();
      const encounter = encounters[0];

      expect(encounter.timestamp).toBeDefined();
      if (encounter.timestamp !== undefined) {
        expect(encounter.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(encounter.timestamp).toBeLessThanOrEqual(afterTime);
      }
    });
  });
});
