"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demonstrateRivalCombat = demonstrateRivalCombat;
const CombatSystem_1 = require("./CombatSystem");
const SectSystem_1 = require("./SectSystem");
const RivalSystem_1 = require("./RivalSystem");
// Demo function to show rival combat integration
function demonstrateRivalCombat() {
    console.log('=== Rival Combat System Demo ===');
    // Create sect system with actual rival system
    const sectSystem = new SectSystem_1.SectFactionSystem(new RivalSystem_1.RivalSystem());
    // Create player character
    const player = {
        id: 'player',
        name: 'Player Cultivator',
        hp: 100,
        maxHp: 100,
        qi: 50,
        maxQi: 50,
        ap: 3,
        maxAp: 3,
        stats: {
            atk: 15,
            def: 10,
            speed: 12
        },
        techniques: [...CombatSystem_1.DEFAULT_TECHNIQUES],
        buffs: [],
        debuffs: []
    };
    // Generate a rival from Azure Cloud Sect
    const rival = sectSystem.generateRivalFromSect('azure_cloud_sect', 5);
    if (!rival) {
        console.log('Failed to generate rival');
        return;
    }
    // Create rival combat participant
    const rivalParticipant = {
        id: 'rival_1',
        name: rival.name,
        hp: rival.stats.hp,
        maxHp: rival.stats.hp,
        qi: rival.stats.qi,
        maxQi: rival.stats.qi,
        ap: 3,
        maxAp: 3,
        stats: {
            atk: rival.stats.atk,
            def: rival.stats.def,
            speed: rival.stats.speed
        },
        techniques: rival.techniques.map((techId) => CombatSystem_1.DEFAULT_TECHNIQUES.find(t => t.id === techId) || CombatSystem_1.DEFAULT_TECHNIQUES[0]),
        buffs: [],
        debuffs: []
    };
    // Create mock game store and rival system for demo
    const mockGameStore = {
        player: player,
        rivalSystem: {
            getRival: () => null,
            getAllRivals: () => [],
            getRivalsByFaction: () => [],
            getRivalsBySect: () => [],
            updateRivalRelationship: () => { },
            markRivalDefeated: () => { },
            addRivalEncounter: () => 'encounter_1',
            getRivalEncounters: () => [],
            startFactionBattle: () => 'battle_1',
            resolveFactionBattle: () => { },
            getFactionBattles: () => [],
            canEncounterRival: () => true,
            getRivalAsCombatParticipant: () => rivalParticipant
        }
    };
    // Create combat with rival context
    const combatSystem = new CombatSystem_1.CombatSystem(player, [rivalParticipant], mockGameStore, mockGameStore.rivalSystem, {
        type: 'rival',
        rivalId: 'azure_cloud_disciple_1'
    });
    console.log('Rival combat initiated!');
    console.log(`Player: ${player.name}`);
    console.log(`Rival: ${rivalParticipant.name}`);
    console.log(`Rival Level: ${rival.level}`);
    console.log(`Rival Techniques: ${rival.techniques.join(', ')}`);
    // Simulate a few combat turns
    for (let i = 0; i < 3; i++) {
        if (combatSystem.getState().status !== 'ongoing')
            break;
        const current = combatSystem.getCurrentParticipant();
        if (current && current.id === 'player') {
            // Player uses basic attack
            combatSystem.useTechnique('player', 'basic_attack', 'rival_1');
        }
        else if (current) {
            // Rival uses random technique
            const availableTechs = combatSystem.getAvailableTechniques(current.id);
            if (availableTechs.length > 0) {
                const randomTech = availableTechs[Math.floor(Math.random() * availableTechs.length)];
                combatSystem.useTechnique(current.id, randomTech.id, 'player');
            }
        }
        combatSystem.endTurn();
    }
    const combatState = combatSystem.getState();
    console.log('\nCombat Log:');
    combatState.combatLog.forEach(log => console.log(log));
    console.log('\nFinal Combat Status:', combatState.status);
    // Show reputation impact (would be handled by game store in real implementation)
    if (combatState.status === 'victory') {
        console.log('Player defeated rival! Reputation with Azure Cloud Sect increased.');
        sectSystem.adjustSectReputation('azure_cloud_sect', 15);
    }
    else if (combatState.status === 'defeat') {
        console.log('Player was defeated by rival! Reputation with Azure Cloud Sect decreased.');
        sectSystem.adjustSectReputation('azure_cloud_sect', -10);
    }
}
// Run demo if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    demonstrateRivalCombat();
}
