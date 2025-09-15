"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const combatConfig_1 = require("./combatConfig");
const QuestSystem_1 = require("./QuestSystem");
// Adjust class to use correct method names and handle missing methods gracefully
class GameEngine {
    constructor(rivalSystem, combatSystem, mentorSystem, sectSystem, marketSystem) {
        this.rivalSystem = rivalSystem;
        this.combatSystem = combatSystem;
        this.mentorSystem = mentorSystem;
        this.sectSystem = sectSystem;
        this.marketSystem = marketSystem;
    }
    handleRivalEncounter(rivalId, gameState) {
        const rival = gameState.systems.rivals[rivalId];
        if (!rival)
            return null;
        const cooldown = gameState.systems.rivalCooldowns[rivalId];
        if (cooldown && cooldown > gameState.world.day) {
            return null;
        }
        // Use canEncounterRival method instead
        if (typeof this.rivalSystem.canEncounterRival === 'function') {
            const canEncounter = this.rivalSystem.canEncounterRival(rivalId, gameState.world.day);
            if (!canEncounter)
                return null;
            // Create encounter manually since generateEncounter doesn't exist
            const encounter = {
                id: `encounter_${Date.now()}`,
                rivalId,
                type: 'chance',
                location: 'neutral_territory',
                description: `Encounter with ${rival.name}`,
                outcome: 'victory', // Default outcome, will be updated when combat resolves
                lootGained: [],
                reputationChange: {},
                year: gameState.world.year
            };
            gameState.systems.rivalEncounters.push(encounter);
            gameState.systems.rivalCooldowns[rivalId] = gameState.world.day + 7;
            return encounter;
        }
        return null;
    }
    initiateRivalCombat(rivalId, gameState) {
        const rival = gameState.systems.rivals[rivalId];
        if (!rival)
            return null;
        const combatInstance = {
            id: `combat_${Date.now()}`,
            type: 'rival',
            participants: ['player', rivalId],
            currentTurn: 1,
            status: 'active',
            startTime: Date.now(),
            context: {
                rivalId,
                location: 'neutral_territory',
                stakes: 'reputation'
            }
        };
        gameState.systems.activeCombat = combatInstance;
        gameState.ui.combatState = {
            phase: 'setup',
            targetRival: rivalId,
            combatLog: [`Encounter with ${rival.name} begins!`],
            turnNumber: 1
        };
        return combatInstance;
    }
    processCombatTurn(action, gameState) {
        if (!gameState.systems.activeCombat)
            return null;
        const combat = gameState.systems.activeCombat;
        // For now, create a simple combat result based on action
        // This is a placeholder - in a real implementation, you'd use the CombatSystem
        const result = {
            id: `result_${Date.now()}`,
            participants: combat.participants,
            winner: action.type === 'attack' ? 'player' : 'enemy',
            type: combat.type,
            duration: Date.now() - combat.startTime,
            penalties: [],
            timestamp: Date.now(),
            rewards: {
                experience: 100,
                items: []
            }
        };
        gameState.systems.combatHistory.push(result);
        gameState.systems.activeCombat = undefined;
        gameState.ui.combatState = undefined;
        this.applyCombatConsequences(result, gameState);
        return result;
    }
    applyCombatConsequences(result, gameState) {
        const combat = gameState.systems.activeCombat;
        if (!combat)
            return;
        if (combat.type === 'rival' && combat.context.rivalId) {
            const rivalId = combat.context.rivalId;
            const relationshipChange = result.winner === 'player' ? 20 : -15;
            if (typeof this.rivalSystem.updateRivalRelationship === 'function') {
                this.rivalSystem.updateRivalRelationship(rivalId, relationshipChange);
            }
            if (result.winner === 'player' && typeof this.rivalSystem.markRivalDefeated === 'function') {
                this.rivalSystem.markRivalDefeated(rivalId);
                gameState.player.defeatedRivals = gameState.player.defeatedRivals || [];
                gameState.player.defeatedRivals.push(rivalId);
            }
        }
        if (combat.type === 'sect' || combat.type === 'faction') {
            this.updateFactionReputations(result, gameState);
        }
        this.applyCombatRewards(result, gameState);
    }
    conductTeachingSession(mentorId, teachingId, gameState) {
        if (typeof this.mentorSystem.attemptTeaching === 'function') {
            const result = this.mentorSystem.attemptTeaching(teachingId, gameState);
            if (result.result.success) {
                gameState.systems.teachingProgress[teachingId] = result.updatedProgress;
                this.applyTeachingRewards(result.result, gameState);
                gameState.player.mentorAffinity[mentorId] =
                    (gameState.player.mentorAffinity[mentorId] || 0) + 5;
            }
            return result;
        }
        return null;
    }
    getAvailableTeachings(mentorId, gameState) {
        if (typeof this.mentorSystem.getAvailableTeachings === 'function') {
            return this.mentorSystem.getAvailableTeachings(mentorId, gameState);
        }
        return [];
    }
    joinSect(sectId, gameState) {
        if (typeof this.sectSystem.joinSect === 'function') {
            const success = this.sectSystem.joinSect(sectId, gameState.player);
            if (success) {
                this.updateRivalRelationshipsForSectChange(sectId, gameState);
                this.updateMarketAccessForSect(sectId, gameState);
                this.updateSectQuests(sectId, gameState);
            }
            return success;
        }
        return false;
    }
    completeSectMission(missionId, gameState) {
        if (typeof this.sectSystem.getCurrentSect === 'function' &&
            typeof this.sectSystem.adjustSectReputation === 'function') {
            const currentSect = this.sectSystem.getCurrentSect();
            if (currentSect) {
                this.sectSystem.adjustSectReputation(currentSect, 10);
            }
        }
        gameState.systems.currentSectMissions =
            gameState.systems.currentSectMissions.filter(id => id !== missionId);
        this.applySectMissionRewards(missionId, gameState);
    }
    processMarketTransaction(marketId, itemId, gameState) {
        const success = this.marketSystem.buyItem(marketId, itemId, gameState.player);
        if (success) {
            const item = this.marketSystem.getMarketItems(marketId, gameState.player)
                .find(i => i.id === itemId);
            if (item) {
                gameState.player.inventory.push({
                    name: item.name,
                    description: item.description,
                    type: item.type,
                    quantity: 1
                });
            }
            this.updateFactionStandingForMarket(marketId, gameState);
        }
        return success;
    }
    getAvailableMarkets(gameState) {
        return this.marketSystem.getAvailableMarkets(gameState.player);
    }
    updateQuestProgress(gameState) {
        const completedQuests = (0, QuestSystem_1.checkQuestCompletion)(gameState);
        completedQuests.forEach((questId) => {
            this.applyQuestRewards(questId, gameState);
            gameState.story.completedQuests.push(questId);
        });
        return completedQuests;
    }
    updateRivalRelationshipsForSectChange(sectId, _gameState) {
        if (typeof this.sectSystem.getSectRivals === 'function' &&
            typeof this.sectSystem.getSectAllies === 'function') {
            const rivalIds = this.sectSystem.getSectRivals(sectId);
            const allyIds = this.sectSystem.getSectAllies(sectId);
            rivalIds.forEach(rivalId => {
                if (typeof this.rivalSystem.updateRivalRelationship === 'function') {
                    this.rivalSystem.updateRivalRelationship(rivalId, -20);
                }
            });
            allyIds.forEach(allyId => {
                if (typeof this.rivalSystem.updateRivalRelationship === 'function') {
                    this.rivalSystem.updateRivalRelationship(allyId, 10);
                }
            });
        }
    }
    updateMarketAccessForSect(sectId, gameState) {
        gameState.world.marketRefreshTimers[sectId] = gameState.world.day;
    }
    updateSectQuests(_sectId, _gameState) {
        // Note: getAvailableMissions method doesn't exist, so we'll skip this for now
        // In a real implementation, you'd populate sect quests here
    }
    updateFactionReputations(result, _gameState) {
        if (typeof this.sectSystem.getFactionEnemies === 'function' &&
            typeof this.sectSystem.adjustFactionStanding === 'function') {
            const factions = this.sectSystem.getFactionEnemies(result.participants[0]);
            const reputationChange = result.winner === 'player' ? 5 : -5;
            factions.forEach(factionId => {
                this.sectSystem.adjustFactionStanding(factionId, reputationChange);
            });
        }
    }
    applyCombatRewards(result, gameState) {
        if (result.rewards.experience) {
            gameState.player.level += Math.floor(result.rewards.experience / 100);
        }
        if (result.rewards.items) {
            gameState.player.inventory.push(...result.rewards.items);
        }
    }
    applyTeachingRewards(result, gameState) {
        if (result.bonusRewards) {
            Object.entries(result.bonusRewards).forEach(([key, value]) => {
                if (key === 'insight') {
                    gameState.player.insight += value;
                }
                else if (key === 'combatPower') {
                    // If the entity prefers using a computed combatPower, respect that; otherwise, add as-is.
                    if (gameState.player && gameState.player._preferEntityCombatPower) {
                        gameState.player.combatPower = (0, combatConfig_1.computeCombatPower)(gameState.player);
                    }
                    else {
                        gameState.player.combatPower += value;
                    }
                }
            });
        }
    }
    applySectMissionRewards(missionId, gameState) {
        gameState.player.reputation[missionId] =
            (gameState.player.reputation[missionId] || 0) + 10;
    }
    applyQuestRewards(questId, gameState) {
        // Apply rewards for completed quest
        // This is a placeholder - in a real implementation, you'd look up quest rewards
        gameState.player.level += 1;
        // Note: experience property may not exist on PlayerState, so we'll skip it for now
    }
    updateFactionStandingForMarket(_marketId, _gameState) {
        // Market transactions can affect faction standings (placeholder)
        // placeholder
    }
    advanceTime(days, gameState) {
        gameState.world.day += days;
        Object.keys(gameState.systems.rivalCooldowns).forEach(rivalId => {
            if (gameState.systems.rivalCooldowns[rivalId] <= gameState.world.day) {
                delete gameState.systems.rivalCooldowns[rivalId];
            }
        });
        // Note: refreshMarkets method doesn't exist, so we'll skip this for now
        // In a real implementation, you'd refresh market data here
        this.checkForNewEvents(gameState);
    }
    checkForNewEvents(gameState) {
        Object.values(gameState.systems.rivals).forEach(rival => {
            if (Math.random() < 0.1) {
                this.handleRivalEncounter(rival.id, gameState);
            }
        });
        if (gameState.player.sect && Math.random() < 0.05) {
            this.generateSectMission(gameState);
        }
    }
    generateSectMission(gameState) {
        const mission = {
            id: `sect_mission_${Date.now()}`,
            title: 'Sect Mission',
            description: 'Complete this mission for your sect',
            type: 'sect'
        };
        gameState.systems.currentSectMissions.push(mission.id);
    }
}
exports.GameEngine = GameEngine;
