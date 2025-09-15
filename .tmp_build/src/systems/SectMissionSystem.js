"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSectMission = generateSectMission;
const seededRng_1 = require("../utils/seededRng");
// A list of possible sect mission templates.
const sectMissionTemplates = [
    {
        title: 'Herb Collection',
        description: 'The sect requires more herbs for alchemy. Collect the required amount.',
    },
    {
        title: 'Spiritual Hunt',
        description: 'Lesser beasts are overpopulating a nearby spiritual ground. Thin their numbers.',
    },
    {
        title: 'Alchemical Task',
        description: 'An elder requires a specific pill to be crafted. Your alchemy skills are needed.',
    },
];
// A list of possible objectives for the missions.
const missionObjectives = {
    COLLECT_ITEM: [
        { target: 'spirit_herb', description: 'Collect 5 Spirit Herbs.', value: 5 },
        { target: 'beast_core_low', description: 'Collect 3 Low-Grade Beast Cores.', value: 3 },
    ],
};
/**
 * Generates a random sect mission for the player.
 * @param player The current player state.
 * @returns A new Quest object representing the sect mission.
 */
function generateSectMission(_player, rng) {
    const realRng = rng || seededRng_1.runtimeRng;
    const pick = (arr) => arr[Math.floor(realRng() * arr.length)];
    const template = pick(sectMissionTemplates);
    const objectiveTemplate = pick(missionObjectives.COLLECT_ITEM);
    const newObjective = {
        id: `obj_${Date.now()}`,
        type: 'COLLECT_ITEM',
        description: objectiveTemplate.description,
        target: objectiveTemplate.target,
        value: objectiveTemplate.value,
        isCompleted: false,
    };
    return {
        id: `sect_mission_${Date.now()}`,
        title: template.title,
        description: template.description,
        status: 'active',
        objectives: [newObjective],
    };
}
