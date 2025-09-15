import { CombatSystem, CombatParticipant, CombatContext } from '../src/systems/CombatSystem';

// Mock game store for testing
class MockGameStore {
  player = {
    sect: 'test_sect'
  };

  getSectReputation(sect: string): number {
    const reputations: Record<string, number> = {
      'test_sect': 75,
      'high_rep_sect': 95,
      'low_rep_sect': -50,
      'neutral_sect': 0
    };
    return reputations[sect] || 0;
  }

  getFactionStanding(faction: string): number {
    const standings: Record<string, number> = {
      'test_faction': 60,
      'high_standing_faction': 90,
      'low_standing_faction': -40,
      'neutral_faction': 0
    };
    return standings[faction] || 0;
  }

  adjustFactionStanding(faction: string, change: number): void {
    // Mock implementation
  }

  adjustSectReputation(sect: string, change: number): void {
    // Mock implementation
  }

  adjustRivalRelationship(rivalId: string, change: number): void {
    // Mock implementation
  }

  markRivalDefeated(rivalId: string): void {
    // Mock implementation
  }
}

// Mock rival system for testing
class MockRivalSystem {
  getRival(rivalId: string) {
    const rivals: Record<string, any> = {
      'rival_aggressive': {
        personality: 'aggressive',
        faction: 'test_faction',
        relationship: 0
      },
      'rival_cunning': {
        personality: 'cunning',
        faction: 'high_standing_faction',
        relationship: 50
      },
      'rival_honorable': {
        personality: 'honorable',
        faction: 'low_standing_faction',
        relationship: -30
      },
      'rival_treacherous': {
        personality: 'treacherous',
        faction: 'neutral_faction',
        relationship: -80
      },
      'rival_neutral': {
        personality: 'neutral',
        faction: 'test_faction',
        relationship: 20
      }
    };
    return rivals[rivalId];
  }
}

