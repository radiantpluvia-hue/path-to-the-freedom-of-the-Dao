import { ALL_BLOODLINES } from '../data/bloodlines_fixed';
import { PHYSIQUES, ALL_PHYSIQUES } from '../data/physiques';
import { MANUALS, ALL_MANUALS } from '../data/manuals';
import { getRealmMultiplier, scaleBloodlineStats, scalePhysiqueStats, scaleManualEffects, getRarityMultiplier } from '../data/scalingSystem';
import { CULTIVATION_REALMS } from '../data/cultivationRealms';

// Test bloodline stat increases
function testBloodlineStatIncreases() {
  console.log('\n=== Testing Bloodline Stat Increases ===');

  const testRealms = ['mortal', 'foundation_establishment', 'core_formation', 'true_immortal', 'chaos_saint'];

  // Test a few representative bloodlines from different rarities
  const testBloodlines = [
  ALL_BLOODLINES.find(b => b.rarity === 'common'),
  ALL_BLOODLINES.find(b => b.rarity === 'rare'),
  ALL_BLOODLINES.find(b => b.rarity === 'legendary'),
  ALL_BLOODLINES.find(b => b.rarity === 'mythical'),
  ALL_BLOODLINES.find(b => b.rarity === 'transcendent')
  ].filter(Boolean);

  testBloodlines.forEach(bloodline => {
    if (!bloodline || !bloodline.effects.stats) return;

    console.log(`\nTesting ${bloodline.name} (${bloodline.rarity}):`);
    console.log(`  Base Stats: ${JSON.stringify(bloodline.effects.stats)}`);
    console.log(`  Base Skills: ${JSON.stringify(bloodline.effects.skills)}`);

    testRealms.forEach(realm => {
      const scaledStats = scaleBloodlineStats(bloodline.effects.stats as Record<string, number>, realm);
      const multiplier = getRealmMultiplier(realm);

      console.log(`  ${realm}:`);
      console.log(`    Multiplier: ${multiplier.toFixed(2)}x`);
      console.log(`    Scaled Stats: ${JSON.stringify(scaledStats)}`);

      // Verify scaling is applied correctly
      const expectedQi = Math.round((bloodline.effects.stats as Record<string, number>).qi * multiplier);
      if (scaledStats.qi !== expectedQi) {
        console.log(`    ❌ QI scaling incorrect: expected ${expectedQi}, got ${scaledStats.qi}`);
      } else {
        console.log(`    ✅ QI scaling correct`);
      }
    });
  });
}

// Test physique stat increases
function testPhysiqueStatIncreases() {
  console.log('\n=== Testing Physique Stat Increases ===');

  const testRealms = ['mortal', 'foundation_establishment', 'core_formation', 'true_immortal', 'chaos_saint'];

  // Test a few representative physiques from different rarities
  const testPhysiques = [
    PHYSIQUES.find(p => p.rarity === 'common'),
    PHYSIQUES.find(p => p.rarity === 'rare'),
    PHYSIQUES.find(p => p.rarity === 'legendary'),
    PHYSIQUES.find(p => p.rarity === 'mythical'),
    PHYSIQUES.find(p => p.rarity === 'transcendent')
  ].filter(Boolean);

  testPhysiques.forEach(physique => {
    if (!physique || !physique.effects.stats || !physique.effects.cultivation_speed) return;

    console.log(`\nTesting ${physique.name} (${physique.rarity}):`);
    console.log(`  Base Stats: ${JSON.stringify(physique.effects.stats)}`);
    console.log(`  Base Cultivation Speed: ${physique.effects.cultivation_speed}`);

    testRealms.forEach(realm => {
      const scaledStats = scalePhysiqueStats(physique.effects.stats as Record<string, number>, realm);
      const scaledSpeed = (physique.effects.cultivation_speed as number) * getRealmMultiplier(realm);
      const multiplier = getRealmMultiplier(realm);

      console.log(`  ${realm}:`);
      console.log(`    Multiplier: ${multiplier.toFixed(2)}x`);
      console.log(`    Scaled Stats: ${JSON.stringify(scaledStats)}`);
      console.log(`    Scaled Cultivation Speed: ${scaledSpeed.toFixed(2)}`);

      // Verify scaling is applied correctly
      const expectedQi = Math.round((physique.effects.stats as Record<string, number>).qi * multiplier);
      if (scaledStats.qi !== expectedQi) {
        console.log(`    ❌ QI scaling incorrect: expected ${expectedQi}, got ${scaledStats.qi}`);
      } else {
        console.log(`    ✅ QI scaling correct`);
      }
    });
  });
}

