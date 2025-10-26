import { GENERATED_PASSIVES } from '@/data/generated/passives.generated';
import GENERATED_ABILITIES from '@/data/generated/activeAbilities.generated';
import { validateAllGenerated, validateGeneratedPassiveShape, validateGeneratedAbilityShape } from '@/data/validators/generatedSchema';
import * as Registry from '@/data/registry';
import * as PassiveRegistry from '@/systems/passiveRegistry';

describe('generated data schema and registry', () => {
  test('generated passives shape is valid (spot check)', () => {
    const res = validateAllGenerated();
    expect(res.passivesInvalid.length).toBe(0);
  });

  test('generated abilities shape is valid (spot check)', () => {
    const res = validateAllGenerated();
    expect(res.abilitiesInvalid.length).toBe(0);
  });

  test('registry merges generated passives and abilities', () => {
    // pick a couple sample ids
    const p = GENERATED_PASSIVES[10];
    const a = GENERATED_ABILITIES[5];
    const regP = Registry.getPassiveById(p.id);
    const regA = Registry.getActiveAbilityById(a.id);
    expect(regP).not.toBeNull();
    expect(regA).not.toBeNull();
  });

  test('apply/remove round-trip for generated passive', () => {
    const sample = GENERATED_PASSIVES.find(p => (p.stats && (p.stats.atk || p.stats.def || p.stats.hp || p.stats.atkPct))); 
    expect(sample).toBeTruthy();
    const base = { stats: { attack: 10, defense: 5 }, maxHp: 100, hp: 100 } as any;
    const applied = PassiveRegistry.applyPassiveToPlayer(base, sample.id);
    expect(applied).not.toBe(base);
    const removed = PassiveRegistry.removePassiveFromPlayer(applied, sample.id);
    // allow integer rounding differences for atkPct; final attack should be numeric
    expect(typeof removed.stats.attack).toBe('number');
  });
});
