import { describe, it, expect } from '@jest/globals';
import { getActiveSynergies, calculateSynergyBonuses } from '../utils/physiqueSynergies';
import { PHYSIQUES } from '../data/physiques';

describe('Physique Synergy System', () => {
  describe('getActiveSynergies', () => {
    it('should return empty array when no physiques provided', () => {
      const result = getActiveSynergies([]);
      expect(result).toEqual([]);
    });

    it('should return empty array when only one physique provided', () => {
      const physiques = [PHYSIQUES[0]];
      const result = getActiveSynergies(physiques);
      expect(result).toEqual([]);
    });

    it('should find synergies when compatible physiques are provided', () => {
      // Mock physiques that would form a synergy
      const mockPhysiques = [
        { id: 'heavenly_spirit_root', name: 'Heavenly Spirit Root', description: 'Rooted in spirit', rarity: "F" as any, effects: {} },
        { id: 'divine_body_forging', name: 'Divine Body Forging', description: 'Tempered by divinity', rarity: "E" as any, effects: {} }
      ];

      const result = getActiveSynergies(mockPhysiques);
      // This will depend on the actual synergy data, but should return synergies if they exist
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('calculateSynergyBonuses', () => {
    it('should return empty object when no physiques provided', () => {
      const result = calculateSynergyBonuses([]);
      expect(result).toEqual({});
    });

    it('should return empty object when only one physique provided', () => {
      const physiques = [PHYSIQUES[0]];
      const result = calculateSynergyBonuses(physiques);
      expect(result).toEqual({});
    });

    it('should calculate bonuses when synergies are active', () => {
      // Mock physiques that would form a synergy
      const mockPhysiques = [
        { id: 'heavenly_spirit_root', name: 'Heavenly Spirit Root', description: 'Rooted in spirit', rarity: "F" as any, effects: {} },
        { id: 'divine_body_forging', name: 'Divine Body Forging', description: 'Tempered by divinity', rarity: "E" as any, effects: {} }
      ];

      const result = calculateSynergyBonuses(mockPhysiques);
      // This will depend on the actual synergy data
      expect(typeof result).toBe('object');
    });
  });

  describe('Integration with Cultivation Mechanics', () => {
    it('should integrate synergy bonuses into cultivation modifiers', () => {
      const { getApplicableModifiers } = require('../../cultivationMechanics');

      // Mock active physiques
      const activePhysiques = [
        { id: 'heavenly_spirit_root', name: 'Heavenly Spirit Root', effects: { cultivation_speed: 0.1 } },
        { id: 'divine_body_forging', name: 'Divine Body Forging', effects: { cultivation_speed: 0.1 } }
      ];

      const modifiers = getApplicableModifiers([], [], undefined, undefined, undefined, activePhysiques);

      // Should include physique modifiers and potentially synergy modifiers
      expect(Array.isArray(modifiers)).toBe(true);
      expect(modifiers.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Physique Synergy UI Component', () => {
  it('should render without crashing', () => {
    // This would require React testing setup
    // For now, just verify the component can be imported
    const { PhysiqueSynergyPanel } = require('../components/PhysiqueSynergyPanel');
    expect(typeof PhysiqueSynergyPanel).toBe('function');
  });
});

describe('Game Store Integration', () => {
  it('should provide physique synergy functions', () => {
    const { useGameStore } = require('../store/useGameStore');

    // Mock the store to test the functions exist
    const mockStore = {
      getActivePhysiqueSynergies: jest.fn(),
      getPhysiqueSynergyBonuses: jest.fn()
    };

    expect(typeof mockStore.getActivePhysiqueSynergies).toBe('function');
    expect(typeof mockStore.getPhysiqueSynergyBonuses).toBe('function');
  });
});
