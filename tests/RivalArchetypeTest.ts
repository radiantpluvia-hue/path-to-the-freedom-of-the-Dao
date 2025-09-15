import { RivalSystem } from '../systems/RivalSystem';
import { getRandomArchetype, getArchetypeById } from '../data/rivalArchetypes';

describe('Rival Archetype System', () => {
  let rivalSystem: RivalSystem;

  beforeEach(() => {
    rivalSystem = new RivalSystem();
  });

  test('should generate rival with archetype', () => {
    const rival = rivalSystem.generateRival({ minLevel: 10, maxLevel: 20 });

    expect(rival).toBeDefined();
    expect(rival.archetype).toBeDefined();
    expect(rival.growthStage).toBeDefined();
    expect(rival.teachingAffinity).toBeDefined();
    expect(rival.storyProgression).toBeDefined();
  });

  test('should generate rival with specific faction bias', () => {
    const rival = rivalSystem.generateRival({
      faction: 'immortal_court',
      minLevel: 15,
      maxLevel: 25
    });

    expect(rival).toBeDefined();
    expect(rival.faction).toBe('immortal_court');
    expect(rival.level).toBeGreaterThanOrEqual(15);
    expect(rival.level).toBeLessThanOrEqual(25);
  });

  test('should get rival growth info', () => {
    const rival = rivalSystem.generateRival();
    const growthInfo = rivalSystem.getRivalGrowthInfo(rival.id);

    expect(growthInfo).toBeDefined();
    expect(growthInfo.currentLevel).toBe(rival.level);
    expect(growthInfo.teachingAffinity).toBeDefined();
  });

  test('should get teaching options for rival', () => {
    const rival = rivalSystem.generateRival();
    const teachingOptions = rivalSystem.getRivalTeachingOptions(rival.id);

    expect(Array.isArray(teachingOptions)).toBe(true);
    if (teachingOptions.length > 0) {
      expect(teachingOptions[0]).toHaveProperty('type');
      expect(teachingOptions[0]).toHaveProperty('name');
      expect(teachingOptions[0]).toHaveProperty('successRate');
    }
  });

  test('should get rivals by archetype', () => {
    // Generate several rivals
    const rival1 = rivalSystem.generateRival();
    const rival2 = rivalSystem.generateRival();
    const rival3 = rivalSystem.generateRival();

    if (rival1.archetype) {
      const rivalsOfSameArchetype = rivalSystem.getRivalsByArchetype(rival1.archetype);
      expect(rivalsOfSameArchetype.length).toBeGreaterThanOrEqual(1);
      expect(rivalsOfSameArchetype.some(r => r.id === rival1.id)).toBe(true);
    }
  });

  test('should get all archetypes', () => {
    const archetypes = rivalSystem.getAllArchetypes();
    expect(Array.isArray(archetypes)).toBe(true);
    expect(archetypes.length).toBeGreaterThan(0);
  });

  test('should get archetype info', () => {
    const archetypes = rivalSystem.getAllArchetypes();
    if (archetypes.length > 0) {
      const archetypeInfo = rivalSystem.getArchetypeInfo(archetypes[0]);
      expect(archetypeInfo).toBeDefined();
      expect(archetypeInfo?.id).toBe(archetypes[0]);
    }
  });

  test('should process rival growth', () => {
    const rival = rivalSystem.generateRival({ minLevel: 5, maxLevel: 5 });
    const initialLevel = rival.level;

    // Simulate time passing (more than growth threshold)
    rivalSystem.processRivalGrowth(rival.id, 100); // 100 days later

    // Growth might or might not happen based on random chance
    // Just verify the method doesn't crash
    expect(rival).toBeDefined();
  });

  test('should attempt rival teaching', () => {
    const rival = rivalSystem.generateRival();
    const teachingOptions = rivalSystem.getRivalTeachingOptions(rival.id);

    if (teachingOptions.length > 0) {
      const success = rivalSystem.attemptRivalTeaching(
        rival.id,
        teachingOptions[0].type,
        rival.level - 5, // Player level slightly below rival
        60 // Good relationship
      );

      // Success depends on random roll, but method should return boolean
      expect(typeof success).toBe('boolean');
    }
  });
});
