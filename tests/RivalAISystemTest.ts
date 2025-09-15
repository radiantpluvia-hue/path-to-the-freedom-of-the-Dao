import { RivalAISystem, RivalPersonalityProfile, AICombatDecision } from '../systems/RivalAISystem';
import { Rival } from '../types';
import { CombatSystem } from '../systems/CombatSystem';

describe('RivalAISystem', () => {
  let aiSystem: RivalAISystem;
  let mockCombatSystem: CombatSystem;
  let testRival: Rival;

  beforeEach(() => {
    mockCombatSystem = {} as CombatSystem;
    aiSystem = new RivalAISystem(mockCombatSystem);

    testRival = {
      id: 'test_rival',
      name: 'Test Rival',
      title: 'Azure Disciple',
      description: 'A test rival for AI system testing',
      faction: 'immortal_court',
      sect: 'azure_cloud_sect',
      realm: 'qi_condensation',
      level: 15,
      stats: { hp: 250, qi: 200, atk: 35, def: 25, speed: 30 },
      techniques: ['azure_sword_art', 'cloud_step'],
      personality: 'aggressive',
      relationship: -30,
      lastEncounter: 0,
      encounterCount: 0,
      defeated: false,
      specialAbilities: ['cloud_evasion'],
      loot: []
    };
  });

  describe('Personality Profiles', () => {
    test('should return correct personality profile for aggressive rival', () => {
      const profile = aiSystem.getPersonalityProfile('aggressive');

      expect(profile.combatStyle).toBe('aggressive');
      expect(profile.socialTendencies).toBe('intimidating');
      expect(profile.preferredTechniques).toContain('power_attacks');
      expect(profile.avoidedTechniques).toContain('defensive_stances');
    });

    test('should return neutral profile for unknown personality', () => {
      const profile = aiSystem.getPersonalityProfile('unknown' as any);

      expect(profile.combatStyle).toBe('technical');
      expect(profile.socialTendencies).toBe('diplomatic');
    });
  });

  describe('Combat Decision Making', () => {
    test('should make aggressive decisions for aggressive personality', () => {
      const situation = {
        playerHp: 100,
        rivalHp: 200,
        playerQi: 150,
        rivalQi: 180,
        turnNumber: 5,
        previousActions: ['attack', 'attack', 'defend']
      };

      const decision = aiSystem.makeCombatDecision(testRival, {} as any, situation);

      expect(decision).toBeDefined();
      expect(['attack', 'defend', 'use_technique', 'taunt', 'retreat']).toContain(decision.action);
      expect(decision.priority).toBeGreaterThan(0);
      expect(decision.reasoning).toBeDefined();
    });

    test('should adapt decisions based on low health', () => {
      const situation = {
        playerHp: 100,
        rivalHp: 50, // Low health
        playerQi: 150,
        rivalQi: 180,
        turnNumber: 5,
        previousActions: ['attack', 'attack', 'defend']
      };

      const decision = aiSystem.makeCombatDecision(testRival, {} as any, situation);

      // Aggressive personality should attack when low on health
      expect(decision.action).toBe('attack');
      expect(decision.priority).toBeGreaterThan(5);
    });

    test('should prefer techniques when high on Qi', () => {
      const situation = {
        playerHp: 100,
        rivalHp: 200,
        playerQi: 150,
        rivalQi: 190, // High Qi
        turnNumber: 5,
        previousActions: ['attack', 'attack', 'defend']
      };

      const decision = aiSystem.makeCombatDecision(testRival, {} as any, situation);

      // Should prioritize using techniques with high Qi
      if (decision.action === 'use_technique') {
        expect(decision.priority).toBeGreaterThan(5);
      }
    });
  });

  describe('Encounter Memory', () => {
    test('should record encounter results', () => {
      const playerActions = ['attack', 'defend', 'technique'];
      const successfulStrategies = ['power_attack'];
      const failedStrategies = ['defensive_stance'];

      aiSystem.recordEncounterResult(
        testRival.id,
        playerActions,
        successfulStrategies,
        failedStrategies
      );

      const memory = aiSystem.getEncounterMemory(testRival.id);
      expect(memory).toBeDefined();
      expect(memory!.playerActions).toEqual(playerActions);
      expect(memory!.successfulStrategies).toEqual(successfulStrategies);
      expect(memory!.failedStrategies).toEqual(failedStrategies);
      expect(memory!.adaptationLevel).toBe(1);
    });

    test('should adapt decisions based on memory', () => {
      // Record a successful encounter
      aiSystem.recordEncounterResult(
        testRival.id,
        ['attack', 'attack', 'attack'],
        ['power_attack'],
        ['defensive_stance']
      );

      const situation = {
        playerHp: 100,
        rivalHp: 200,
        playerQi: 150,
        rivalQi: 180,
        turnNumber: 5,
        previousActions: ['attack', 'attack', 'defend']
      };

      const decision = aiSystem.makeCombatDecision(testRival, {} as any, situation);

      // Should adapt to counter player's attack pattern
      expect(decision).toBeDefined();
    });
  });

  describe('Adaptive Dialogue', () => {
    test('should generate personality-appropriate dialogue', () => {
      const dialogue = aiSystem.generateAdaptiveDialogue(testRival, 'combat_start');

      expect(dialogue).toBeDefined();
      expect(typeof dialogue).toBe('string');
      expect(dialogue.length).toBeGreaterThan(0);
    });

    test('should generate different dialogue for different contexts', () => {
      const startDialogue = aiSystem.generateAdaptiveDialogue(testRival, 'combat_start');
      const victoryDialogue = aiSystem.generateAdaptiveDialogue(testRival, 'victory');
      const defeatDialogue = aiSystem.generateAdaptiveDialogue(testRival, 'defeat');

      expect(startDialogue).not.toBe(victoryDialogue);
      expect(victoryDialogue).not.toBe(defeatDialogue);
    });

    test('should adapt dialogue based on memory', () => {
      // Record multiple encounters to build adaptation
      for (let i = 0; i < 5; i++) {
        aiSystem.recordEncounterResult(
          testRival.id,
          ['attack'],
          ['power_attack'],
          []
        );
      }

      const tauntDialogue = aiSystem.generateAdaptiveDialogue(testRival, 'taunt');

      // Should include adaptive elements
      expect(tauntDialogue).toBeDefined();
    });
  });

  describe('Adaptive Difficulty', () => {
    test('should calculate base difficulty', () => {
      const difficulty = aiSystem.calculateAdaptiveDifficulty(testRival, 10);

      expect(difficulty).toBe(1.5); // rival level 15 / player level 10
    });

    test('should increase difficulty with adaptation', () => {
      // Record multiple encounters
      for (let i = 0; i < 5; i++) {
        aiSystem.recordEncounterResult(
          testRival.id,
          ['attack'],
          ['power_attack'],
          []
        );
      }

      const difficulty = aiSystem.calculateAdaptiveDifficulty(testRival, 10);

      expect(difficulty).toBeGreaterThan(1.5);
    });

    test('should cap maximum difficulty', () => {
      // Record many encounters to max adaptation
      for (let i = 0; i < 20; i++) {
        aiSystem.recordEncounterResult(
          testRival.id,
          ['attack'],
          ['power_attack', 'charge_move', 'special_attack'],
          []
        );
      }

      const difficulty = aiSystem.calculateAdaptiveDifficulty(testRival, 10);

      expect(difficulty).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Different Personalities', () => {
    const personalities: Rival['personality'][] = ['aggressive', 'cunning', 'honorable', 'treacherous', 'neutral'];

    test.each(personalities)('should handle %s personality correctly', (personality) => {
      const rivalWithPersonality = { ...testRival, personality };
      const situation = {
        playerHp: 100,
        rivalHp: 200,
        playerQi: 150,
        rivalQi: 180,
        turnNumber: 5,
        previousActions: ['attack', 'defend', 'technique']
      };

      const decision = aiSystem.makeCombatDecision(rivalWithPersonality, {} as any, situation);

      expect(decision).toBeDefined();
      expect(decision.action).toBeDefined();
      expect(decision.priority).toBeGreaterThan(0);
    });

    test.each(personalities)('should generate dialogue for %s personality', (personality) => {
      const rivalWithPersonality = { ...testRival, personality };

      const dialogue = aiSystem.generateAdaptiveDialogue(rivalWithPersonality, 'combat_start');

      expect(dialogue).toBeDefined();
      expect(typeof dialogue).toBe('string');
    });
  });
});
