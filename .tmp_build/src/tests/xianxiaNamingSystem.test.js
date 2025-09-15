"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test file for Xianxia Naming System implementation
const bloodlines_fixed_1 = require("../data/bloodlines_fixed");
const physiques_1 = require("../data/physiques");
const manuals_1 = require("../data/manuals");
const scalingSystem_1 = require("../data/scalingSystem");
const characterAdvancement_1 = require("../systems/characterAdvancement");
describe('Xianxia Naming System Implementation', () => {
    test('Bloodlines are properly created', () => {
        expect(bloodlines_fixed_1.ALL_BLOODLINES.length).toBeGreaterThan(100); // Should have 100+ bloodlines
        expect(bloodlines_fixed_1.ALL_BLOODLINES[0].id).toBeDefined();
        expect(bloodlines_fixed_1.ALL_BLOODLINES[0].name).toBeDefined();
        expect(bloodlines_fixed_1.ALL_BLOODLINES[0].description).toBeDefined();
        expect(bloodlines_fixed_1.ALL_BLOODLINES[0].rarity).toBeDefined();
    });
    test('Physiques are properly created', () => {
        expect(physiques_1.PHYSIQUES.length).toBeGreaterThan(100); // Should have 100+ physiques
        expect(physiques_1.PHYSIQUES[0].id).toBeDefined();
        expect(physiques_1.PHYSIQUES[0].name).toBeDefined();
        expect(physiques_1.PHYSIQUES[0].description).toBeDefined();
        expect(physiques_1.PHYSIQUES[0].rarity).toBeDefined();
    });
    test('Manuals are properly created', () => {
        expect(manuals_1.ALL_MANUALS.length).toBeGreaterThan(50); // Should have 50+ manuals
        expect(manuals_1.ALL_MANUALS[0].id).toBeDefined();
        expect(manuals_1.ALL_MANUALS[0].name).toBeDefined();
        expect(manuals_1.ALL_MANUALS[0].description).toBeDefined();
        expect(manuals_1.ALL_MANUALS[0].rank).toBeDefined();
    });
    test('Scaling system works correctly', () => {
        const mortalMultiplier = (0, scalingSystem_1.getRealmMultiplier)('mortal');
        const goldenImmortalMultiplier = (0, scalingSystem_1.getRealmMultiplier)('golden_immortal');
        const soulTransformationMultiplier = (0, scalingSystem_1.getRealmMultiplier)('soul_transformation');
        expect(mortalMultiplier).toBeCloseTo(1.0);
        expect(goldenImmortalMultiplier).toBeGreaterThan(mortalMultiplier);
        expect(soulTransformationMultiplier).toBeGreaterThan(goldenImmortalMultiplier);
    });
    test('Bloodline stats scale with realm', () => {
        const bloodline = bloodlines_fixed_1.ALL_BLOODLINES.find(b => b.rarity === 'rare' && b.effects.stats?.qi);
        if (!bloodline)
            return;
        // Extract base stat values from StatEffect objects
        const bloodlineBaseStats = {};
        Object.entries(bloodline.effects.stats || {}).forEach(([key, statEffect]) => {
            bloodlineBaseStats[key] = typeof statEffect === 'object' && statEffect.base !== undefined ? statEffect.base : statEffect;
        });
        const mortalStats = (0, scalingSystem_1.scaleBloodlineStats)(bloodlineBaseStats, 'mortal');
        const goldenStats = (0, scalingSystem_1.scaleBloodlineStats)(bloodlineBaseStats, 'golden_immortal');
        expect(goldenStats.qi).toBeGreaterThan(mortalStats.qi || 0);
        if (goldenStats.atk && mortalStats.atk)
            expect(goldenStats.atk).toBeGreaterThan(mortalStats.atk);
        if (goldenStats.def && mortalStats.def)
            expect(goldenStats.def).toBeGreaterThan(mortalStats.def);
    });
    test('Physique stats scale with realm', () => {
        const physique = physiques_1.PHYSIQUES.find(p => p.rarity === 'rare' && p.effects.stats?.qi);
        if (!physique)
            return;
        // Extract base stat values from StatEffect objects
        const physiqueBaseStats = {};
        Object.entries(physique.effects.stats || {}).forEach(([key, statEffect]) => {
            physiqueBaseStats[key] = typeof statEffect === 'object' && statEffect.base !== undefined ? statEffect.base : statEffect;
        });
        const mortalStats = (0, scalingSystem_1.scalePhysiqueStats)(physiqueBaseStats, 'mortal');
        const goldenStats = (0, scalingSystem_1.scalePhysiqueStats)(physiqueBaseStats, 'golden_immortal');
        expect(goldenStats.qi).toBeGreaterThan(mortalStats.qi || 0);
        if (goldenStats.atk && mortalStats.atk)
            expect(goldenStats.atk).toBeGreaterThan(mortalStats.atk);
        if (goldenStats.def && mortalStats.def)
            expect(goldenStats.def).toBeGreaterThan(mortalStats.def);
    });
    test('Cultivation speed scales with realm', () => {
        const physique = physiques_1.PHYSIQUES.find(p => p.effects.cultivation_speed);
        if (!physique || !physique.effects.cultivation_speed)
            return;
        const effect = physique.effects.cultivation_speed;
        const baseSpeed = typeof effect === 'number' ? effect : (effect && effect.base) || 1.0;
        const mortalSpeed = (0, scalingSystem_1.scaleCultivationSpeed)(baseSpeed, 'mortal');
        const goldenSpeed = (0, scalingSystem_1.scaleCultivationSpeed)(baseSpeed, 'golden_immortal');
        expect(goldenSpeed).toBeGreaterThan(mortalSpeed);
    });
    test('Manual effects scale with realm', () => {
        const manual = manuals_1.ALL_MANUALS.find(m => m.rank === 'rare' && (m.effects.cultivationSpeed || m.effects.cultivation_speed));
        if (!manual)
            return;
        const mortalEffects = (0, scalingSystem_1.scaleManualEffects)(manual.effects, 'mortal');
        const goldenEffects = (0, scalingSystem_1.scaleManualEffects)(manual.effects, 'golden_immortal');
        const mortalSpeed = mortalEffects.cultivationSpeed ?? mortalEffects.cultivation_speed;
        const goldenSpeed = goldenEffects.cultivationSpeed ?? goldenEffects.cultivation_speed;
        if (typeof mortalSpeed === 'number' && typeof goldenSpeed === 'number') {
            expect(goldenSpeed).toBeGreaterThan(mortalSpeed);
        }
    });
    test('Integrated stats calculation works', () => {
        const bloodline = bloodlines_fixed_1.ALL_BLOODLINES.find(b => b.rarity === 'common');
        const physique = physiques_1.PHYSIQUES.find(p => p.rarity === 'common');
        const manual = manuals_1.ALL_MANUALS.find(m => m.rank === 'common');
        if (!bloodline || !physique || !manual)
            return;
        const stats = (0, characterAdvancement_1.calculateIntegratedStats)(bloodline.id, physique.id, [manual.id], 'mortal');
        expect(stats.baseStats.qi).toBeGreaterThan(100); // Should be more than base
        expect(stats.baseStats.atk).toBeGreaterThan(10);
        expect(stats.baseStats.def).toBeGreaterThan(10);
        expect(stats.cultivationSpeed).toBeGreaterThan(1.0);
        expect(stats.specialAbilities.length).toBeGreaterThan(0);
    });
    test('Recommended combinations are generated', () => {
        const recommendations = (0, characterAdvancement_1.getRecommendedCombinations)();
        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations[0].synergy).toBeGreaterThan(0);
        expect(recommendations[0].description).toBeDefined();
    });
    test('Bloodline awakening check works', () => {
        const legendaryBloodline = bloodlines_fixed_1.ALL_BLOODLINES.find(b => b.rarity === 'legendary');
        if (!legendaryBloodline)
            return;
        const canAwakenMortal = (0, characterAdvancement_1.canAwakenBloodline)(legendaryBloodline.id, 'mortal', 10000);
        const canAwakenSoulTransformation = (0, characterAdvancement_1.canAwakenBloodline)(legendaryBloodline.id, 'soul_transformation', 25000);
        expect(canAwakenMortal).toBe(false); // Should not be able to awaken legendary in mortal realm
        expect(canAwakenSoulTransformation).toBe(true); // Should be able to awaken in soul transformation
    });
    test('Rarity distribution is correct', () => {
        const bloodlineRarities = bloodlines_fixed_1.ALL_BLOODLINES.map(b => b.rarity);
        const commonBloodlines = bloodlineRarities.filter(r => r === 'common').length;
        const legendaryBloodlines = bloodlineRarities.filter(r => r === 'legendary').length;
        const transcendentBloodlines = bloodlineRarities.filter(r => r === 'transcendent').length;
        // Should have more common than legendary, and more legendary than transcendent
        expect(commonBloodlines).toBeGreaterThan(legendaryBloodlines);
        expect(legendaryBloodlines).toBeGreaterThan(transcendentBloodlines);
    });
    test('All IDs are unique', () => {
        const bloodlineIds = bloodlines_fixed_1.ALL_BLOODLINES.map(b => b.id);
        const physiqueIds = physiques_1.PHYSIQUES.map(p => p.id);
        const manualIds = manuals_1.ALL_MANUALS.map(m => m.id);
        expect(new Set(bloodlineIds).size).toBe(bloodlineIds.length);
        expect(new Set(physiqueIds).size).toBe(physiqueIds.length);
        expect(new Set(manualIds).size).toBe(manualIds.length);
    });
    test('Special effects are properly assigned', () => {
        const dragonBloodline = bloodlines_fixed_1.ALL_BLOODLINES.find(b => b.name.toLowerCase().includes('dragon'));
        if (!dragonBloodline)
            return;
        expect(dragonBloodline.effects.special).toBeDefined();
        expect(dragonBloodline.effects.special?.length).toBeGreaterThan(0);
        // Check for dragon-related effects (draconic, dragon, etc.)
        expect(dragonBloodline.effects.special?.some(effect => effect.includes('dragon') || effect.includes('draconic'))).toBe(true);
    });
});
// Run the tests
console.log('Running Xianxia Naming System tests...');
