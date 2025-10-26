"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionSystem = void 0;
exports.reportMissionObjectiveProgress = reportMissionObjectiveProgress;
const missionTemplateRegistry_1 = require("./missionTemplateRegistry");
class MissionSystem {
    constructor() {
        this.missionTemplates = [
            {
                title: 'Herb Collection',
                description: 'The sect requires rare herbs for alchemy. Venture to the Misty Valley to collect them.',
                type: 'gather',
                target: 'spirit_herbs',
                location: 'Misty Valley',
                baseReward: { spiritStones: { low: 50 }, sectReputation: 10 },
                difficulty: 'easy',
                requirements: { sectRequired: true }
            },
            {
                title: 'Beast Core Hunt',
                description: 'Lesser beasts are threatening nearby villages. Hunt them for their cores.',
                type: 'defeat',
                target: 'shadow_wolves',
                location: 'Dark Forest',
                baseReward: { spiritStones: { low: 75 }, karma: 5 },
                difficulty: 'medium',
                requirements: { minLevel: 5, sectRequired: true }
            },
            {
                title: 'Merchant Escort',
                description: 'A wealthy merchant needs protection on the dangerous mountain pass.',
                type: 'escort',
                target: 'merchant_caravan',
                location: 'Mountain Pass',
                baseReward: { spiritStones: { mid: 20 }, sectReputation: 15 },
                difficulty: 'medium',
                requirements: { minLevel: 8, sectRequired: true }
            },
            {
                title: 'Ancient Ruins Investigation',
                description: 'Strange energies emanate from ancient ruins. Investigate and report your findings.',
                type: 'investigate',
                target: 'ancient_ruins',
                location: 'Forgotten Valley',
                baseReward: { spiritStones: { mid: 30 }, karma: 10 },
                difficulty: 'hard',
                requirements: { minLevel: 12, sectRequired: true }
            },
            {
                title: 'Spiritual Stone Mining',
                description: 'The sect needs more spiritual stones. Mine them from the Crystal Caves.',
                type: 'gather',
                target: 'spiritual_stones',
                location: 'Crystal Caves',
                baseReward: { spiritStones: { low: 100 }, sectReputation: 8 },
                difficulty: 'easy',
                requirements: { sectRequired: true }
            }
        ];
    }
    generateRandomMission(gameState) {
        const { player } = gameState;
        // Filter missions based on requirements
        const availableTemplates = this.missionTemplates.filter(template => {
            if (template.requirements?.sectRequired && !player.sect)
                return false;
            if (template.requirements?.minLevel && player.level < template.requirements.minLevel)
                return false;
            // Add more requirement checks as needed
            return true;
        });
        if (availableTemplates.length === 0)
            return null;
        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        // Scale rewards based on player level and difficulty
        const rewardMultiplier = this.getRewardMultiplier(player.level, template.difficulty);
        const scaledReward = this.scaleReward(template.baseReward, rewardMultiplier);
        return {
            id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: template.title,
            description: template.description,
            type: template.type,
            target: template.target,
            location: template.location,
            reward: scaledReward,
            isCompleted: false
        };
    }
    // Generate a mission from a registered template id. Returns null if template not found.
    generateMissionFromTemplateId(templateId, gameState) {
        try {
            const tpl = (0, missionTemplateRegistry_1.getRegisteredMissionTemplate)(templateId);
            if (!tpl)
                return null;
            const { player } = gameState;
            // simple scaling similar to generateRandomMission
            const rewardMultiplier = this.getRewardMultiplier(player.level || 1, tpl.difficulty || 'easy');
            const scaledReward = this.scaleReward(tpl.baseReward || {}, rewardMultiplier);
            return {
                id: `mission_${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                title: tpl.title,
                description: tpl.description || '',
                type: tpl.type || 'gather',
                target: tpl.target || '',
                location: tpl.location || '',
                reward: scaledReward,
                isCompleted: false
            };
        }
        catch (e) {
            return null;
        }
    }
    attemptMission(missionId, gameState) {
        const { player, story } = gameState;
        const mission = story.activeRandomMissions.find(m => m.id === missionId);
        if (!mission) {
            return {
                success: false,
                message: 'Mission not found.'
            };
        }
        // Calculate success chance based on player stats and mission difficulty
        const successChance = this.calculateSuccessChance(mission, player, gameState);
        const roll = Math.random();
        // Check for rival interference
        const rivalInterference = this.checkRivalInterference(gameState, mission);
        if (roll < successChance && !rivalInterference.interfered) {
            return {
                success: true,
                rewards: mission.reward,
                message: `Successfully completed ${mission.title}! ${this.getSuccessMessage(mission.type)}`
            };
        }
        else {
            const failureMessage = rivalInterference.interfered
                ? `${mission.title} failed due to interference from ${rivalInterference.rivalName}!`
                : `${mission.title} failed. ${this.getFailureMessage(mission.type)}`;
            return {
                success: false,
                consequences: rivalInterference.interfered ? {
                    rivalInterference: true,
                    rivalId: rivalInterference.rivalId,
                    reputationLoss: 5
                } : undefined,
                message: failureMessage
            };
        }
    }
    getRewardMultiplier(playerLevel, _difficulty) {
        const baseMultiplier = Math.max(1, playerLevel / 10);
        const difficultyMultiplier = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.0
        }[_difficulty] || 1.0;
        return baseMultiplier * difficultyMultiplier;
    }
    scaleReward(baseReward, multiplier) {
        const scaled = {};
        if (baseReward.spiritStones) {
            scaled.spiritStones = {};
            if (baseReward.spiritStones.low)
                scaled.spiritStones.low = Math.floor(baseReward.spiritStones.low * multiplier);
            if (baseReward.spiritStones.mid)
                scaled.spiritStones.mid = Math.floor(baseReward.spiritStones.mid * multiplier);
            if (baseReward.spiritStones.high)
                scaled.spiritStones.high = Math.floor(baseReward.spiritStones.high * multiplier);
        }
        if (baseReward.sectReputation)
            scaled.sectReputation = Math.floor(baseReward.sectReputation * multiplier);
        if (baseReward.karma)
            scaled.karma = Math.floor(baseReward.karma * multiplier);
        return scaled;
    }
    calculateSuccessChance(mission, player, _gameState) {
        // Base success chance
        let chance = 0.7;
        // Adjust based on mission type and player stats
        switch (mission.type) {
            case 'gather':
                chance += (player.skills?.gathering || 0) * 0.02;
                break;
            case 'defeat':
                chance += (player.skills?.combat || 0) * 0.02;
                break;
            case 'escort':
                chance += (player.skills?.leadership || 0) * 0.02;
                break;
            case 'investigate':
                chance += (player.skills?.investigation || 0) * 0.02;
                break;
        }
        // Level bonus
        chance += player.level * 0.01;
        // Sect reputation bonus
        if (player.sect && _gameState.player.sectReputations && _gameState.player.sectReputations[player.sect] !== undefined) {
            const rep = _gameState.player.sectReputations[player.sect] || 0;
            chance += Math.min(rep * 0.001, 0.1);
        }
        return Math.min(chance, 0.95); // Cap at 95%
    }
    checkRivalInterference(_gameState, _mission) {
        // _gameState is intentionally unused beyond reading rivals; keep param name prefixed to signal that
        // Rival interference depends on the RivalSystem inside store (systems is not a class registry here)
        const rivals = _gameState.systems?.rivals ? Object.values(_gameState.systems.rivals) : [];
        const hostileRivals = rivals.filter((rival) => rival.relationship < -20);
        if (hostileRivals.length === 0) {
            return { interfered: false };
        }
        // 20% chance of interference from hostile rivals
        if (Math.random() < 0.2) {
            const interferingRival = hostileRivals[Math.floor(Math.random() * hostileRivals.length)];
            return {
                interfered: true,
                rivalId: interferingRival.id,
                rivalName: interferingRival.name
            };
        }
        return { interfered: false };
    }
    getSuccessMessage(type) {
        const messages = {
            gather: 'You successfully collected all required items.',
            defeat: 'You defeated all enemies with skill and precision.',
            escort: 'You safely escorted your charges to their destination.',
            investigate: 'Your investigation uncovered valuable information.'
        };
        return messages[type] || 'Mission completed successfully.';
    }
    getFailureMessage(type) {
        const messages = {
            gather: 'You were unable to find all the required items.',
            defeat: 'The enemies proved too strong for you.',
            escort: 'Your charges were attacked and you failed to protect them.',
            investigate: 'The investigation yielded no useful results.'
        };
        return messages[type] || 'Mission failed.';
    }
    // Generate betrayal missions offered by rivals
    generateBetrayalMission(rival, gameState) {
        const { player } = gameState;
        if (!player.sect || rival.relationship > -30)
            return null;
        const betrayalTemplates = [
            {
                title: 'Sabotage Sect Resources',
                description: 'Destroy sect supplies to weaken their operations.',
                objective: 'sabotage_supplies',
                baseReward: { spiritStones: { mid: 50 }, karma: -20 }
            },
            {
                title: 'Steal Sect Secrets',
                description: 'Infiltrate the sect archives and steal cultivation techniques.',
                objective: 'steal_secrets',
                baseReward: { spiritStones: { mid: 75 }, karma: -30 }
            },
            {
                title: 'Assassinate Sect Elder',
                description: 'Eliminate a key sect elder to create chaos.',
                objective: 'assassinate_elder',
                baseReward: { spiritStones: { high: 25 }, karma: -50 }
            }
        ];
        const template = betrayalTemplates[Math.floor(Math.random() * betrayalTemplates.length)];
        return {
            id: `betrayal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: template.title,
            description: template.description,
            offeredBy: rival.id,
            offeredByName: rival.name,
            targetSect: player.sect,
            objective: template.objective,
            reward: template.baseReward,
            isCompleted: false
        };
    }
}
exports.MissionSystem = MissionSystem;
// Helper: allow external callers (systems/tests) to report progress on a mission objective
function reportMissionObjectiveProgress(missionId, objectiveIndex, delta = 1) {
    try {
        // Resolve the store module at call-time so tests that re-mock the module per-test
        // are correctly observed. Prefer the exported `useGameStore` (Zustand hook) and
        // obtain state via getState() when available.
        let store = null;
        try {
            // Prefer the project path alias so tests that mock '@/store/useGameStore' are respected.
            let mod = null;
            try {
                mod = require('@/store/useGameStore');
            }
            catch (e) { /* ignore */ }
            if (!mod) {
                try {
                    mod = require('../store/useGameStore');
                }
                catch (e) { /* ignore */ }
            }
            const useFn = mod && mod.useGameStore ? mod.useGameStore : mod;
            store = useFn && typeof useFn.getState === 'function' ? useFn.getState() : (typeof useFn === 'function' ? useFn() : null);
        }
        catch (e) { /* ignore */ }
        if (store && typeof store.updateMissionObjectiveProgress === 'function') {
            return store.updateMissionObjectiveProgress(missionId, objectiveIndex, delta);
        }
        // fallback: some tests expose the mocked store on globalThis.gameStore
        try {
            const gs = globalThis.gameStore;
            if (gs && typeof gs.updateMissionObjectiveProgress === 'function') {
                return gs.updateMissionObjectiveProgress(missionId, objectiveIndex, delta);
            }
        }
        catch (e) { /* ignore */ }
    }
    catch (e) { /* ignore */ }
    return false;
}
