import { GameState, PlayerState } from '../utils/types';
import {
  getRequiredQiForBreakthrough,
  getCultivationGainPerDay,
  cultivate,
  tryBreakthrough
} from '../evolutionUtils';

// Mock GameState for testing
const createMockPlayer = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  name: 'Test Player',
  realm: 1,
  level: 1,
  stats: { hp: 100, qi: 50, atk: 10, def: 5, speed: 8 },
  qi: 0,
  talent: 50,
  daoComprehension: 0,
  manuals: [],
  inventory: [],
  ...overrides
});

const createMockGameState = (playerOverrides: Partial<PlayerState> = {}): GameState => ({
  player: createMockPlayer(playerOverrides),
  world: {
    year: 1,
    day: 1,
    flags: {},
    factions: {}
  }
});

describe('Evolution Utils Tests', () => {
  describe('getRequiredQiForBreakthrough', () => {
    test('should return correct qi requirements for each realm', () => {
      expect(getRequiredQiForBreakthrough(1)).toBe(100);  // 1^2 * 100
      expect(getRequiredQiForBreakthrough(2)).toBe(400);  // 2^2 * 100
      expect(getRequiredQiForBreakthrough(3)).toBe(900);  // 3^2 * 100
      expect(getRequiredQiForBreakthrough(4)).toBe(1600); // 4^2 * 100
      expect(getRequiredQiForBreakthrough(5)).toBe(2500); // 5^2 * 100
    });

    test('should clamp realm values within valid range', () => {
      expect(getRequiredQiForBreakthrough(0)).toBe(100);  // clamped to 1
      expect(getRequiredQiForBreakthrough(11)).toBe(10000); // clamped to 10
      expect(getRequiredQiForBreakthrough(15)).toBe(10000); // clamped to 10
    });
  });

  describe('getCultivationGainPerDay', () => {
    test('should calculate base cultivation gain correctly', () => {
      const state = createMockGameState({
        talent: 50,
        daoComprehension: 0,
        realm: 1
      });

      const gain = getCultivationGainPerDay(state, 10);
      expect(gain).toBe(15); // base 10 * (1 + 0.5 + 0) * (1 + 0) = 15
    });

    test('should apply talent multiplier correctly', () => {
      const lowTalent = createMockGameState({ talent: 0, realm: 1 });
      const highTalent = createMockGameState({ talent: 100, realm: 1 });

      const lowGain = getCultivationGainPerDay(lowTalent, 10);
      const highGain = getCultivationGainPerDay(highTalent, 10);

      expect(lowGain).toBe(10);  // base 10 * (1 + 0 + 0) = 10
      expect(highGain).toBe(20); // base 10 * (1 + 1 + 0) = 20
    });

    test('should apply dao comprehension multiplier correctly', () => {
      const lowDao = createMockGameState({ daoComprehension: 0, talent: 0, realm: 1 });
      const highDao = createMockGameState({ daoComprehension: 100, talent: 0, realm: 1 });

      const lowGain = getCultivationGainPerDay(lowDao, 10);
      const highGain = getCultivationGainPerDay(highDao, 10);

      expect(lowGain).toBe(10);  // base 10 * (1 + 0 + 0) = 10
      expect(highGain).toBe(15); // base 10 * (1 + 0 + 0.5) = 15
    });

    test('should apply realm bonus correctly', () => {
      const realm1 = createMockGameState({ realm: 1, talent: 0 });
      const realm2 = createMockGameState({ realm: 2, talent: 0 });
      const realm5 = createMockGameState({ realm: 5, talent: 0 });

      const gain1 = getCultivationGainPerDay(realm1, 10);
      const gain2 = getCultivationGainPerDay(realm2, 10);
      const gain5 = getCultivationGainPerDay(realm5, 10);

      expect(gain1).toBe(10); // 10 * (1 + 0) = 10
      expect(gain2).toBe(10); // 10 * (1 + 0.05) = 10.5 -> 10 (floor)
      expect(gain5).toBe(12); // 10 * (1 + 0.2) = 12
    });

    test('should handle undefined talent and dao values', () => {
      const state = createMockGameState({
        talent: undefined,
        daoComprehension: undefined,
        realm: 1
      });

      const gain = getCultivationGainPerDay(state, 10);
      expect(gain).toBe(15); // Uses default values: 10 * (1 + 0.5 + 0) = 15
    });
  });

  describe('cultivate', () => {
    test('should increase qi by calculated daily gain', () => {
      const state = createMockGameState({ qi: 0, realm: 1, talent: 0 });
      const result = cultivate(state, 1, 10);

      expect(result.player.qi).toBe(10);
    });

    test('should handle multiple days correctly', () => {
      const state = createMockGameState({ qi: 0, realm: 1, talent: 0 });
      const result = cultivate(state, 3, 10);

      expect(result.player.qi).toBe(30); // 10 * 3 = 30
    });

    test('should accumulate qi with existing qi', () => {
      const state = createMockGameState({ qi: 50, realm: 1, talent: 0 });
      const result = cultivate(state, 1, 10);

      expect(result.player.qi).toBe(60); // 50 + 10 = 60
    });

    test('should handle zero days gracefully', () => {
      const state = createMockGameState({ qi: 50, realm: 1, talent: 0 });
      const result = cultivate(state, 0, 10);

      expect(result.player.qi).toBe(60); // Still applies 1 day minimum
    });

    test('should handle undefined qi gracefully', () => {
      const state = createMockGameState({ qi: undefined, realm: 1, talent: 0 });
      const result = cultivate(state, 1, 10);

      expect(result.player.qi).toBe(10);
    });
  });

  describe('tryBreakthrough', () => {
    test('should succeed when player has sufficient qi', () => {
      const state = createMockGameState({
        realm: 1,
        qi: 100,
        stats: { hp: 100, qi: 50, atk: 10, def: 5, speed: 8 }
      });

      const result = tryBreakthrough(state);

      expect(result.success).toBe(true);
      expect(result.state.player.realm).toBe(2);
      expect(result.state.player.qi).toBe(0); // 100 - 100 = 0 qi remaining
      expect(result.reason).toBeUndefined();
    });

    test('should fail when player has insufficient qi', () => {
      const state = createMockGameState({
        realm: 1,
        qi: 50
      });

      const result = tryBreakthrough(state);

      expect(result.success).toBe(false);
      expect(result.state).toBe(state); // State unchanged
      expect(result.reason).toContain('Insufficient qi');
    });

    test('should fail when player is at maximum realm', () => {
      const state = createMockGameState({
        realm: 10,
        qi: 10000
      });

      const result = tryBreakthrough(state);

      expect(result.success).toBe(false);
      expect(result.state).toBe(state); // State unchanged
      expect(result.reason).toContain('Already at highest realm');
    });

    test('should increase stats proportionally on successful breakthrough', () => {
      const state = createMockGameState({
        realm: 1,
        qi: 100,
        stats: { hp: 100, qi: 50, atk: 10, def: 5, speed: 8 }
      });

      const result = tryBreakthrough(state);

      expect(result.success).toBe(true);
      // Stats should be scaled by (1 + 0.1 + 1 * 0.02) = 1.12
      expect(result.state.player.stats.hp).toBe(112);   // 100 * 1.12
      expect(result.state.player.stats.atk).toBe(11);   // 10 * 1.12
      expect(result.state.player.stats.def).toBe(5);    // 5 * 1.12 = 5.6 -> 5 (floor)
      expect(result.state.player.stats.speed).toBe(8);  // 8 * 1.05 = 8.4 -> 8 (floor)
    });

    test('should handle edge case of realm 9 to 10', () => {
      const state = createMockGameState({
        realm: 9,
        qi: 8100, // Required for realm 9->10: 9^2 * 100 = 8100
        stats: { hp: 100, qi: 50, atk: 10, def: 5, speed: 8 }
      });

      const result = tryBreakthrough(state);

      expect(result.success).toBe(true);
      expect(result.state.player.realm).toBe(10);
      expect(result.state.player.qi).toBe(0); // 8100 - 8100 = 0 qi remaining
    });

    test('should handle undefined qi gracefully', () => {
      const state = createMockGameState({
        realm: 1,
        qi: undefined
      });

      const result = tryBreakthrough(state);

      expect(result.success).toBe(false);
      expect(result.reason).toContain('Insufficient qi');
    });

    test('should preserve other player properties', () => {
      const state = createMockGameState({
        realm: 1,
        qi: 100,
        name: 'Test Cultivator',
        talent: 75,
        manuals: [{ id: 'test-manual', name: 'Test Manual', type: 'dao', rarity: 'common', qty: 1 }]
      });

      const result = tryBreakthrough(state);

      expect(result.success).toBe(true);
      expect(result.state.player.name).toBe('Test Cultivator');
      expect(result.state.player.talent).toBe(75);
      expect(result.state.player.manuals).toEqual(state.player.manuals);
    });
  });

  describe('Integration Tests', () => {
    test('should handle full cultivation cycle from realm 1 to 2', () => {
      let state = createMockGameState({
        realm: 1,
        qi: 0,
        talent: 100, // Max talent for faster cultivation
        stats: { hp: 100, qi: 50, atk: 10, def: 5, speed: 8 }
      });

      // Cultivate until we have enough qi for breakthrough
      state = cultivate(state, 10, 10); // Should give us 200 qi (20/day * 10 days)
      expect(state.player.qi).toBe(200);

      // Attempt breakthrough
      const result = tryBreakthrough(state);
      expect(result.success).toBe(true);
      expect(result.state.player.realm).toBe(2);
      expect(result.state.player.qi).toBe(100); // 200 - 100 = 100 qi remaining
    });

    test('should handle multiple breakthroughs in sequence', () => {
      let state = createMockGameState({
        realm: 1,
        qi: 1000, // More than enough for multiple breakthroughs
        talent: 100,
        stats: { hp: 100, qi: 50, atk: 10, def: 5, speed: 8 }
      });

      // First breakthrough: 1 -> 2
      let result = tryBreakthrough(state);
      expect(result.success).toBe(true);
      expect(result.state.player.realm).toBe(2);
      expect(result.state.player.qi).toBe(900); // 1000 - 100 = 900
      state = result.state;

      // Second breakthrough: 2 -> 3 (needs 400 qi)
      // With talent 100: base 10 * (1 + 1.0 + 0) * (1 + 0.05) = 21 qi/day
      // 10 days = 210 qi, total = 900 + 210 = 1110 qi (> 400 needed)
      state = cultivate(state, 10, 10); // Add more qi
      expect(state.player.qi).toBe(1110); // Verify qi amount
      result = tryBreakthrough(state);
      expect(result.success).toBe(true);
      expect(result.state.player.realm).toBe(3);
    });
  });
});
