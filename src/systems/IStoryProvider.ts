import { GameState } from '../types';
import { Quest } from './QuestSystem';

export interface IStoryProvider {
  getCurrentAct?: (gameState: GameState) => any | null;
  getPersonalizedAct?: (gameState: GameState) => any | null;
  getActiveQuests?: (gameState: GameState) => Quest[];
  getAvailableEvents?: (gameState: GameState) => any[];
  triggerEvent?: (eventId: string, gameState: GameState) => any | null;
  makeChoice?: (eventId: string, choiceId: string, gameState: GameState) => boolean;
  checkQuestCompletion?: (gameState: GameState) => string[];
  addQuest?: (actId: string, quest: Quest, isMain?: boolean) => boolean;
  addEvent?: (actId: string, event: any) => boolean;
  getAvailableActs?: (gameState: GameState) => any[];
  getActsForUI?: (gameState: GameState) => any[];
  progressToNextAct?: (gameState: GameState) => boolean;
}

export default IStoryProvider;
