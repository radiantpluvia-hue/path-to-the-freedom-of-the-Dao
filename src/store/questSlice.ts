import { StateCreator } from 'zustand';
import { GameState } from '@/types';
import { generateSectMission } from '@/systems';

// Local Quest types to match current systems
export type QuestStatus = 'inactive' | 'active' | 'completed' | 'failed';
export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  rewards?: {
    spiritStones?: { low?: number; mid?: number; high?: number };
    items?: { id?: string; name: string; description: string; quantity?: number }[];
  }
}

export interface StoryEvent {
  title: string;
  description: string;
  choices: Array<{ text: string; narrative?: string; effects?: Record<string, any> }>;
}

export interface QuestSlice {
  updateQuestStatus: (questId: string, status: Quest['status']) => void;
  requestSectMission: () => void;
  seekRefuge: () => void;
}

export const createQuestSlice: StateCreator<GameState, [], [], QuestSlice> = (set, get) => ({
  /**
   * Updates the status of a quest and grants rewards if completed.
   */
  updateQuestStatus: (questId, status) => {
  const { story, player } = get();
  const store = get() as any;
  const addEventLog = typeof store.addEventLog === 'function' ? store.addEventLog : () => {};
    const quests = story.quests || [];
    const quest = quests.find((q: Quest) => q.id === questId);

    if (!quest || quest.status === status) {
      return; // No change if quest not found or status is the same
    }

    const updatedQuests = quests.map((q: Quest) =>
      q.id === questId ? { ...q, status } : q
    );

    if (status === 'completed' && quest.rewards) {
      const { spiritStones, items } = quest.rewards;
      const newPlayerState = { ...player };

      // Grant Spirit Stones (immutable update)
      if (spiritStones) {
        newPlayerState.spiritStones = {
          low: newPlayerState.spiritStones.low + (spiritStones.low || 0),
          mid: newPlayerState.spiritStones.mid + (spiritStones.mid || 0),
          high: newPlayerState.spiritStones.high + (spiritStones.high || 0),
        };
        addEventLog(`You received Spirit Stones! (L: ${spiritStones.low || 0}, M: ${spiritStones.mid || 0}, H: ${spiritStones.high || 0})`);
      }

      // Grant Items (immutable update)
      if (items) {
        const newInventory = [...newPlayerState.inventory];
        items.forEach((rewardItem: { id?: string; name: string; description: string; quantity?: number }) => {
          const existingItemIndex = newInventory.findIndex(invItem => invItem.id === rewardItem.id);
          if (existingItemIndex > -1) {
            const updatedItem = { ...newInventory[existingItemIndex] };
            updatedItem.quantity = (updatedItem.quantity || 1) + (rewardItem.quantity || 1);
            newInventory[existingItemIndex] = updatedItem;
          } else {
            newInventory.push({ ...rewardItem, quantity: rewardItem.quantity || 1 });
          }
          addEventLog(`You received: ${rewardItem.name} x${rewardItem.quantity || 1}.`);
        });
        newPlayerState.inventory = newInventory;
      }

      addEventLog(`Quest Completed: ${quest.title}`);
      set({ story: { ...story, quests: updatedQuests }, player: newPlayerState });
    } else {
      // Default update without rewards
      set({ story: { ...story, quests: updatedQuests } });
    }
  },
  /**
   * Updates the status of a quest and logs a completion message.
   */


  /**
   * Generates a new sect mission if the player is in a sect and doesn't have an active one.
   */
  requestSectMission: () => {
  const { player, story } = get();
  const store = get() as any;
  const addEventLog = typeof store.addEventLog === 'function' ? store.addEventLog : () => {};

    if (!player.sect) {
      addEventLog("You are not part of a sect. You cannot request a mission.");
      return;
    }

    const hasActiveSectMission = (story.quests || []).some(
      (q: Quest) => q.id.startsWith('sect_mission_') && q.status === 'active'
    );

    if (hasActiveSectMission) {
      addEventLog("You already have an active sect mission. Complete it first.");
      return;
    }

    const newMission = generateSectMission(player);

    set(state => ({
      story: {
        ...state.story,
        quests: [...(state.story.quests || []), newMission],
      },
    }));

    addEventLog(`New Sect Mission: You have been tasked with "${newMission.title}".`);
  },

  /**
   * Triggers a story event for a player who has been expelled and seeks refuge.
   */
  seekRefuge: () => {
  const store = get() as any;
  const { world } = store;
    const expelledFromSect = world.flags.expelledFrom;

    if (!expelledFromSect) return;

    if (typeof store.addEventLog === 'function') {
      store.addEventLog(`Cast out from the ${expelledFromSect}, you weigh your options.`);
    }

    const refugeEvent: StoryEvent = {
      title: "A Fork in the Road",
      description: `You are a wanderer now, a cultivator without a sect. The world is vast and dangerous. What will you do?`,
      choices: [
        {
          text: "Become a rogue cultivator, living by your own rules.",
          narrative: "You decide to forge your own path, free from the constraints of any sect. The life of a rogue cultivator will be difficult, but your destiny is your own.",
          effects: { setFlag: { path: 'rogue_cultivator' } }
        },
        {
          text: "Seek out a rival sect, offering your services and secrets.",
          narrative: "Vengeance burns in your heart. You will find your former sect's rivals and offer them your allegiance... for a price.",
          effects: { setFlag: { path: 'sect_betrayer' } }
        }
      ]
    };

    if (typeof store.setUIProperty === 'function') {
      store.setUIProperty('activeStoryChoice', refugeEvent);
    }
  },
});