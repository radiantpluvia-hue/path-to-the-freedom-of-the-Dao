// Test file for Xianxia Naming System implementation
import { ALL_BLOODLINES } from '../data/bloodlines_fixed';
import { PHYSIQUES as ALL_PHYSIQUES } from '../data/physiques';
import { ALL_MANUALS } from '../data/manuals';
import { getRealmMultiplier, scaleBloodlineStats, scalePhysiqueStats, scaleCultivationSpeed, scaleManualEffects } from '../data/scalingSystem';
import { calculateIntegratedStats, getRecommendedCombinations, canAwakenBloodline } from '../systems/characterAdvancement';

describe('Xianxia Naming System Implementation', () => {
  test('Bloodlines are properly created', () => {
    expect(ALL_BLOODLINES.length).toBeGreaterThan(100); // Should have 100+ bloodlines
    expect(ALL_BLOODLINES[0].id).toBeDefined();
    expect(ALL_BLOODLINES[0].name).toBeDefined();
    expect(ALL_BLOODLINES[0].description).toBeDefined();
    expect(ALL_BLOODLINES[0].rarity).toBeDefined();
  });

  test('Physiques are properly created', () => {
    expect(ALL_PHYSIQUES.length).toBeGreaterThan(100); // Should have 100+ physiques
    expect(ALL_PHYSIQUES[0].id).toBeDefined();
    expect(ALL_PHYSIQUES[0].name).toBeDefined();
    expect(ALL_PHYSIQUES[0].description).toBeDefined();
    expect(ALL_PHYSIQUES[0].rarity).toBeDefined();
  });

  test('Manuals are properly created', () => {
    expect(ALL_MANUALS.length).toBeGreaterThan(50); // Should have 50+ manuals
    expect(ALL_MANUALS[0].id).toBeDefined();
    expect(ALL_MANUALS[0].name).toBeDefined();
    expect(ALL_MANUALS[0].description).toBeDefined();
    expect(ALL_MANUALS[0].rank).toBeDefined();
  });

  test('Scaling system works correctly', () => {
    const mortalMultiplier = getRealmMultiplier('mortal');
    const goldenImmortalMultiplier = getRealmMultiplier('golden_immortal');
    const soulTransformationMultiplier = getRealmMultiplier('soul_transformation');
    
    expect(mortalMultiplier).toBeCloseTo(1.0);
    expect(goldenImmortalMultiplier).toBeGreaterThan(mortalMultiplier);
    expect(soulTransformationMultiplier).toBeGreaterThan(goldenImmortalMultiplier);
  });

  test('Bloodline stats scale with realm', () => {
    const bloodline = ALL_BLOODLINES.find(b => b.rarity === "F" && b.effects.stats?.qi);
    if (!bloodline) return;
    
    // Extract base stat values from StatEffect objects
    const bloodlineBaseStats: Record<string, number> = {};
    Object.entries(bloodline.effects.stats || {}).forEach(([key, statEffect]: [string, any]) => {
      bloodlineBaseStats[key] = typeof statEffect === 'object' && statEffect.base !== undefined ? statEffect.base : statEffect;
    });
    const mortalStats = scaleBloodlineStats(bloodlineBaseStats, 'mortal');
    const goldenStats = scaleBloodlineStats(bloodlineBaseStats, 'golden_immortal');
    
    expect(goldenStats.qi).toBeGreaterThan(mortalStats.qi || 0);
    if (goldenStats.atk && mortalStats.atk) expect(goldenStats.atk).toBeGreaterThan(mortalStats.atk);
    if (goldenStats.def && mortalStats.def) expect(goldenStats.def).toBeGreaterThan(mortalStats.def);
  });

  test('Physique stats scale with realm', () => {
    const physique = ALL_PHYSIQUES.find(p => p.rarity === "F" && p.effects.stats?.qi);
    if (!physique) return;
    
    // Extract base stat values from StatEffect objects
    const physiqueBaseStats: Record<string, number> = {};
    Object.entries(physique.effects.stats || {}).forEach(([key, statEffect]: [string, any]) => {
      physiqueBaseStats[key] = typeof statEffect === 'object' && statEffect.base !== undefined ? statEffect.base : statEffect;
    });
    const mortalStats = scalePhysiqueStats(physiqueBaseStats, 'mortal');
    const goldenStats = scalePhysiqueStats(physiqueBaseStats, 'golden_immortal');
    
    expect(goldenStats.qi).toBeGreaterThan(mortalStats.qi || 0);
    if (goldenStats.atk && mortalStats.atk) expect(goldenStats.atk).toBeGreaterThan(mortalStats.atk);
    if (goldenStats.def && mortalStats.def) expect(goldenStats.def).toBeGreaterThan(mortalStats.def);
  });

  test('Cultivation speed scales with realm', () => {
    const physique = ALL_PHYSIQUES.find(p => p.effects.cultivation_speed);
    if (!physique || !physique.effects.cultivation_speed) return;
    
    const effect = physique.effects.cultivation_speed;
    const baseSpeed = typeof effect === 'number' ? effect : (effect && effect.base) || 1.0;

    const mortalSpeed = scaleCultivationSpeed(baseSpeed, 'mortal');
    const goldenSpeed = scaleCultivationSpeed(baseSpeed, 'golden_immortal');
    
    expect(goldenSpeed).toBeGreaterThan(mortalSpeed);
  });

  test('Manual effects scale with realm', () => {
    const manual = ALL_MANUALS.find(m => m.rank === "F" && (m.effects.cultivationSpeed || m.effects.cultivation_speed));
    if (!manual) return;
    
    const mortalEffects = scaleManualEffects(manual.effects, 'mortal');
    const goldenEffects = scaleManualEffects(manual.effects, 'golden_immortal');
    
    const mortalSpeed = mortalEffects.cultivationSpeed ?? mortalEffects.cultivation_speed;
    const goldenSpeed = goldenEffects.cultivationSpeed ?? goldenEffects.cultivation_speed;

    if (typeof mortalSpeed === 'number' && typeof goldenSpeed === 'number') {
      expect(goldenSpeed).toBeGreaterThan(mortalSpeed);
    }
  });

  test('Integrated stats calculation works', () => {
    const bloodline = ALL_BLOODLINES.find(b => b.rarity === "H");
    const physique = ALL_PHYSIQUES.find(p => p.rarity === "H");
    const manual = ALL_MANUALS.find(m => m.rank === "H");
    
  if (!bloodline || !physique || !manual) return;
    
    const stats = calculateIntegratedStats(
      bloodline.id,
      physique.id,
      [manual.id],
      'mortal'
    );
    
    expect(stats.baseStats.qi).toBeGreaterThan(100); // Should be more than base
    expect(stats.baseStats.atk).toBeGreaterThan(10);
    expect(stats.baseStats.def).toBeGreaterThan(10);
    expect(stats.cultivationSpeed).toBeGreaterThan(1.0);
    expect(stats.specialAbilities.length).toBeGreaterThan(0);
  });

  test('Recommended combinations are generated', () => {
    const recommendations = getRecommendedCombinations();
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].synergy).toBeGreaterThan(0);
    expect(recommendations[0].description).toBeDefined();
  });

  test('Bloodline awakening check works', () => {
    const legendaryBloodline = ALL_BLOODLINES.find(b => b.rarity === "D");
    if (!legendaryBloodline) return;
    
    const canAwakenMortal = canAwakenBloodline(legendaryBloodline.id, 'mortal', 10000);
    const canAwakenSoulTransformation = canAwakenBloodline(legendaryBloodline.id, 'soul_transformation', 25000);
    
    expect(canAwakenMortal).toBe(false); // Should not be able to awaken legendary in mortal realm
    expect(canAwakenSoulTransformation).toBe(true); // Should be able to awaken in soul transformation
  });

  test('Rarity distribution is correct', () => {
    const bloodlineRarities = ALL_BLOODLINES.map(b => b.rarity);
    const commonBloodlines = bloodlineRarities.filter(r => r === "H").length;
    const legendaryBloodlines = bloodlineRarities.filter(r => r === "D").length;
    const transcendentBloodlines = bloodlineRarities.filter(r => r === "B").length;
    
    // Should have more common than legendary, and more legendary than transcendent
    expect(commonBloodlines).toBeGreaterThan(legendaryBloodlines);
    expect(legendaryBloodlines).toBeGreaterThan(transcendentBloodlines);
  });

  test('All IDs are unique', () => {
    const bloodlineIds = ALL_BLOODLINES.map(b => b.id);
    const physiqueIds = ALL_PHYSIQUES.map(p => p.id);
    const manualIds = ALL_MANUALS.map(m => m.id);
    
  expect(new Set(bloodlineIds).size).toBe(bloodlineIds.length);
    expect(new Set(physiqueIds).size).toBe(physiqueIds.length);
    expect(new Set(manualIds).size).toBe(manualIds.length);
  });

  test('Special effects are properly assigned', () => {
    const dragonBloodline = ALL_BLOODLINES.find(b => b.name.toLowerCase().includes('dragon'));
    if (!dragonBloodline) return;
    
  expect(dragonBloodline.effects.special).toBeDefined();
    expect(dragonBloodline.effects.special?.length).toBeGreaterThan(0);
    // Check for dragon-related effects (draconic, dragon, etc.)
    expect(dragonBloodline.effects.special?.some(effect => 
      effect.includes('dragon') || effect.includes('draconic')
    )).toBe(true);
  });
});

// Run the tests
console.log('Running Xianxia Naming System tests...');
