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
exports.EnhancedQuestSystem = void 0;
const playtestScaling_1 = require("@/utils/playtestScaling");
const RelicRegistry = __importStar(require("@/systems/relicRegistry"));
const realmHelpers_1 = require("../utils/realmHelpers");
class EnhancedQuestSystem {
    constructor() {
        this.quests = new Map();
        this.completionCallbacks = new Map();
        this.initializeDefaultQuests();
    }
    initializeDefaultQuests() {
        // Main Story Quests
        this.addQuest({
            id: 'first_cultivation',
            title: 'First Steps on the Dao',
            description: 'Begin your cultivation journey by reaching the Qi Gathering realm.',
            type: 'main',
            difficulty: 'easy',
            status: 'active',
            experience: 100,
            objectives: [
                {
                    id: 'reach_qi_gathering',
                    type: 'REACH_REALM',
                    description: 'Reach Qi Gathering realm',
                    target: 'realm',
                    value: 'Qi Gathering',
                    isCompleted: false
                }
            ],
            rewards: [
                {
                    type: 'currency',
                    target: 'yuan',
                    amount: 100,
                    description: '100 Yuan'
                },
                {
                    type: 'item',
                    target: 'basic_cultivation_manual',
                    amount: 1,
                    description: 'Basic Cultivation Manual'
                },
                {
                    type: 'stat',
                    target: 'insight',
                    amount: 10,
                    description: '+10 Insight'
                }
            ]
        });
        this.addQuest({
            id: 'join_sect',
            title: 'Find Your Place',
            description: 'Join a sect to gain access to resources and teachings.',
            type: 'main',
            difficulty: 'normal',
            status: 'inactive',
            experience: 150,
            prerequisites: ['first_cultivation'],
            objectives: [
                {
                    id: 'sect_membership',
                    type: 'JOIN_SECT',
                    description: 'Join any sect',
                    target: 'any',
                    value: 1,
                    isCompleted: false
                }
            ],
            rewards: [
                {
                    type: 'currency',
                    target: 'yuan',
                    amount: 200,
                    description: '200 Yuan'
                },
                {
                    type: 'reputation',
                    target: 'world',
                    amount: 25,
                    description: '+25 World Reputation'
                }
            ]
        });
        // Side Quests
        this.addQuest({
            id: 'first_rival',
            title: 'A Challenger Appears',
            description: 'Defeat your first rival to establish your reputation.',
            type: 'side',
            difficulty: 'normal',
            status: 'inactive',
            experience: 75,
            objectives: [
                {
                    id: 'defeat_first_rival',
                    type: 'DEFEAT_RIVAL',
                    description: 'Defeat any rival',
                    target: 'any',
                    value: 1,
                    isCompleted: false
                }
            ],
            rewards: [
                {
                    type: 'stat',
                    target: 'confidence',
                    amount: 15,
                    description: '+15 Confidence'
                },
                {
                    type: 'currency',
                    target: 'yuan',
                    amount: 50,
                    description: '50 Yuan'
                }
            ]
        });
        // Daily Quests
        this.addQuest({
            id: 'daily_cultivation',
            title: 'Daily Practice',
            description: 'Cultivate 3 times to maintain your progress.',
            type: 'daily',
            difficulty: 'trivial',
            status: 'active',
            experience: 25,
            isRepeatable: true,
            cooldownDays: 1,
            objectives: [
                {
                    id: 'cultivate_three_times',
                    type: 'CULTIVATE_TIMES',
                    description: 'Cultivate 3 times',
                    target: 'cultivation_count',
                    value: 3,
                    currentProgress: 0,
                    isCompleted: false
                }
            ],
            rewards: [
                {
                    type: 'currency',
                    target: 'yuan',
                    amount: 25,
                    description: '25 Yuan'
                },
                {
                    type: 'skill',
                    target: 'meditation',
                    amount: 10,
                    description: '+10 Meditation XP'
                }
            ]
        });
        // Achievement Quests
        this.addQuest({
            id: 'skill_master',
            title: 'Skill Master',
            description: 'Reach level 10 in any skill.',
            type: 'achievement',
            difficulty: 'hard',
            status: 'active',
            experience: 200,
            objectives: [
                {
                    id: 'skill_level_10',
                    type: 'SKILL_LEVEL',
                    description: 'Reach level 10 in any skill',
                    target: 'any',
                    value: 10,
                    isCompleted: false
                }
            ],
            rewards: [
                {
                    type: 'stat',
                    target: 'talent',
                    amount: 20,
                    description: '+20 Talent'
                },
                {
                    type: 'currency',
                    target: 'spirit_stones',
                    amount: 10,
                    description: '10 Spirit Stones'
                },
                {
                    type: 'unlock',
                    target: 'advanced_training',
                    amount: 1,
                    description: 'Unlocks Advanced Training'
                }
            ]
        });
    }
    addQuest(quest) {
        this.quests.set(quest.id, quest);
    }
    getQuest(questId) {
        return this.quests.get(questId);
    }
    getAllQuests() {
        return Array.from(this.quests.values());
    }
    getQuestsByType(type) {
        return Array.from(this.quests.values()).filter(quest => quest.type === type);
    }
    getActiveQuests() {
        return Array.from(this.quests.values()).filter(quest => quest.status === 'active');
    }
    getAvailableQuests(gameState) {
        return Array.from(this.quests.values()).filter(quest => quest.status === 'inactive' && this.arePrerequisitesMet(quest, gameState));
    }
    arePrerequisitesMet(quest, gameState) {
        if (!quest.prerequisites)
            return true;
        return quest.prerequisites.every(prereqId => gameState.story.completedQuests.includes(prereqId));
    }
    activateQuest(questId, gameState) {
        const quest = this.quests.get(questId);
        if (!quest || quest.status !== 'inactive')
            return false;
        if (!this.arePrerequisitesMet(quest, gameState))
            return false;
        quest.status = 'active';
        quest.startedAt = Date.now();
        return true;
    }
    updateObjectiveProgress(questId, objectiveId, progress) {
        const quest = this.quests.get(questId);
        if (!quest || quest.status !== 'active')
            return false;
        const objective = quest.objectives.find(obj => obj.id === objectiveId);
        if (!objective)
            return false;
        objective.currentProgress = progress;
        // Check if objective is completed
        if (progress >= objective.value) {
            objective.isCompleted = true;
        }
        return true;
    }
    checkQuestCompletion(gameState) {
        const completedQuests = [];
        const updatedQuests = [];
        const activeQuests = this.getActiveQuests();
        for (const quest of activeQuests) {
            let questUpdated = false;
            // Update objective progress
            for (const objective of quest.objectives) {
                const oldProgress = objective.currentProgress || 0;
                const newProgress = this.calculateObjectiveProgress(objective, gameState);
                if (newProgress !== oldProgress) {
                    objective.currentProgress = newProgress;
                    questUpdated = true;
                    // Check if objective is now completed
                    if (!objective.isCompleted && newProgress >= objective.value) {
                        objective.isCompleted = true;
                        this.grantObjectiveRewards(objective, gameState);
                    }
                }
            }
            if (questUpdated) {
                updatedQuests.push(quest);
            }
            // Check if all required objectives are completed
            const requiredObjectives = quest.objectives.filter(obj => !obj.isOptional);
            const allRequiredCompleted = requiredObjectives.every(obj => obj.isCompleted);
            if (allRequiredCompleted && quest.status === 'active') {
                quest.status = 'completed';
                quest.completedAt = Date.now();
                completedQuests.push(quest);
                // Grant quest completion rewards
                this.grantQuestRewards(quest, gameState);
                // Add to completed quests list
                if (!gameState.story.completedQuests.includes(quest.id)) {
                    gameState.story.completedQuests.push(quest.id);
                }
                // Execute completion callback if exists
                const callback = this.completionCallbacks.get(quest.id);
                if (callback) {
                    callback(quest, gameState);
                }
                // Activate follow-up quests
                this.activateFollowUpQuests(quest, gameState);
            }
        }
        return { completed: completedQuests, updated: updatedQuests };
    }
    calculateObjectiveProgress(objective, gameState) {
        const { player } = gameState;
        switch (objective.type) {
            case 'REACH_REALM': {
                // Use normalized realm key (supports legacy string realm or numeric realmId)
                const playerRealmKey = (0, realmHelpers_1.getRealmKeyFromPlayer)(player);
                return playerRealmKey === objective.value ? 1 : 0;
            }
            case 'HAVE_STAT': {
                const statValue = player[objective.target];
                return typeof statValue === 'number' ? Math.min(statValue, objective.value) : 0;
            }
            case 'COLLECT_ITEM': {
                const itemCount = player.inventory
                    .filter(item => item.id === objective.target)
                    .reduce((sum, item) => sum + (item.quantity || 1), 0);
                return Math.min(itemCount, objective.value);
            }
            case 'SKILL_LEVEL': {
                if (objective.target === 'any') {
                    const maxSkillLevel = Math.max(...Object.values(player.skills).map(skill => skill.level));
                    return Math.min(maxSkillLevel, objective.value);
                }
                else {
                    const skill = player.skills[objective.target];
                    return skill ? Math.min(skill.level, objective.value) : 0;
                }
            }
            case 'DEFEAT_RIVAL': {
                const defeatedCount = player.defeatedRivals?.length || 0;
                return Math.min(defeatedCount, objective.value);
            }
            case 'CULTIVATE_TIMES':
                // This would need to be tracked separately in game state
                return player.dailyCultivationCount || 0;
            case 'JOIN_SECT':
                return player.sect ? 1 : 0;
            case 'COMPLETE_BREAKTHROUGH':
                // This would need to be tracked in game state
                return player.breakthroughsCompleted || 0;
            case 'WIN_BATTLES':
                // This would need to be tracked in game state
                return player.battlesWon || 0;
            default:
                return 0;
        }
    }
    grantObjectiveRewards(objective, gameState) {
        if (!objective.rewards)
            return;
        for (const reward of objective.rewards) {
            this.applyReward(reward, gameState);
        }
    }
    grantQuestRewards(quest, gameState) {
        const { player } = gameState;
        // Grant experience
        if (quest.experience > 0) {
            player.experience = (player.experience || 0) + quest.experience;
        }
        // Apply scaled rewards
        const scaledRewards = playtestScaling_1.PlaytestScaling.applyScaledEffects({ rewards: quest.rewards }, { source: 'quest' });
        for (const reward of scaledRewards.rewards || quest.rewards) {
            this.applyReward(reward, gameState);
        }
    }
    applyReward(reward, gameState) {
        const { player } = gameState;
        // Runtime shim: some tests create rewards with type 'relic' even though the
        // static QuestReward union doesn't include it. Support that shape here.
        try {
            const maybeType = reward.type;
            if (maybeType === 'relic') {
                const rid = String(reward.target || '');
                try {
                    RelicRegistry.claimRelic(rid);
                }
                catch (e) { /* ignore */ }
                try {
                    const eq = RelicRegistry.relicToEquipment(rid);
                    if (eq) {
                        const pp = player;
                        if (!pp.equipment)
                            pp.equipment = { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null };
                        if (!pp.equipment[eq.slot]) {
                            const updated = RelicRegistry.equipRelicOnPlayer(pp, rid);
                            gameState.player = updated;
                        }
                    }
                }
                catch (e) { /* non-fatal */ }
                return;
            }
        }
        catch (e) { /* ignore */ }
        switch (reward.type) {
            default:
                break;
            case 'stat':
                player[reward.target] = (player[reward.target] || 0) + reward.amount;
                break;
            case 'skill':
                if (!player.skills[reward.target]) {
                    player.skills[reward.target] = { level: 0, exp: 0, expToNext: 100 };
                }
                player.skills[reward.target].exp += reward.amount;
                break;
            case 'item': {
                const existingItem = player.inventory.find(item => item.id === reward.target);
                if (existingItem) {
                    existingItem.quantity = (existingItem.quantity || 1) + reward.amount;
                }
                else {
                    player.inventory.push({
                        id: reward.target,
                        name: reward.target.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        description: reward.description,
                        quantity: reward.amount
                    });
                }
                // If the rewarded item is a relic (id starts with 'relic_'), claim it and auto-equip if possible
                try {
                    if (String(reward.target || '').startsWith('relic_')) {
                        const rid = String(reward.target);
                        // claim in registry
                        RelicRegistry.claimRelic(rid);
                        const eq = RelicRegistry.relicToEquipment(rid);
                        if (eq) {
                            const pp = player;
                            if (!pp.equipment)
                                pp.equipment = { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null };
                            if (!pp.equipment[eq.slot]) {
                                const updated = RelicRegistry.equipRelicOnPlayer(pp, rid);
                                gameState.player = updated;
                            }
                        }
                    }
                }
                catch (e) { /* non-fatal */ }
                break;
            }
            case 'currency':
                if (reward.target === 'yuan') {
                    player.yuan = (player.yuan || 0) + reward.amount;
                }
                else if (reward.target === 'spirit_stones') {
                    // Add to low-grade stones by default
                    player.spiritStones = { ...player.spiritStones, low: (player.spiritStones?.low || 0) + reward.amount };
                }
                break;
            case 'reputation':
                if (reward.target === 'world') {
                    // player.reputation is an object; increase a 'world' key instead
                    player.reputation = player.reputation || {};
                    player.reputation['world'] = (player.reputation['world'] || 0) + reward.amount;
                }
                else if (player.sect && reward.target === 'sect') {
                    player.sectReputations[player.sect] = (player.sectReputations[player.sect] || 0) + reward.amount;
                }
                break;
            case 'unlock':
                // Set unlock flags
                gameState.story.storyFlags[reward.target] = true;
                break;
        }
    }
    activateFollowUpQuests(completedQuest, gameState) {
        // Find quests that have this quest as a prerequisite
        const followUpQuests = Array.from(this.quests.values()).filter(quest => quest.status === 'inactive' &&
            quest.prerequisites?.includes(completedQuest.id) &&
            this.arePrerequisitesMet(quest, gameState));
        for (const quest of followUpQuests) {
            this.activateQuest(quest.id, gameState);
        }
    }
    setCompletionCallback(questId, callback) {
        this.completionCallbacks.set(questId, callback);
    }
    getQuestProgress(questId) {
        const quest = this.quests.get(questId);
        if (!quest)
            return { completed: 0, total: 0, percentage: 0 };
        const requiredObjectives = quest.objectives.filter(obj => !obj.isOptional);
        const completedObjectives = requiredObjectives.filter(obj => obj.isCompleted);
        return {
            completed: completedObjectives.length,
            total: requiredObjectives.length,
            percentage: requiredObjectives.length > 0 ? (completedObjectives.length / requiredObjectives.length) * 100 : 0
        };
    }
    getObjectiveProgress(questId, objectiveId) {
        const quest = this.quests.get(questId);
        if (!quest)
            return { current: 0, target: 0, percentage: 0 };
        const objective = quest.objectives.find(obj => obj.id === objectiveId);
        if (!objective)
            return { current: 0, target: 0, percentage: 0 };
        const current = objective.currentProgress || 0;
        const target = objective.value;
        return {
            current,
            target,
            percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0
        };
    }
}
exports.EnhancedQuestSystem = EnhancedQuestSystem;
