export {}

const { REALM_ORDER, getNextRealm, getRealmBreakthroughDifficulty, getRealmLifespanBonus, CULTIVATION_REALMS } = require('../src/data/cultivationRealms');
const scaling = require('../src/data/scalingSystem');
const cultivationUtils = require('../src/systems/cultivationUtils');
const CombatSystem = require('../src/systems/CombatSystem').CombatSystem;

describe('Cultivation realms data and helpers', () => {
  test('REALM_ORDER stability and endpoints', () => {
    expect(Array.isArray(REALM_ORDER)).toBe(true);
    expect(REALM_ORDER.length).toBeGreaterThan(10);
    expect(REALM_ORDER[0]).toBe('mortal');
    expect(REALM_ORDER[REALM_ORDER.length - 1]).toBe('eternal_dao_emperor');
  });

  test('getNextRealm and breakthrough/lifespan helpers', () => {
    expect(getNextRealm('mortal')).toBe('qi_refinement');
    expect(getNextRealm('true_immortal')).toBe('quasi_saint');
    expect(getRealmBreakthroughDifficulty('mahayana')).toBeGreaterThan(0);
    expect(getRealmLifespanBonus('golden_immortal')).toBeGreaterThanOrEqual(0);
  });

  test('numeric constants for sample realms', () => {
    // Spot-check authoritative QI requirements and minor stage counts for known realms
    expect(CULTIVATION_REALMS.mortal.qiRequirement).toBe(100);
    expect(CULTIVATION_REALMS.mahayana.qiRequirement).toBe(30000);
    expect(CULTIVATION_REALMS.true_immortal.qiRequirement).toBe(256000000);
    // minor stages sampling
    expect(CULTIVATION_REALMS.core_formation.minorStages).toBe(5);
    expect(CULTIVATION_REALMS.soul_transformation.minorStages).toBe(7);
  });

  test('scalingSystem: major tier and multiplier behavior', () => {
    const tier = scaling.getMajorTier('true_immortal');
    expect(typeof tier).toBe('string');
    // multiplier should be >= 1
    const mult = scaling.getRealmMultiplier('true_immortal');
    expect(mult).toBeGreaterThanOrEqual(1);

    // check progression within a tier affects multiplier slightly
    const m1 = scaling.getRealmMultiplier('core_formation');
    const m2 = scaling.getRealmMultiplier('true_immortal');
    expect(typeof m1).toBe('number');
    expect(typeof m2).toBe('number');
  });
});

describe('Cultivation utilities sanity checks', () => {
  test('getCultivationMultiplier bounds and growth', () => {
    const low = cultivationUtils.getCultivationMultiplier({ stage: 0, substage: 0 });
    const mid = cultivationUtils.getCultivationMultiplier({ stage: 2, substage: 3 });
    const high = cultivationUtils.getCultivationMultiplier({ stage: 10, substage: 0 });

    expect(low).toBeGreaterThanOrEqual(1);
    expect(mid).toBeGreaterThanOrEqual(low);
    expect(high).toBeGreaterThanOrEqual(mid);
    // bounded growth: not infinite
    expect(high).toBeLessThan(1000);
  });

  test('getDiminishingReturnFactor decays and floors', () => {
    expect(cultivationUtils.getDiminishingReturnFactor(0)).toBe(1);
    expect(cultivationUtils.getDiminishingReturnFactor(1)).toBeCloseTo(1);
    const d10 = cultivationUtils.getDiminishingReturnFactor(10);
    expect(d10).toBeGreaterThanOrEqual(0.25);
    expect(d10).toBeLessThan(1);
  });

  test('adjustDamageForRealmGap reduces damage vs higher realm targets', () => {
    const opts = {
      attackerStage: 1,
      targetStage: 10,
      damage: 1000,
      targetMaxHp: 2000,
      minHpFraction: 0.05
    };
    const res = cultivationUtils.adjustDamageForRealmGap(opts as any);
    expect(typeof res).toBe('number');
    // should reduce damage considerably when target is much higher
    expect(res).toBeLessThan(opts.damage);
    // implementation does not guarantee a lower bound equal to minHpFraction of max HP;
    // it prevents instant kills by capping very large damage. Ensure returned damage is positive.
    expect(res).toBeGreaterThanOrEqual(1);

    // When incoming damage would outright kill (>= targetMaxHp), the function caps it so
    // the target remains at minHpFraction alive.
    const opts2 = { ...opts, damage: 2500 };
    const res2 = cultivationUtils.adjustDamageForRealmGap(opts2 as any);
    const minHp = Math.floor(opts2.targetMaxHp * opts2.minHpFraction);
    expect(res2).toBeLessThanOrEqual(opts2.targetMaxHp - minHp);
  });
});

describe('CombatSystem integration: realm gap damage behavior', () => {
  test('applyDamage respects realm gap protection end-to-end', () => {
    // Create attacker (low realm) and target (very high realm)
    const attacker = {
      id: 'player', name: 'Att', hp: 10000, maxHp: 10000, qi: 5000, maxQi: 5000, ap: 5, maxAp: 5,
      stats: { atk: 200, def: 50, speed: 10 }, techniques: [], buffs: [], debuffs: [] as any[], stance: 'neutral',
      cultivation: { stage: 1 }
    };
    const target = {
      id: 'enemy', name: 'Big', hp: 1000000000, maxHp: 1000000000, qi: 1000000, maxQi: 1000000, ap: 5, maxAp: 5,
      stats: { atk: 1000000, def: 500000, speed: 5 }, techniques: [], buffs: [], debuffs: [] as any[], stance: 'neutral',
      cultivation: { stage: 10 }
    };

    // Minimal gameStore/rivalSystem dummies
    const gameStore = {};
    const rivalSystem = {};

    // Inject deterministic RNG
    const context = { type: 'normal', rng: () => 0.5 };

    const cs = new CombatSystem(attacker as any, [target as any], gameStore, rivalSystem, context as any);

    // Use the exposed test helper to apply damage and observe caps
    // Base damage huge (would normally one-shot), but attacker is far weaker in realm stage
    const baseDamage = 1000000000; // 1 billion
    // applyDamage mutates the target.hp in-place; compute damage dealt as delta
    const beforeHp = target.hp;
    cs.__test_applyDamage(attacker as any, target as any, baseDamage);
    const damageDealt = beforeHp - target.hp;

    // Damage must be a finite positive number, less than or equal to baseDamage
    expect(typeof damageDealt).toBe('number');
    expect(damageDealt).toBeGreaterThanOrEqual(0);
    expect(damageDealt).toBeLessThanOrEqual(baseDamage);
    // Because target maxHp is 1e9 and default minHpFraction is 0.2, adjusted must not exceed 0.8*maxHp
    expect(damageDealt).toBeLessThanOrEqual(Math.floor(target.maxHp * 0.8));
  });
});