// Test manual effect increases
function testManualEffectIncreases() {
  console.log('\n=== Testing Manual Effect Increases ===');

  const testRealms = ['mortal', 'foundation_establishment', 'core_formation', 'true_immortal', 'chaos_saint'];

  // Test a few representative manuals from different rarities
  const testManuals = [
    MANUALS.find(m => m.rank === 'common'),
    MANUALS.find(m => m.rank === 'rare'),
    MANUALS.find(m => m.rank === 'legendary'),
    MANUALS.find(m => m.rank === 'mythical'),
    MANUALS.find(m => m.rank === 'transcendent')
  ].filter(Boolean);

  testManuals.forEach(manual => {
    if (!manual) return;

    console.log(`\nTesting ${manual.name} (${manual.rank}):`);
    console.log(`  Base Effects: ${JSON.stringify(manual.effects)}`);

    testRealms.forEach(realm => {
      const scaledEffects = scaleManualEffects(manual.effects, realm);
      const multiplier = getRealmMultiplier(realm);

      console.log(`  ${realm}:`);
      console.log(`    Multiplier: ${multiplier.toFixed(2)}x`);
      console.log(`    Scaled Effects: ${JSON.stringify(scaledEffects)}`);

      // Verify scaling is applied correctly for numeric effects
      const numericEffects = ['cultivationSpeed', 'qiGathering', 'bodyTempering', 'hp', 'mentalFortitude', 'daoHeart', 'combatSkills', 'atk'];
      let allCorrect = true;

      numericEffects.forEach(effect => {
        if (typeof manual.effects[effect] === 'number') {
          const expected = manual.effects[effect] * multiplier;
          const actual = scaledEffects[effect];
          if (Math.abs(actual - expected) > 0.01) {
            console.log(`    ❌ ${effect} scaling incorrect: expected ${expected}, got ${actual}`);
            allCorrect = false;
          }
        }
      });

      if (allCorrect) {
        console.log(`    ✅ All numeric effects scaling correct`);
      }
    });
  });
}

// Test rarity multipliers
function testRarityMultipliers() {
  console.log('\n=== Testing Rarity Multipliers ===');

  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical', 'transcendent'];

  rarities.forEach(rarity => {
    const multiplier = getRarityMultiplier(rarity);
    console.log(`${rarity}: ${multiplier}x`);

    // Verify multipliers are reasonable
    if (multiplier < 1.0) {
      console.log(`  ❌ ${rarity} multiplier too low: ${multiplier}`);
    } else if (rarity === 'transcendent' && multiplier < 5.0) {
      console.log(`  ❌ ${rarity} multiplier too low for transcendent rarity: ${multiplier}`);
    } else {
      console.log(`  ✅ ${rarity} multiplier reasonable`);
    }
  });
}

// Test realm scaling progression
function testRealmScalingProgression() {
  console.log('\n=== Testing Realm Scaling Progression ===');

  const testRealms = [
    'mortal', 'qi_refinement', 'foundation_establishment', 'body_integration',
    'core_formation', 'nascent_soul', 'true_immortal', 'quasi_saint',
    'chaos_saint', 'supreme_dao_origin', 'reality_weaver'
  ];

  let previousMultiplier = 0;
  testRealms.forEach(realm => {
    const multiplier = getRealmMultiplier(realm);
    console.log(`${realm}: ${multiplier.toFixed(2)}x`);

    // Check for exponential growth
    if (multiplier < previousMultiplier) {
      console.log(`  ❌ Multiplier decreased from previous realm`);
    } else if (multiplier > previousMultiplier * 2 && previousMultiplier > 0) {
      console.log(`  ⚠️  Large multiplier jump - may cause balance issues`);
    }

    previousMultiplier = multiplier;
  });
}

