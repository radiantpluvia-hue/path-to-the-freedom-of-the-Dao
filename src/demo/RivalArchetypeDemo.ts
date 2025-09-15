import { RivalSystem } from '../systems/RivalSystem';

export class RivalArchetypeDemo {
  private rivalSystem: RivalSystem;

  constructor() {
    this.rivalSystem = new RivalSystem();
  }

  public runDemo(): void {
    console.log('=== Rival Archetype System Demo ===\n');

    // 1. Generate rivals with different archetypes
    console.log('1. Generating Rivals with Archetypes:');
    const rival1 = this.rivalSystem.generateRival({ minLevel: 10, maxLevel: 20 });
    const rival2 = this.rivalSystem.generateRival({ minLevel: 25, maxLevel: 35 });
    const rival3 = this.rivalSystem.generateRival({ minLevel: 40, maxLevel: 50 });

    console.log(`Generated ${rival1.name} (${rival1.archetype}) - Level ${rival1.level}`);
    console.log(`Generated ${rival2.name} (${rival2.archetype}) - Level ${rival2.level}`);
    console.log(`Generated ${rival3.name} (${rival3.archetype}) - Level ${rival3.level}\n`);

    // 2. Show archetype information
    console.log('2. Archetype Information:');
    const archetypes = this.rivalSystem.getAllArchetypes();
    console.log(`Available archetypes: ${archetypes.join(', ')}\n`);

    if (rival1.archetype) {
      const archetypeInfo = this.rivalSystem.getArchetypeInfo(rival1.archetype);
      if (archetypeInfo) {
        console.log(`Archetype: ${archetypeInfo.name}`);
        console.log(`Description: ${archetypeInfo.description}`);
        console.log(`Personality: ${archetypeInfo.personality}`);
        console.log(`Techniques: ${archetypeInfo.techniques.join(', ')}`);
        console.log(`Special Abilities: ${archetypeInfo.specialAbilities.join(', ')}\n`);
      }
    }

    // 3. Show rival growth information
    console.log('3. Rival Growth Information:');
    const growthInfo = this.rivalSystem.getRivalGrowthInfo(rival1.id);
    if (growthInfo) {
      console.log(`Current Level: ${growthInfo.currentLevel}`);
      console.log(`Max Level: ${growthInfo.maxLevel}`);
      console.log(`Growth Stage: ${growthInfo.growthStage}`);
      console.log(`Breakthrough Chance: ${(growthInfo.breakthroughChance * 100).toFixed(1)}%`);
      console.log(`Teaching Affinity: ${growthInfo.teachingAffinity}\n`);
    }

    // 4. Show teaching options
    console.log('4. Teaching Options:');
    const teachingOptions = this.rivalSystem.getRivalTeachingOptions(rival1.id);
    if (teachingOptions.length > 0) {
      teachingOptions.forEach((option, index) => {
        console.log(`${index + 1}. ${option.name}`);
        console.log(`   Type: ${option.type}`);
        console.log(`   Success Rate: ${(option.successRate * 100).toFixed(1)}%`);
        console.log(`   Requirements: Relationship ${option.requirements.relationship}, Level ${option.requirements.level}\n`);
      });
    } else {
      console.log('No teaching options available for this rival.\n');
    }

    // 5. Simulate rival growth over time
    console.log('5. Simulating Rival Growth:');
    const initialLevel = rival1.level;
    console.log(`Initial level: ${initialLevel}`);

    // Simulate 100 days of growth
    this.rivalSystem.processRivalGrowth(rival1.id, 100);
    console.log(`After 100 days: Level ${rival1.level}`);

    // Simulate another 200 days
    this.rivalSystem.processRivalGrowth(rival1.id, 300);
    console.log(`After 300 days: Level ${rival1.level}\n`);

    // 6. Show rivals by archetype
    console.log('6. Rivals by Archetype:');
    archetypes.forEach(archetypeId => {
      const rivalsOfType = this.rivalSystem.getRivalsByArchetype(archetypeId);
      if (rivalsOfType.length > 0) {
        console.log(`${archetypeId}: ${rivalsOfType.length} rival(s)`);
      }
    });

    console.log('\n=== Demo Complete ===');
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  const demo = new RivalArchetypeDemo();
  demo.runDemo();
}
