"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkQuestCompletion = checkQuestCompletion;
const realmHelpers_1 = require("../utils/realmHelpers");
/**
 * Checks if a single quest objective is met by the current player state.
 */
function isObjectiveMet(objective, player) {
    switch (objective.type) {
        case 'REACH_REALM': {
            // Assumes objective.value is the string name of the realm.
            // Use ES import for browser-safe code (see top-level import in file)
            return (0, realmHelpers_1.getRealmKeyFromPlayer)(player) === objective.value;
        }
        case 'HAVE_STAT': {
            const stat = objective.target;
            // Ensure the stat exists and is a number before comparing.
            return typeof player[stat] === 'number' && player[stat] >= objective.value;
        }
        case 'COLLECT_ITEM': {
            const itemCount = player.inventory
                .filter(item => item.id === objective.target)
                .reduce((sum, item) => sum + (item.quantity || 1), 0);
            return itemCount >= objective.value;
        }
        case 'SKILL_LEVEL': {
            const skill = player.skills[objective.target];
            return skill && skill.level >= objective.value;
        }
        case 'DEFEAT_RIVAL':
            // This assumes a `defeatedRivals` array exists on the player state.
            // This could also check a flag in the `world` or `story` state.
            return player.defeatedRivals?.includes(objective.target) ?? false;
        default:
            return false;
    }
}
/**
 * Iterates through active quests and checks for completion based on the current game state.
 * @param gameState An object containing the player and story state.
 * @returns An array of quest IDs that have been completed.
 */
function checkQuestCompletion(gameState) {
    const { player, story } = gameState;
    const completedQuestIds = [];
    // Assuming `story.quests` is the source of all quests.
    const activeQuests = (story.quests || []).filter((q) => q.status === 'active');
    for (const quest of activeQuests) {
        const allObjectivesMet = quest.objectives.every((obj) => {
            // An objective is met if it's already marked complete or if the current state satisfies it.
            return obj.isCompleted || isObjectiveMet(obj, player);
        });
        if (allObjectivesMet) {
            completedQuestIds.push(quest.id);
        }
    }
    return completedQuestIds;
}
