import { computePowerScore, computeProvidenceScore, computeKarmaScore, computeComposite, makeEntryFromEntity } from '../src/utils/scoring';

describe('Heavenly scoring functions', () => {
  test('computePowerScore handles zero and compresses large numbers', () => {
    const small = computePowerScore({id:'a', name:'a', type:'npc', realm:'immortal_early', combatPowerRaw: 0} as any);
    expect(small).toBe(0);

    const large = computePowerScore({id:'b', name:'b', type:'npc', realm:'immortal_late', combatPowerRaw: 1e12} as any);
    // large should be > 0 and finite
    expect(large).toBeGreaterThan(0);
    expect(Number.isFinite(large)).toBeTruthy();
  });

  test('providence & karma basic behavior', () => {
    const p = computeProvidenceScore({id:'x', name:'x', type:'npc', realm:'immortal', combatPowerRaw:0, providence: 1e6} as any);
    expect(p).toBeGreaterThan(0);
    const k = computeKarmaScore({id:'y', name:'y', type:'npc', realm:'immortal', combatPowerRaw:0, karmicMerit:100, karmicDebt:10} as any);
    expect(k).toBeGreaterThan(0);
  });

  test('makeEntryFromEntity returns composite and fields', () => {
    const e = makeEntryFromEntity({id:'tt', name:'tt', type:'player', realm:'immortal', combatPowerRaw:1000, providence: 50, karmicMerit:30} as any);
    expect(e.compositeScore).toBeGreaterThanOrEqual(e.powerScore * 0.5); // quick sanity
    expect(e.name).toBe('tt');
  });
});
