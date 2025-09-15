"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSaveLoadDemo = runSaveLoadDemo;
const SaveLoadSystem_1 = require("../systems/SaveLoadSystem");
const realmHelpers_1 = require("../utils/realmHelpers");
// Simple demo to show how the SaveLoadSystem works
function runSaveLoadDemo() {
    console.log('=== Save/Load System Demo ===\n');
    // Create a simple test game state
    const testGameState = {
        player: {
            name: 'Demo Player',
            gender: 'Male',
            race: 'Human',
            background: null,
            age: 20,
            realmId: 2,
            realm: 'qiCondensation',
            talentId: 'mortal',
            minorStage: 3,
            level: 5,
            baseStats: { hp: 150, qi: 200, atk: 15, def: 12, speed: 13 },
            stats: { hp: 150, qi: 200, atk: 15, def: 12, speed: 13 },
            insight: 90,
            combatPower: 250,
            karma: 10,
            cunning: 5,
            resolve: 60,
            resourcefulness: 55,
            currentQi: 50,
            qiRequired: 300,
            lifespan: 200,
            spiritStones: { low: 10, mid: 2, high: 0 },
            yuan: 500,
            inventory: [],
            skills: {
                weaponMastery: { level: 2, exp: 75, expToNext: 100 },
                alchemy: { level: 1, exp: 25, expToNext: 100 },
                comprehension: { level: 3, exp: 40, expToNext: 100 },
                qiControl: { level: 2, exp: 60, expToNext: 100 },
                bodyTempering: { level: 1, exp: 10, expToNext: 100 },
                daoInsight: { level: 2, exp: 80, expToNext: 100 },
                combatSkills: { level: 3, exp: 90, expToNext: 100 },
                socialSkills: { level: 1, exp: 15, expToNext: 100 },
                mentalFortitude: { level: 2, exp: 70, expToNext: 100 },
                spiritBeastTaming: { level: 0, exp: 0, expToNext: 100 },
                meditation: { level: 2, exp: 65, expToNext: 100 },
                forging: { level: 1, exp: 30, expToNext: 100 }
            },
            mentorAffinity: {},
            manuals: [],
            bloodline: null,
            physique: null,
            sect: null,
            techniques: [],
            cultivationPower: 120,
            discipline: 60,
            patience: 55,
            daoHeart: 65,
            reputation: { world: 5 },
            factionStandings: {},
            sectReputations: {},
            factionReputations: {},
            rivalRelationships: {},
            lastRivalEncounters: {},
            factionBattles: [],
            dailyCultivationCount: 0,
            lastDailyReset: 0,
            teachingProgress: {},
            mentorProgress: {},
            buffs: {},
            experience: 0,
            discoveredRecipes: [],
            currentLocationId: null,
            activeBuffs: [],
            hp: 150,
            qi: 200,
            maxHp: 150,
            maxQi: 200,
        },
        world: {
            year: 1,
            day: 15,
            tick: 0,
            flags: { tutorialCompleted: true },
            factions: {},
            heavensList: [],
            lastEpochTournamentYear: 0,
            activeEvents: [],
            marketRefreshTimers: {}
        },
        story: {
            currentAct: 'act1',
            mainQuestId: 'first_cultivation',
            questProgress: { first_cultivation: { completed: false, objectives: { main: false } } },
            activeSectQuests: [],
            activeRandomMissions: [],
            activeBetrayalMissions: [],
            completedQuests: [],
            storyFlags: {}
        },
        ui: {
            currentScreen: 'game',
            selectedMentor: null,
            showMentorModal: false,
            showLore: false,
            currentLoreIndex: 0,
            showCodex: false,
            showDebugMenu: false,
            selectedRival: null
        },
        systems: {
            rivals: {},
            rivalEncounters: [],
            rivalCooldowns: {},
            activeCombat: undefined,
            combatHistory: [],
            teachingProgress: {},
            mentorProgress: {},
            availableTeachings: {},
            sectReputations: {},
            factionStandings: {},
            currentSectMissions: [],
            marketInventory: {},
            activeAuctions: [],
            marketRefreshTimes: {},
            questObjectives: {},
            questRewards: {}
        }
    };
    console.log('1. Saving game state...');
    const saveResult = SaveLoadSystem_1.SaveLoadSystem.saveGame(testGameState);
    console.log(`   Save result: ${saveResult ? 'SUCCESS' : 'FAILED'}`);
    console.log('\n2. Loading saved game...');
    const loadedData = SaveLoadSystem_1.SaveLoadSystem.loadGame();
    if (loadedData) {
        console.log('   Load successful!');
        console.log(`   Player name: ${loadedData.gameState.player.name}`);
        console.log(`   Player level: ${loadedData.gameState.player.level}`);
        console.log(`   Realm: ${(0, realmHelpers_1.getRealmKeyFromPlayer)(loadedData.gameState.player)}`);
        console.log(`   Game version: ${loadedData.gameVersion}`);
        console.log(`   Save timestamp: ${new Date(loadedData.timestamp).toLocaleString()}`);
    }
    else {
        console.log('   No save data found!');
    }
    console.log('\n3. Testing delete functionality...');
    const deleteResult = SaveLoadSystem_1.SaveLoadSystem.deleteSave();
    console.log(`   Delete result: ${deleteResult ? 'SUCCESS' : 'FAILED'}`);
    console.log('\n4. Verifying save is deleted...');
    const verifyLoad = SaveLoadSystem_1.SaveLoadSystem.loadGame();
    console.log(`   Load after delete: ${verifyLoad ? 'DATA STILL EXISTS' : 'NO DATA (SUCCESS)'}`);
    console.log('\n=== Demo Complete ===');
}
// Run the demo if this file is executed directly
if (require.main === module) {
    runSaveLoadDemo();
}
