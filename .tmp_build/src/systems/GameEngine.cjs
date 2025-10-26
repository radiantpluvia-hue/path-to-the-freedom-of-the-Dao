"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const combatConfig_1 = require("./combatConfig");
const QuestSystem_1 = require("./QuestSystem");
// domainSystem is not required at module runtime here; keep code minimal to avoid
// pulling unnecessary runtime modules into the client bundle.
const rng_1 = require("../utils/rng");
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
                const upd = result.updatedProgress;
                if (typeof upd !== 'undefined') {
                    gameState.systems.teachingProgress[teachingId] = upd;
                }
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
        // SectFactionSystem exposes getPlayerSect() and adjustSectReputation()
        if (typeof this.sectSystem.getPlayerSect === 'function' &&
            typeof this.sectSystem.adjustSectReputation === 'function') {
            const currentSect = this.sectSystem.getPlayerSect();
            if (typeof currentSect === 'string' && currentSect) {
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
        // SectFactionSystem doesn't expose typed helpers for rivals/allies in the current build,
        // so use a permissive access pattern to avoid compile errors while preserving behavior.
        const getSectRivals = this.sectSystem.getSectRivals;
        const getSectAllies = this.sectSystem.getSectAllies;
        if (typeof getSectRivals === 'function' && typeof getSectAllies === 'function') {
            const rivalIds = getSectRivals(sectId) || [];
            const allyIds = getSectAllies(sectId) || [];
            rivalIds.forEach((rivalId) => {
                if (typeof this.rivalSystem.updateRivalRelationship === 'function') {
                    this.rivalSystem.updateRivalRelationship(rivalId, -20);
                }
            });
            allyIds.forEach((allyId) => {
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
        const getFactionEnemies = this.sectSystem.getFactionEnemies;
        const adjustFactionStanding = this.sectSystem.adjustFactionStanding;
        if (typeof getFactionEnemies === 'function' && typeof adjustFactionStanding === 'function') {
            const factions = getFactionEnemies(result.participants[0]) || [];
            const reputationChange = result.winner === 'player' ? 5 : -5;
            factions.forEach((factionId) => {
                adjustFactionStanding(factionId, reputationChange);
            });
        }
    }
    applyCombatRewards(result, gameState) {
        if (result.rewards.experience) {
            gameState.player.level = (gameState.player.level ?? 0) + Math.floor(result.rewards.experience / 100);
        }
        if (result.rewards.items) {
            gameState.player.inventory.push(...result.rewards.items);
        }
    }
    applyTeachingRewards(result, gameState) {
        if (result.bonusRewards) {
            Object.entries(result.bonusRewards).forEach(([key, value]) => {
                if (key === 'insight') {
                    gameState.player.insight = (gameState.player.insight ?? 0) + value;
                }
                else if (key === 'combatPower') {
                    // If the entity prefers using a computed combatPower, respect that; otherwise, add as-is.
                    if (gameState.player && gameState.player._preferEntityCombatPower) {
                        gameState.player.combatPower = (0, combatConfig_1.computeCombatPower)(gameState.player) ?? (gameState.player.combatPower ?? 0);
                    }
                    else {
                        gameState.player.combatPower = (gameState.player.combatPower ?? 0) + value;
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
        gameState.player.level = (gameState.player.level ?? 0) + 1;
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
    async checkForNewEvents(gameState) {
        const rngFn = (0, rng_1.getRng)(gameState);
        const rng = typeof rngFn === 'function' ? rngFn : (0, rng_1.getRng)(gameState);
        Object.values(gameState.systems.rivals).forEach(rival => {
            if (rng() < 0.1) {
                this.handleRivalEncounter(rival.id, gameState);
            }
        });
        // Hidden encounter checks (rare, high-tier)
        try {
            const hiddenEncountersMod = await Promise.resolve().then(() => __importStar(require('../data/hiddenEncounters'))).catch(() => null);
            const HIDDEN_ENCOUNTERS = hiddenEncountersMod ? hiddenEncountersMod.HIDDEN_ENCOUNTERS || hiddenEncountersMod.default || [] : [];
            const realmHelpersMod = await Promise.resolve().then(() => __importStar(require('../utils/realmHelpers'))).catch(() => null);
            const getRealmIdFromPlayer = realmHelpersMod ? realmHelpersMod.getRealmIdFromPlayer || (() => -1) : (() => -1);
            const playerRealmId = getRealmIdFromPlayer(gameState.player);
            const requiredRealmId = 23;
            if (playerRealmId >= requiredRealmId) {
                gameState.world = gameState.world || {};
                gameState.world.flags = gameState.world.flags || {};
                const lastKidGod = gameState.world.flags.lastKidGodSpawn || 0;
                const kidGodCooldownDays = 365;
                if (!(gameState.world.day && (gameState.world.day - lastKidGod) < kidGodCooldownDays)) {
                    for (const enc of HIDDEN_ENCOUNTERS) {
                        try {
                            if (typeof enc.spawnCondition === 'function' && !enc.spawnCondition(gameState))
                                continue;
                            const chance = typeof enc.chance === 'number' ? enc.chance : 0.01;
                            if (rng() < chance) {
                                try {
                                    const hiddenRivalsMod = await Promise.resolve().then(() => __importStar(require('../data/hiddenRivals'))).catch(() => null);
                                    const HIDDEN_RIVALS = hiddenRivalsMod ? hiddenRivalsMod.HIDDEN_RIVALS || hiddenRivalsMod.default || [] : [];
                                    if (Array.isArray(HIDDEN_RIVALS)) {
                                        for (const rivalTemplate of HIDDEN_RIVALS) {
                                            try {
                                                if (typeof this.rivalSystem.getRival !== 'function')
                                                    continue;
                                                if (!this.rivalSystem.getRival(rivalTemplate.id)) {
                                                    if (typeof this.rivalSystem.addRival === 'function') {
                                                        this.rivalSystem.addRival(JSON.parse(JSON.stringify(rivalTemplate)));
                                                    }
                                                }
                                            }
                                            catch (e) {
                                                // ignore individual rival injection failures
                                            }
                                        }
                                    }
                                }
                                catch (e) {
                                    // ignore injection failure
                                }
                                const encounter = enc.createEncounter(gameState);
                                gameState.systems.rivalEncounters.push(encounter);
                                try {
                                    if (gameState.world && typeof gameState.world.day === 'number') {
                                        gameState.world.flags.lastKidGodSpawn = gameState.world.day;
                                    }
                                    else {
                                        gameState.world.flags.lastKidGodSpawn = Date.now();
                                    }
                                }
                                catch (e) {
                                    void e;
                                }
                                try {
                                    const analyticsMod = await Promise.resolve().then(() => __importStar(require('../systems/Analytics'))).catch(() => null);
                                    if (analyticsMod && analyticsMod.default && typeof analyticsMod.default.record === 'function')
                                        analyticsMod.default.record('hiddenEncounterSpawned', { id: enc.id });
                                }
                                catch (e) { /* ignore */ }
                            }
                        }
                        catch (e) {
                            // ignore per-encounter failures
                        }
                    }
                }
            }
        }
        catch (e) {
            // non-fatal
        }
        if (gameState.player.sect && rngFn() < 0.05) {
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
