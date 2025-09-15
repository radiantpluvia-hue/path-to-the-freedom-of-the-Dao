"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RivalAIDemo = void 0;
const systems_1 = require("../systems");
// Demo script to test the Dynamic AI Behavior system
class RivalAIDemo {
    constructor() {
        this.mockCombatSystem = {};
        this.aiSystem = new systems_1.RivalAISystem(this.mockCombatSystem);
    }
    runDemo() {
        console.log('🚀 Starting Dynamic AI Behavior System Demo\n');
        // Create test rivals with different personalities
        const rivals = [
            {
                id: 'aggressive_rival',
                name: 'Bloodfang Chen',
                title: 'Fierce Warrior',
                description: 'A hot-headed warrior known for his aggressive combat style',
                faction: 'demon_clan',
                sect: 'bloodfang_sect',
                realm: 'foundation_establishment',
                level: 18,
                stats: { hp: 300, qi: 250, atk: 45, def: 30, speed: 35 },
                techniques: ['blood_rage', 'fierce_charge'],
                personality: 'aggressive',
                relationship: -50,
                lastEncounter: 0,
                encounterCount: 0,
                defeated: false,
                specialAbilities: ['berserker_rage'],
                loot: []
            },
            {
                id: 'cunning_rival',
                name: 'Shadow Liu',
                title: 'Master Strategist',
                description: 'A cunning strategist who excels in deception and manipulation',
                faction: 'shadow_court',
                sect: 'night_blade_sect',
                realm: 'foundation_establishment',
                level: 16,
                stats: { hp: 250, qi: 300, atk: 35, def: 35, speed: 40 },
                techniques: ['shadow_step', 'illusion_technique'],
                personality: 'cunning',
                relationship: -20,
                lastEncounter: 0,
                encounterCount: 0,
                defeated: false,
                specialAbilities: ['stealth_mastery'],
                loot: []
            },
            {
                id: 'honorable_rival',
                name: 'Iron Will Zhang',
                title: 'Honorable Guardian',
                description: 'A honorable warrior who fights with dignity and honor',
                faction: 'righteous_path',
                sect: 'iron_shield_sect',
                realm: 'foundation_establishment',
                level: 17,
                stats: { hp: 350, qi: 200, atk: 40, def: 50, speed: 25 },
                techniques: ['iron_defense', 'honorable_strike'],
                personality: 'honorable',
                relationship: 10,
                lastEncounter: 0,
                encounterCount: 0,
                defeated: false,
                specialAbilities: ['unbreakable_will'],
                loot: []
            }
        ];
        // Test personality profiles
        console.log('📊 Testing Personality Profiles:');
        rivals.forEach(rival => {
            const profile = this.aiSystem.getPersonalityProfile(rival.personality);
            console.log(`  ${rival.name} (${rival.personality}):`);
            console.log(`    Combat Style: ${profile.combatStyle}`);
            console.log(`    Social Tendencies: ${profile.socialTendencies}`);
            console.log(`    Preferred Techniques: ${profile.preferredTechniques.join(', ')}`);
            console.log(`    Avoided Techniques: ${profile.avoidedTechniques.join(', ')}\n`);
        });
        // Test combat decision making
        console.log('⚔️  Testing Combat Decision Making:');
        const combatSituation = {
            playerHp: 100,
            rivalHp: 200,
            playerQi: 150,
            rivalQi: 180,
            turnNumber: 3,
            previousActions: ['attack', 'defend', 'technique']
        };
        rivals.forEach(rival => {
            const decision = this.aiSystem.makeCombatDecision(rival, {}, combatSituation);
            console.log(`  ${rival.name} decides to: ${decision.action} (Priority: ${decision.priority})`);
            console.log(`    Reasoning: ${decision.reasoning}\n`);
        });
        // Test adaptive dialogue
        console.log('💬 Testing Adaptive Dialogue:');
        rivals.forEach(rival => {
            const dialogue = this.aiSystem.generateAdaptiveDialogue(rival, 'combat_start');
            console.log(`  ${rival.name}: "${dialogue}"`);
        });
        console.log('');
        // Test encounter memory and adaptation
        console.log('🧠 Testing Encounter Memory & Adaptation:');
        const testRival = rivals[0]; // Use the aggressive rival
        console.log('  Before adaptation:');
        const initialDifficulty = this.aiSystem.calculateAdaptiveDifficulty(testRival, 10);
        console.log(`    Base difficulty: ${initialDifficulty}`);
        // Simulate multiple encounters
        for (let i = 0; i < 5; i++) {
            this.aiSystem.recordEncounterResult(testRival.id, ['attack', 'attack', 'defend'], ['power_attack'], ['defensive_stance']);
        }
        console.log('  After 5 encounters:');
        const adaptedDifficulty = this.aiSystem.calculateAdaptiveDifficulty(testRival, 10);
        console.log(`    Adapted difficulty: ${adaptedDifficulty}`);
        const memory = this.aiSystem.getEncounterMemory(testRival.id);
        if (memory) {
            console.log(`    Adaptation level: ${memory.adaptationLevel}`);
            console.log(`    Successful strategies: ${memory.successfulStrategies.join(', ')}`);
            console.log(`    Failed strategies: ${memory.failedStrategies.join(', ')}`);
        }
        // Test adapted decision making
        const adaptedDecision = this.aiSystem.makeCombatDecision(testRival, {}, combatSituation);
        console.log(`    Adapted decision: ${adaptedDecision.action} (Priority: ${adaptedDecision.priority})`);
        console.log(`    Adapted reasoning: ${adaptedDecision.reasoning}\n`);
        // Test different combat situations
        console.log('🎯 Testing Different Combat Situations:');
        const situations = [
            { name: 'Low Health', playerHp: 100, rivalHp: 30, playerQi: 150, rivalQi: 180 },
            { name: 'High Qi', playerHp: 100, rivalHp: 200, playerQi: 150, rivalQi: 250 },
            { name: 'Early Game', playerHp: 100, rivalHp: 200, playerQi: 150, rivalQi: 180, turnNumber: 1 },
            { name: 'Late Game', playerHp: 50, rivalHp: 80, playerQi: 50, rivalQi: 60, turnNumber: 10 }
        ];
        situations.forEach(situation => {
            const decision = this.aiSystem.makeCombatDecision(testRival, {}, {
                ...combatSituation,
                ...situation
            });
            console.log(`  ${situation.name}: ${decision.action} (Priority: ${decision.priority})`);
        });
        console.log('\n✅ Dynamic AI Behavior System Demo Complete!');
        console.log('🎮 The AI system successfully adapts to different personalities, combat situations, and player patterns!');
    }
}
exports.RivalAIDemo = RivalAIDemo;
// Export for use in other files
exports.default = RivalAIDemo;
// If running directly
if (require.main === module) {
    const demo = new RivalAIDemo();
    demo.runDemo();
}
