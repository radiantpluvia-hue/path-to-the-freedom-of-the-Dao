import { GameState } from '@/types';
import { Quest, QuestObjective } from '@/systems/QuestSystem';
import { runtimeRng } from '../utils/seededRng';

// A list of possible sect mission templates.
const sectMissionTemplates: Omit<Quest, 'id' | 'status' | 'objectives' | 'type'>[] = [
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
export function generateSectMission(_player: GameState['player'], rng?: () => number): Quest {
  const realRng = rng || runtimeRng;
  const pick = (arr: any[]) => arr[Math.floor(realRng() * arr.length)];
  const template = pick(sectMissionTemplates);
  const objectiveTemplate = pick(missionObjectives.COLLECT_ITEM);

  const newObjective: QuestObjective = {
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