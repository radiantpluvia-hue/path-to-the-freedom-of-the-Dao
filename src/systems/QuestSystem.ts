import { GameState } from '@/types';

// NOTE: These type definitions are for demonstration. Ideally, they would live in a dedicated types file like `src/types/quest.ts`.

export type QuestStatus = 'inactive' | 'active' | 'completed' | 'failed';

export type ObjectiveType =
  | 'REACH_REALM'
  | 'HAVE_STAT'
  | 'COLLECT_ITEM'
  | 'SKILL_LEVEL'
  | 'DEFEAT_RIVAL';

// Define which player stats can be checked. This improves type safety.
export type PlayerStat = 'cultivationPower' | 'insight' | 'karma' | 'age';

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: PlayerStat | keyof GameState['player']['skills'] | string; // e.g., 'cultivationPower', 'alchemy', 'spirit_herb', 'rival_id_123'
  value: number | string; // e.g., stat value, skill level, item quantity, realm name
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  status: QuestStatus;
}

/**
 * Checks if a single quest objective is met by the current player state.
 */
function isObjectiveMet(objective: QuestObjective, player: GameState['player']): boolean {
  switch (objective.type) {
    case 'REACH_REALM': {
      // Assumes objective.value is the string name of the realm.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getRealmKeyFromPlayer } = require('../utils/realmHelpers');
      return getRealmKeyFromPlayer(player as any) === objective.value;
    }

    case 'HAVE_STAT': {
      const stat = objective.target as PlayerStat;
      // Ensure the stat exists and is a number before comparing.
      return typeof player[stat] === 'number' && (player[stat] as number) >= (objective.value as number);
    }

    case 'COLLECT_ITEM': {
      const itemCount = player.inventory
        .filter(item => item.id === objective.target)
        .reduce((sum, item) => sum + (item.quantity || 1), 0);
      return itemCount >= (objective.value as number);
    }

    case 'SKILL_LEVEL': {
      const skill = player.skills[objective.target as keyof GameState['player']['skills']];
      return skill && skill.level >= (objective.value as number);
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
export function checkQuestCompletion(gameState: { player: GameState['player'], story: GameState['story'] }): string[] {
  const { player, story } = gameState;
  const completedQuestIds: string[] = [];

  // Assuming `story.quests` is the source of all quests.
  const activeQuests = (story.quests || []).filter((q: Quest) => q.status === 'active');

  for (const quest of activeQuests) {
    const allObjectivesMet = quest.objectives.every((obj: QuestObjective) => {
      // An objective is met if it's already marked complete or if the current state satisfies it.
      return obj.isCompleted || isObjectiveMet(obj, player);
    });

    if (allObjectivesMet) {
      completedQuestIds.push(quest.id);
    }
  }

  return completedQuestIds;
}