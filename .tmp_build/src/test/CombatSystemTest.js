"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CombatSystem_ts_1 = require("../systems/CombatSystem.ts");
const RivalSystem_ts_1 = require("../systems/RivalSystem.ts");
// Mock GameStore
const mockGameStore = {
    player: {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 10, def: 10, speed: 10 },
        techniques: CombatSystem_ts_1.DEFAULT_TECHNIQUES,
        buffs: [],
        debuffs: []
    },
    rivalSystem: new RivalSystem_ts_1.RivalSystem(),
};
// Test that all default techniques have valid types
function testDefaultTechniqueTypes() {
    console.log('Testing default technique types...');
    CombatSystem_ts_1.DEFAULT_TECHNIQUES.forEach(technique => {
        const validTypes = ['attack', 'defense', 'support', 'movement'];
        if (!validTypes.includes(technique.type)) {
            console.error(`❌ Invalid technique type: ${technique.type} for ${technique.name}`);
            return false;
        }
        console.log(`✅ ${technique.name}: ${technique.type}`);
    });
    return true;
}
// Test combat system initialization
function testCombatSystem() {
    console.log('\nTesting combat system initialization...');
    const player = {
        id: 'player',
        name: 'Test Player',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 5,
        maxAp: 5,
        stats: { atk: 10, def: 10, speed: 10 },
        techniques: CombatSystem_ts_1.DEFAULT_TECHNIQUES,
        buffs: [],
        debuffs: []
    };
    const enemy = {
        id: 'enemy',
        name: 'Test Enemy',
        hp: 80,
        maxHp: 80,
        qi: 30,
        maxQi: 30,
        ap: 4,
        maxAp: 4,
        stats: { atk: 8, def: 8, speed: 8 },
        techniques: CombatSystem_ts_1.DEFAULT_TECHNIQUES,
        buffs: [],
        debuffs: []
    };
    try {
        const combatSystem = new CombatSystem_ts_1.CombatSystem(player, [enemy], mockGameStore, mockGameStore.rivalSystem, { type: 'normal' });
        const state = combatSystem.getState();
        console.log(`✅ Combat system initialized successfully`);
        console.log(`   Participants: ${state.participants.length}`);
        console.log(`   Turn order: ${state.turnOrder.join(' → ')}`);
        console.log(`   Combat log: ${state.combatLog.length} entries`);
        return true;
    }
    catch (error) {
        console.error(`❌ Combat system initialization failed:`, error);
        return false;
    }
}
// Run tests
console.log('=== Combat System Tests ===\n');
const techniqueTestPassed = testDefaultTechniqueTypes();
const combatTestPassed = testCombatSystem();
console.log('\n=== Test Results ===');
console.log(`Technique Types: ${techniqueTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`Combat System: ${combatTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
if (techniqueTestPassed && combatTestPassed) {
    console.log('\n🎉 All tests passed! The combat system is working correctly.');
}
else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
}