describe('CombatSystem Faction Enhancements', () => {
  let mockGameStore: MockGameStore;
  let mockRivalSystem: MockRivalSystem;

  beforeEach(() => {
    mockGameStore = new MockGameStore();
    mockRivalSystem = new MockRivalSystem();
  });

  describe('Player Faction Bonuses', () => {
    test('should apply correct faction bonus for high sect reputation', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'normal' };
      const combatSystem = new CombatSystem(player, [], mockGameStore, mockRivalSystem, context);

      // High reputation sect should give significant bonus
      const updatedPlayer = combatSystem.getState().participants[0];
      expect(updatedPlayer.stats.atk).toBeGreaterThan(20);
      expect(updatedPlayer.stats.def).toBeGreaterThan(15);
      expect(updatedPlayer.stats.speed).toBeGreaterThan(10);
    });

    test('should apply correct faction bonus for low sect reputation', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      // Override sect for low reputation
      mockGameStore.player.sect = 'low_rep_sect';

      const context: CombatContext = { type: 'normal' };
      const combatSystem = new CombatSystem(player, [], mockGameStore, mockRivalSystem, context);

      const updatedPlayer = combatSystem.getState().participants[0];
      expect(updatedPlayer.stats.atk).toBeLessThan(20);
      expect(updatedPlayer.stats.def).toBeLessThan(15);
    });

    test('should handle neutral sect reputation correctly', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      mockGameStore.player.sect = 'neutral_sect';

      const context: CombatContext = { type: 'normal' };
      const combatSystem = new CombatSystem(player, [], mockGameStore, mockRivalSystem, context);

      const updatedPlayer = combatSystem.getState().participants[0];
      // Neutral reputation should give minimal bonus
      expect(updatedPlayer.stats.atk).toBeGreaterThan(19); // Small bonus
      expect(updatedPlayer.stats.atk).toBeLessThan(25); // Not too much
    });
  });

  describe('Rival Personality Multipliers', () => {
    test('should apply aggressive personality multiplier correctly', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const rival: CombatParticipant = {
        id: 'rival_aggressive',
        name: 'Aggressive Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 18, def: 16, speed: 12 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'rival', rivalId: 'rival_aggressive' };
      const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem, context);

      const updatedRival = combatSystem.getState().participants[1];
      // Aggressive personality (1.2 multiplier) with faction bonus should increase attack significantly
      expect(updatedRival.stats.atk).toBeGreaterThan(18);
      expect(updatedRival.stats.def).toBeLessThan(16); // Should decrease defense
    });

    test('should apply cunning personality multiplier correctly', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const rival: CombatParticipant = {
        id: 'rival_cunning',
        name: 'Cunning Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 18, def: 16, speed: 12 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'rival', rivalId: 'rival_cunning' };
      const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem, context);

      const updatedRival = combatSystem.getState().participants[1];
      // Cunning personality (1.1 multiplier) with high faction standing should boost speed
      expect(updatedRival.stats.speed).toBeGreaterThan(12);
    });

    test('should apply honorable personality multiplier correctly', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const rival: CombatParticipant = {
        id: 'rival_honorable',
        name: 'Honorable Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 18, def: 16, speed: 12 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'rival', rivalId: 'rival_honorable' };
      const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem, context);

      const updatedRival = combatSystem.getState().participants[1];
      // Honorable personality (1.3 multiplier) with low faction standing should still give balanced boost
      expect(updatedRival.stats.atk).toBeGreaterThan(18);
      expect(updatedRival.stats.def).toBeGreaterThan(16);
    });

    test('should apply treacherous personality multiplier correctly', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const rival: CombatParticipant = {
        id: 'rival_treacherous',
        name: 'Treacherous Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 18, def: 16, speed: 12 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'rival', rivalId: 'rival_treacherous' };
      const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem, context);

      const updatedRival = combatSystem.getState().participants[1];
      // Treacherous personality (0.9 multiplier) should reduce faction benefits
      expect(updatedRival.stats.atk).toBeLessThan(20); // Less than neutral bonus
    });

    test('should apply neutral personality multiplier correctly', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const rival: CombatParticipant = {
        id: 'rival_neutral',
        name: 'Neutral Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 18, def: 16, speed: 12 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'rival', rivalId: 'rival_neutral' };
      const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem, context);

      const updatedRival = combatSystem.getState().participants[1];
      // Neutral personality (1.0 multiplier) should give standard faction bonus
      expect(updatedRival.stats.atk).toBeGreaterThan(18);
      expect(updatedRival.stats.def).toBeGreaterThan(16);
    });
  });

  describe('Stat Validation and Clamping', () => {
    test('should clamp extremely high stats', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 1000, def: 800, speed: 500 }, // Extremely high base stats
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'normal' };
      const combatSystem = new CombatSystem(player, [], mockGameStore, mockRivalSystem, context);

      const updatedPlayer = combatSystem.getState().participants[0];
      // Stats should be clamped to reasonable maximums
      expect(updatedPlayer.stats.atk).toBeLessThanOrEqual(2500); // 2.5x multiplier max
      expect(updatedPlayer.stats.def).toBeLessThanOrEqual(2000);
      expect(updatedPlayer.stats.speed).toBeLessThanOrEqual(1250);
    });

    test('should prevent negative stats', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 1, def: 1, speed: 1 }, // Very low base stats
        techniques: [],
        buffs: [],
        debuffs: []
      };

      mockGameStore.player.sect = 'low_rep_sect'; // Very negative reputation

      const context: CombatContext = { type: 'normal' };
      const combatSystem = new CombatSystem(player, [], mockGameStore, mockRivalSystem, context);

      const updatedPlayer = combatSystem.getState().participants[0];
      // Stats should never go below 1
      expect(updatedPlayer.stats.atk).toBeGreaterThanOrEqual(1);
      expect(updatedPlayer.stats.def).toBeGreaterThanOrEqual(1);
      expect(updatedPlayer.stats.speed).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing gameStore gracefully', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'normal' };
      const combatSystem = new CombatSystem(player, [], null as any, mockRivalSystem, context);

      const updatedPlayer = combatSystem.getState().participants[0];
      // Should revert to original stats on error
      expect(updatedPlayer.stats.atk).toBe(20);
      expect(updatedPlayer.stats.def).toBe(15);
      expect(updatedPlayer.stats.speed).toBe(10);
    });

    test('should handle missing rivalSystem gracefully', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const rival: CombatParticipant = {
        id: 'rival_test',
        name: 'Test Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 18, def: 16, speed: 12 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      const context: CombatContext = { type: 'rival', rivalId: 'rival_test' };
      const combatSystem = new CombatSystem(player, [rival], mockGameStore, null as any, context);

      const updatedRival = combatSystem.getState().participants[1];
      // Should not apply rival mechanics if rivalSystem is missing
      expect(updatedRival.stats.atk).toBe(18);
      expect(updatedRival.stats.def).toBe(16);
      expect(updatedRival.stats.speed).toBe(12);
    });

    test('should handle invalid sect reputation gracefully', () => {
      const player: CombatParticipant = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 20, def: 15, speed: 10 },
        techniques: [],
        buffs: [],
        debuffs: []
      };

      // Mock invalid reputation
      mockGameStore.getSectReputation = () => NaN;

      const context: CombatContext = { type: 'normal' };
      const combatSystem = new CombatSystem(player, [], mockGameStore, mockRivalSystem, context);

      const updatedPlayer = combatSystem.getState().participants[0];
      // Should revert to original stats on invalid data
      expect(updatedPlayer.stats.atk).toBe(20);
      expect(updatedPlayer.stats.def).toBe(15);
      expect(updatedPlayer.stats.speed).toBe(10);
    });
  });

});

