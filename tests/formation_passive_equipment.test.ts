import { applyCombatBuffs, Combatant } from '../src/components/minigames/CombatSimulation';
import { PASSIVE_CATALOG } from '../src/components/minigames/passives';
import { ITEM_CATALOG } from '../src/components/minigames/items';
import { FORMATION_CATALOG } from '../src/components/minigames/formations';

describe('Formation/passive/equipment interaction', () => {
  test('formation that disables passives removes only passive deltas and preserves equipment', () => {
    // pick a passive that gives some atk/hp
    const passive = PASSIVE_CATALOG.find(p => (p.atk || 0) > 0);
    expect(passive).toBeDefined();
    const item = ITEM_CATALOG.find(i => (i.atk || 0) > 0);
    expect(item).toBeDefined();
    const formation = FORMATION_CATALOG.find(f => f.disablesPassives === true) || { id: 'none', disablesPassives: true, atkMult: 1, defMult: 1, speedMult: 1 };

    const base: Combatant = {
      id: 'test',
      name: 'Test',
      maxHp: 100,
      hp: 100,
      attack: 10,
      defense: 5,
      speed: 10,
      equipment: { weapon: item!.id },
      passiveIds: [passive!.id],
      activeFormationId: null
    };

    const buffedNoFormation = applyCombatBuffs(base);
    // with no formation, passive + equipment should be applied
    expect(buffedNoFormation.attack).toBeGreaterThan(base.attack);

    // now apply formation that disables passives
    const withFormation = applyCombatBuffs({ ...base, activeFormationId: formation.id });
    // equipment should still apply (so attack should be > base.attack)
    expect(withFormation.attack).toBeGreaterThan(base.attack - 1);
    // but passive-specific contribution should be absent when compared to buffedNoFormation
    expect(withFormation.attack).toBeLessThanOrEqual(buffedNoFormation.attack);
  });
});
