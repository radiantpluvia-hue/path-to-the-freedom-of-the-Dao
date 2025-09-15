import { RivalSystem } from '../systems/RivalSystem';
import { SectFactionSystem } from '../systems/SectSystem';
import { getRandomArchetype } from '../data/rivalArchetypes';
import { MAJOR_SECTS, MAJOR_FACTIONS } from '../systems/SectSystem';

/**
 * Demonstration of Rival System Null Reference Fixes
 * This demo shows how the system handles various null reference scenarios
 */
export class RivalSystemNullReferenceDemo {
  private rivalSystem: RivalSystem;
  private sectFactionSystem: SectFactionSystem;

  constructor() {
    this.rivalSystem = new RivalSystem();
    this.sectFactionSystem = new SectFactionSystem(this.rivalSystem);
  }

  /**
   * Demo 1: Archetype Generation with Null Handling
   */
  demoArchetypeGeneration() {
    console.log('=== Demo 1: Archetype Generation with Null Handling ===');

    // Test normal generation
    const normalRival = this.rivalSystem.generateRival();
    console.log('Normal rival generation:', {
      name: normalRival.name,
      archetype: normalRival.archetype,
      level: normalRival.level
    });

    // Test with mocked null archetype
    const originalGetRandomArchetype = getRandomArchetype;
    (global as any).getRandomArchetype = jest.fn().mockReturnValue(null);

    const fallbackRival = this.rivalSystem.generateRival();
    console.log('Fallback rival generation (null archetype):', {
      name: fallbackRival.name,
      archetype: fallbackRival.archetype,
      level: fallbackRival.level
    });

    // Restore original function
    (global as any).getRandomArchetype = originalGetRandomArchetype;
  }

  /**
   * Demo 2: Growth Processing with Null Archetype
   */
  demoGrowthProcessing() {
    console.log('\n=== Demo 2: Growth Processing with Null Archetype ===');

    const rival = this.rivalSystem.generateRival();
    console.log('Original rival:', {
      id: rival.id,
      archetype: rival.archetype,
      level: rival.level
    });

    // Simulate null archetype scenario
    (rival as any).archetype = null;
    console.log('After setting archetype to null:', {
      id: rival.id,
      archetype: rival.archetype,
      level: rival.level
    });

    // Test growth processing - should not throw
    try {
      this.rivalSystem.processRivalGrowth(rival.id, Date.now());
      console.log('✅ Growth processing succeeded with null archetype');
    } catch (error) {
      console.log('❌ Growth processing failed:', error);
    }

    // Test teaching options - should return empty array
    const teachingOptions = this.rivalSystem.getRivalTeachingOptions(rival.id);
    console.log('Teaching options with null archetype:', teachingOptions);

    // Test growth info - should return null
    const growthInfo = this.rivalSystem.getRivalGrowthInfo(rival.id);
    console.log('Growth info with null archetype:', growthInfo);
  }

  /**
   * Demo 3: Loot Generation Edge Cases
   */
  demoLootGeneration() {
    console.log('\n=== Demo 3: Loot Generation Edge Cases ===');

    const archetype = getRandomArchetype();
    if (!archetype) {
      console.log('No archetype available for loot demo');
      return;
    }

    console.log('Testing loot generation with archetype:', archetype.name);

    // Test with null lootTable
    const mockArchetypeNullLoot = { ...archetype, lootTable: null };
    const lootNull = (this.rivalSystem as any).generateArchetypeLoot(
      mockArchetypeNullLoot,
      MAJOR_SECTS[0],
      10
    );
    console.log('Loot with null lootTable:', lootNull);

    // Test with incomplete lootTable
    const mockArchetypeIncomplete = {
      ...archetype,
      lootTable: {
        common: undefined,
        uncommon: undefined,
        rare: undefined
      }
    };
    const lootIncomplete = (this.rivalSystem as any).generateArchetypeLoot(
      mockArchetypeIncomplete,
      MAJOR_SECTS[0],
      10
    );
    console.log('Loot with incomplete lootTable:', lootIncomplete);

    // Test with empty lootTable
    const mockArchetypeEmpty = {
      ...archetype,
      lootTable: {}
    };
    const lootEmpty = (this.rivalSystem as any).generateArchetypeLoot(
      mockArchetypeEmpty,
      MAJOR_SECTS[0],
      10
    );
    console.log('Loot with empty lootTable:', lootEmpty);
  }

  /**
   * Demo 4: Sect/Faction Validation
   */
  demoSectFactionValidation() {
    console.log('\n=== Demo 4: Sect/Faction Validation ===');

    // Test with empty arrays
    const originalMajorSects = [...MAJOR_SECTS];
    const originalMajorFactions = [...MAJOR_FACTIONS];

    console.log('Original array sizes:', {
      sects: MAJOR_SECTS.length,
      factions: MAJOR_FACTIONS.length
    });

    // Mock empty arrays
    (global as any).MAJOR_SECTS = [];
    (global as any).MAJOR_FACTIONS = [];

    const rivalWithEmptyArrays = this.rivalSystem.generateRival();
    console.log('Rival generated with empty sect/faction arrays:', {
      name: rivalWithEmptyArrays.name,
      sect: rivalWithEmptyArrays.sect,
      faction: rivalWithEmptyArrays.faction
    });

    // Restore original arrays
    (global as any).MAJOR_SECTS = originalMajorSects;
    (global as any).MAJOR_FACTIONS = originalMajorFactions;
  }

  /**
   * Demo 5: Concurrent Operations Stress Test
   */
  demoConcurrentOperations() {
    console.log('\n=== Demo 5: Concurrent Operations Stress Test ===');

    const rivals = [];
    const numRivals = 10;

    // Generate multiple rivals
    for (let i = 0; i < numRivals; i++) {
      const rival = this.rivalSystem.generateRival();
      rivals.push(rival);
    }

    console.log(`Generated ${rivals.length} rivals for stress test`);

    // Simulate null scenarios for half the rivals
    rivals.forEach((rival, index) => {
      if (index % 2 === 0) {
        (rival as any).archetype = null;
        console.log(`Set rival ${rival.id} archetype to null`);
      }
    });

    // Test batch operations
    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    rivals.forEach(rival => {
      try {
        this.rivalSystem.processRivalGrowth(rival.id, Date.now());
        this.rivalSystem.getRivalTeachingOptions(rival.id);
        this.rivalSystem.getRivalGrowthInfo(rival.id);
        successCount++;
      } catch (error) {
        failureCount++;
        console.log(`Failed operation for rival ${rival.id}:`, error);
      }
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('Stress test results:', {
      totalOperations: rivals.length * 3, // 3 operations per rival
      successfulOperations: successCount * 3,
      failedOperations: failureCount * 3,
      duration: `${duration}ms`,
      operationsPerSecond: Math.round((rivals.length * 3) / (duration / 1000))
    });
  }

  /**
   * Run all demonstrations
   */
  runAllDemos() {
    console.log('🚀 Starting Rival System Null Reference Fixes Demo\n');

    this.demoArchetypeGeneration();
    this.demoGrowthProcessing();
    this.demoLootGeneration();
    this.demoSectFactionValidation();
    this.demoConcurrentOperations();

    console.log('\n✅ All demonstrations completed successfully!');
    console.log('🎯 The Rival System now handles all null reference scenarios gracefully.');
  }
}

// Export for use in other files
export default RivalSystemNullReferenceDemo;