// Test stat balance across rarities
function testStatBalanceAcrossRarities() {
  console.log('\n=== Testing Stat Balance Across Rarities ===');

  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical', 'transcendent'];

  // Test bloodline balance
  console.log('\nBloodline Balance:');
  rarities.forEach(rarity => {
  const bloodlines = ALL_BLOODLINES.filter(b => b.rarity === rarity && b.effects.stats);
    if (bloodlines.length > 0) {
      const avgQi = bloodlines.reduce((sum, b) => sum + (b.effects.stats as Record<string, number>).qi, 0) / bloodlines.length;
      const avgAtk = bloodlines.reduce((sum, b) => sum + (b.effects.stats as Record<string, number>).atk, 0) / bloodlines.length;
      console.log(`  ${rarity}: Avg QI=${Math.round(avgQi)}, Avg ATK=${Math.round(avgAtk)}`);
    }
  });

  // Test physique balance
  console.log('\nPhysique Balance:');
  rarities.forEach(rarity => {
    const physiques = PHYSIQUES.filter(p => p.rarity === rarity && p.effects.stats && p.effects.cultivation_speed);
    if (physiques.length > 0) {
      const avgQi = physiques.reduce((sum, p) => sum + (p.effects.stats as Record<string, number>).qi, 0) / physiques.length;
      const avgSpeed = physiques.reduce((sum, p) => sum + (p.effects.cultivation_speed as number), 0) / physiques.length;
      console.log(`  ${rarity}: Avg QI=${Math.round(avgQi)}, Avg Cultivation Speed=${avgSpeed.toFixed(2)}`);
    }
  });

  // Test manual balance
  console.log('\nManual Balance:');
  rarities.forEach(rarity => {
    const manuals = MANUALS.filter(m => m.rank === rarity);
    if (manuals.length > 0) {
      const avgCultivationSpeed = manuals.reduce((sum, m) => sum + (m.effects.cultivationSpeed || 0), 0) / manuals.length;
      const avgCombatSkills = manuals.reduce((sum, m) => sum + (m.effects.combatSkills || 0), 0) / manuals.length;
      console.log(`  ${rarity}: Avg Cultivation Speed=${avgCultivationSpeed.toFixed(2)}, Avg Combat Skills=${Math.round(avgCombatSkills)}`);
    }
  });
}

// Test edge cases
function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===');

  // Test with invalid realm
  try {
    const invalidMultiplier = getRealmMultiplier('invalid_realm');
    console.log(`Invalid realm multiplier: ${invalidMultiplier}`);
    if (invalidMultiplier !== 1.0) {
      console.log(`  ❌ Invalid realm should return 1.0, got ${invalidMultiplier}`);
    } else {
      console.log(`  ✅ Invalid realm handled correctly`);
    }
  } catch (error) {
    console.log(`  ❌ Invalid realm caused error: ${error}`);
  }

  // Test with invalid rarity
  try {
    const invalidRarityMultiplier = getRarityMultiplier('invalid_rarity');
    console.log(`Invalid rarity multiplier: ${invalidRarityMultiplier}`);
    if (invalidRarityMultiplier !== 1.0) {
      console.log(`  ❌ Invalid rarity should return 1.0, got ${invalidRarityMultiplier}`);
    } else {
      console.log(`  ✅ Invalid rarity handled correctly`);
    }
  } catch (error) {
    console.log(`  ❌ Invalid rarity caused error: ${error}`);
  }

  // Test scaling with zero base stats
  const zeroStats = { qi: 0, atk: 0, def: 0 };
  const scaledZeroStats = scaleBloodlineStats(zeroStats, 'core_formation');
  console.log(`Zero stats scaling: ${JSON.stringify(scaledZeroStats)}`);
  if (scaledZeroStats.qi !== 0 || scaledZeroStats.atk !== 0) {
    console.log(`  ❌ Zero stats should remain zero, got ${JSON.stringify(scaledZeroStats)}`);
  } else {
    console.log(`  ✅ Zero stats handled correctly`);
  }
}

// Run all stat increase tests
console.log('=== Comprehensive Stat Increase Testing ===\n');

testBloodlineStatIncreases();
testPhysiqueStatIncreases();
testManualEffectIncreases();
testRarityMultipliers();
testRealmScalingProgression();
testStatBalanceAcrossRarities();
testEdgeCases();

console.log('\n=== Stat Increase Testing Complete ===');
console.log('Review the test results above for any issues with stat increases.');
console.log('Key areas to verify:');
console.log('- Stat scaling should be consistent across all rarities and realms');
console.log('- Multipliers should provide meaningful progression without overwhelming power spikes');
console.log('- Balance should be maintained across different stat categories');
console.log('- Edge cases should be handled gracefully');
console.log('- No regressions in existing functionality');
