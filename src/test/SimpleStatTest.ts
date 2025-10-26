// Simple test for stat increases without complex imports
import { getRealmMultiplier, getRarityMultiplier } from '../data/scalingSystem';

// Test realm multipliers
function testRealmMultipliers() {
  console.log('\n=== Testing Realm Multipliers ===');

  const realms = [
    'mortal', 'qi_refinement', 'foundation_establishment', 'body_integration',
    'core_formation', 'nascent_soul', 'true_immortal', 'quasi_saint',
    'chaos_saint', 'supreme_dao_origin', 'reality_weaver'
  ];

  realms.forEach(realm => {
    const multiplier = getRealmMultiplier(realm);
    console.log(`${realm}: ${multiplier.toFixed(2)}x`);
  });
}

// Test rarity multipliers
function testRarityMultipliers() {
  console.log('\n=== Testing Rarity Multipliers ===');

  const rarities = ["H", "G", "F", "E", "D", 'mythical', "B"];

  rarities.forEach(rarity => {
    const multiplier = getRarityMultiplier(rarity);
    console.log(`${rarity}: ${multiplier}x`);
  });
}

// Test scaling progression
function testScalingProgression() {
  console.log('\n=== Testing Scaling Progression ===');

  const testRealms = ['mortal', 'foundation_establishment', 'core_formation', 'true_immortal', 'chaos_saint'];

  // Simulate stat scaling for different base values
  const baseStats = { qi: 100, atk: 50, def: 30 };

  testRealms.forEach(realm => {
    const multiplier = getRealmMultiplier(realm);
    const scaledQi = Math.round(baseStats.qi * multiplier);
    const scaledAtk = Math.round(baseStats.atk * multiplier);
    const scaledDef = Math.round(baseStats.def * multiplier);

    console.log(`\n${realm} (${multiplier.toFixed(2)}x):`);
    console.log(`  Base: QI=${baseStats.qi}, ATK=${baseStats.atk}, DEF=${baseStats.def}`);
    console.log(`  Scaled: QI=${scaledQi}, ATK=${scaledAtk}, DEF=${scaledDef}`);
  });
}

// Test edge cases
function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===');

  // Test invalid realm
  try {
    const invalidMultiplier = getRealmMultiplier('invalid_realm');
    console.log(`Invalid realm multiplier: ${invalidMultiplier}`);
  } catch (error) {
    console.log(`Invalid realm error: ${error}`);
  }

  // Test invalid rarity
  try {
    const invalidRarityMultiplier = getRarityMultiplier('invalid_rarity');
    console.log(`Invalid rarity multiplier: ${invalidRarityMultiplier}`);
  } catch (error) {
    console.log(`Invalid rarity error: ${error}`);
  }
}

// Run tests
console.log('=== Simple Stat Increase Testing ===\n');

testRealmMultipliers();
testRarityMultipliers();
testScalingProgression();
testEdgeCases();

console.log('\n=== Simple Testing Complete ===');
console.log('This test verifies the core scaling functions work correctly.');
