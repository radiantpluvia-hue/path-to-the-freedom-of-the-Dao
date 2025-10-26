import { computeCombatPower, calculateDamage, computeOffensiveProwess, adjustDamageForRealmGap } from '../systems/combatConfig';
import { Combatant, Action } from '../systems/combatConfig';

/* eslint @typescript-eslint/no-non-null-assertion: "off" */
describe('combatConfig', () => {
  describe('computeCombatPower', () => {
    it('should compute combat power correctly', () => {
      const entity = { stats: { hp: 100, atk: 50, def: 30, qi: 20, speed: 10, daoHeart: 0 } };
      const cp = computeCombatPower(entity);
      expect(cp).toBe(49);
    });

    it('should include karma in combat power calculation', () => {
      const entity = { stats: { hp: 100, atk: 50, def: 30, qi: 20, speed: 10, daoHeart: 0 }, karma: 10 };
      const cp = computeCombatPower(entity, { includeKarma: true });
      expect(cp).toBe(50);
    });
  });

  describe('calculateDamage', () => {
    it('should calculate damage correctly', () => {
      const attacker: Combatant = { id: 'a', name: 'A', maxHp: 100, hp: 100, attack: 50, defense: 20, speed: 10 };
      const defender: Combatant = { id: 'b', name: 'B', maxHp: 100, hp: 100, attack: 30, defense: 30, speed: 5 };
      const damage = calculateDamage(attacker, defender, 'attack');
      expect(damage).toBe(20);
    });

    it('should consider defending state', () => {
      const attacker: Combatant = { id: 'a', name: 'A', maxHp: 100, hp: 100, attack: 50, defense: 20, speed: 10 };
      const defender: Combatant = { id: 'b', name: 'B', maxHp: 100, hp: 100, attack: 30, defense: 30, speed: 5, isDefending: true };
      const damage = calculateDamage(attacker, defender, 'attack');
      expect(damage).toBe(5);
    });
  });

  describe('computeOffensiveProwess', () => {
    it('should compute offensive prowess correctly', () => {
      const entity = { stats: { atk: 50, speed: 10 } };
      const prowess = computeOffensiveProwess(entity);
      expect(prowess).toBe(55);
    });
  });

  describe('adjustDamageForRealmGap', () => {
    it('should adjust damage for realm gap', () => {
      const options = {
        attackerStage: 1,
        targetStage: 4,
        damage: 100,
        targetMaxHp: 1000,
      };
      const damage = adjustDamageForRealmGap(options);
      expect(damage).toBeLessThan(100);
    });
  });
});
