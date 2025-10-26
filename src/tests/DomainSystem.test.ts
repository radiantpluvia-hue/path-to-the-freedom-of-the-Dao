import { DomainSystem } from '../systems/DomainSystem';
import type { DomainState } from '../types';

describe('DomainSystem', () => {
  let domainSystem: DomainSystem;

  beforeEach(() => {
    domainSystem = new DomainSystem(DomainSystem.defaultState());
  });

  describe('Static Methods (Backward Compatibility)', () => {
    test('defaultState creates valid domain state', () => {
      const state = DomainSystem.defaultState();
      expect(state.id).toBe('player_domain');
      expect(state.level).toBe(1);
      expect(state.xp).toBe(0);
      expect(state.resources).toEqual({
        gold: 0,
        food: 0,
        spirit_ore: 0,
        spirit_stone: 0,
        influencePoint: 0
      });
      expect(state.territories).toEqual({});
      expect(state.factions).toEqual({});
      expect(state.buildings).toEqual({});
    });

    test('addResource modifies resource correctly', () => {
      const state = DomainSystem.defaultState();
      const newState = DomainSystem.addResource(state, 'gold', 100);
      expect(newState.resources.gold).toBe(100);
      expect(newState.resources.food).toBe(0); // unchanged
      expect(newState).not.toBe(state); // immutable
    });

    test('gainXP increases XP and levels up', () => {
      const state = DomainSystem.defaultState();
      const newState = DomainSystem.gainXP(state, 250); // Need 200 XP for level 2 (level * 100)
      expect(newState.xp).toBe(250);
      expect(newState.level).toBe(2);
    });
  });

  describe('Core Domain Functionality', () => {
    test('tick processes without errors', () => {
      expect(() => {
        domainSystem.tick(60);
      }).not.toThrow();
    });

    test('tick generates resources from territories', () => {
      // Add a test territory to the domain system
      const state = DomainSystem.defaultState();
      state.territories = {
        'town_1': {
          id: 'town_1',
          nodeType: 'town',
          ownerFactionId: 'player_faction',
          influence: { player_faction: 100 },
          buildings: {},
          garrison: { troops: 10, quality: 1.0 },
          lastActionIso: new Date().toISOString(),
          rarity: "H",
          neighbors: []
        }
      };

      // Create new domain system with populated state
      const populatedDomainSystem = new DomainSystem(state);
      populatedDomainSystem.tick(60);

      const currentState = populatedDomainSystem.serialize();
      expect(currentState.resources.gold).toBeGreaterThan(0);
      expect(currentState.resources.food).toBeGreaterThan(0);
    });

    test('serialize returns current state', () => {
      const state = domainSystem.serialize();
      expect(state).toBeDefined();
      expect(state.id).toBe('player_domain');
    });
  });

  describe('Resource Generation', () => {
    test('calculateResourceGeneration returns valid income', () => {
      const income = (domainSystem as any).calculateResourceGeneration();
      expect(income).toBeDefined();
      expect(typeof income.gold).toBe('number');
      expect(typeof income.food).toBe('number');
    });
  });

  describe('Territory Income', () => {
    test('getTerritoryIncome calculates income for town', () => {
      const territory = {
        id: 'town_1',
        nodeType: 'town' as const,
        ownerFactionId: 'player_faction',
        influence: { player_faction: 100 },
        buildings: {},
        garrison: { troops: 10, quality: 1.0 },
        lastActionIso: new Date().toISOString(),
        rarity: "H" as const,
        neighbors: []
      };

      const income = (domainSystem as any).getTerritoryIncome(territory);
      expect(income.gold).toBeGreaterThan(0);
      expect(income.food).toBeGreaterThan(0);
      expect(income.influencePoint).toBeGreaterThan(0);
    });
  });
});