describe('CombatSystem Integration Tests', () => {
  let mockGameStore: MockGameStore;
  let mockRivalSystem: MockRivalSystem;

  beforeEach(() => {
    mockGameStore = new MockGameStore();
    mockRivalSystem = new MockRivalSystem();
  });

  test('should integrate faction bonuses with existing combat mechanics', () => {
    const player: CombatParticipant = {
      id: 'player',
      name: 'Test Player',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: { atk: 20, def: 15, speed: 10 },
      techniques: [{
        id: 'basic_attack',
        name: 'Basic Attack',
        description: 'A simple attack',
        apCost: 1,
        qiCost: 0,
        type: 'attack',
        effects: [{ type: 'damage', target: 'enemy', value: 10 }]
      }],
      buffs: [],
      debuffs: []
    };

    const rival: CombatParticipant = {
      id: 'rival_test',
      name: 'Test Rival',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: { atk: 18, def: 16, speed: 12 },
      techniques: [{
        id: 'basic_attack',
        name: 'Basic Attack',
        description: 'A simple attack',
        apCost: 1,
        qiCost: 0,
        type: 'attack',
        effects: [{ type: 'damage', target: 'enemy', value: 10 }]
      }],
      buffs: [],
      debuffs: []
    };

    const context: CombatContext = { type: 'rival', rivalId: 'rival_aggressive' };
    const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem, context);

    // Verify faction bonuses are applied
    const updatedPlayer = combatSystem.getState().participants[0];
    const updatedRival = combatSystem.getState().participants[1];

    expect(updatedPlayer.stats.atk).toBeGreaterThan(20);
    expect(updatedRival.stats.atk).toBeGreaterThan(18);

    // Verify combat mechanics still work
    const success = combatSystem.useTechnique('player', 'basic_attack', 'rival_test');
    expect(success).toBe(true);

    const finalRival = combatSystem.getState().participants[1];
    expect(finalRival.hp).toBeLessThan(100);
  });

  test('should handle multiple rivals with different personalities', () => {
    const player: CombatParticipant = {
      id: 'player',
      name: 'Test Player',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: { atk: 20, def: 15, speed: 10 },
      techniques: [],
      buffs: [],
      debuffs: []
    };

    const rivals: CombatParticipant[] = [
      {
        id: 'rival_aggressive',
        name: 'Aggressive Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 18, def: 16, speed: 12 },
        techniques: [],
        buffs: [],
        debuffs: []
      },
      {
        id: 'rival_cunning',
        name: 'Cunning Rival',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 19, def: 17, speed: 11 },
        techniques: [],
        buffs: [],
        debuffs: []
      }
    ];

    const context: CombatContext = { type: 'normal' };
    const combatSystem = new CombatSystem(player, rivals, mockGameStore, mockRivalSystem, context);

    const participants = combatSystem.getState().participants;

    // Player should have faction bonus
    expect(participants[0].stats.atk).toBeGreaterThan(20);

    // Aggressive rival should have higher attack, lower defense
    expect(participants[1].stats.atk).toBeGreaterThan(18);
    expect(participants[1].stats.def).toBeLessThan(16);

    // Cunning rival should have higher speed
    expect(participants[2].stats.speed).toBeGreaterThan(11);
  });
});
