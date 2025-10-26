import { GameState } from '@/types';
import { PlaytestScaling } from '@/utils/playtestScaling';
import * as RelicRegistry from '@/systems/relicRegistry';
import { getRealmKeyFromPlayer } from '../utils/realmHelpers';

export type QuestStatus = 'inactive' | 'active' | 'completed' | 'failed';
export type QuestType = 'main' | 'side' | 'sect' | 'daily' | 'achievement';
export type QuestDifficulty = 'trivial' | 'easy' | 'normal' | 'hard' | "D";

export type ObjectiveType =
  | 'REACH_REALM'
  | 'HAVE_STAT'
  | 'COLLECT_ITEM'
  | 'SKILL_LEVEL'
  | 'DEFEAT_RIVAL'
  | 'CULTIVATE_TIMES'
  | 'SPEND_CURRENCY'
  | 'JOIN_SECT'
  | 'COMPLETE_BREAKTHROUGH'
  | 'WIN_BATTLES';

export interface QuestReward {
  type: 'stat' | 'skill' | 'item' | 'currency' | 'reputation' | 'unlock';
  target: string;
  amount: number;
  description: string;
}

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: string;
  value: number | string;
  currentProgress?: number;
  isCompleted: boolean;
  isOptional?: boolean;
  rewards?: QuestReward[];
}

export interface EnhancedQuest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  objectives: QuestObjective[];
  status: QuestStatus;
  rewards: QuestReward[];
  prerequisites?: string[]; // Quest IDs that must be completed first
  timeLimit?: number; // Time limit in game days
  startedAt?: number; // Timestamp when quest was started
  completedAt?: number; // Timestamp when quest was completed
  experience: number; // XP reward for completion
  isRepeatable?: boolean;
  cooldownDays?: number; // Days before quest can be repeated
  lastCompletedAt?: number; // For repeatable quests
}

export class EnhancedQuestSystem {
  private quests: Map<string, EnhancedQuest> = new Map();
  private completionCallbacks: Map<string, (quest: EnhancedQuest, gameState: GameState) => void> = new Map();

  constructor() {
    this.initializeDefaultQuests();
  }

  private initializeDefaultQuests() {
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

  addQuest(quest: EnhancedQuest): void {
    this.quests.set(quest.id, quest);
  }

  getQuest(questId: string): EnhancedQuest | undefined {
    return this.quests.get(questId);
  }

  getAllQuests(): EnhancedQuest[] {
    return Array.from(this.quests.values());
  }

  getQuestsByType(type: QuestType): EnhancedQuest[] {
    return Array.from(this.quests.values()).filter(quest => quest.type === type);
  }

  getActiveQuests(): EnhancedQuest[] {
    return Array.from(this.quests.values()).filter(quest => quest.status === 'active');
  }

  getAvailableQuests(gameState: GameState): EnhancedQuest[] {
    return Array.from(this.quests.values()).filter(quest => 
      quest.status === 'inactive' && this.arePrerequisitesMet(quest, gameState)
    );
  }

  private arePrerequisitesMet(quest: EnhancedQuest, gameState: GameState): boolean {
    if (!quest.prerequisites) return true;
    
    return quest.prerequisites.every(prereqId => 
      gameState.story.completedQuests.includes(prereqId)
    );
  }

  activateQuest(questId: string, gameState: GameState): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'inactive') return false;
    
    if (!this.arePrerequisitesMet(quest, gameState)) return false;
    
    quest.status = 'active';
    quest.startedAt = Date.now();
    
    return true;
  }

  updateObjectiveProgress(questId: string, objectiveId: string, progress: number): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') return false;
    
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return false;
    
    objective.currentProgress = progress;
    
    // Check if objective is completed
    if (progress >= (objective.value as number)) {
      objective.isCompleted = true;
    }
    
    return true;
  }

  checkQuestCompletion(gameState: GameState): { completed: EnhancedQuest[], updated: EnhancedQuest[] } {
    const completedQuests: EnhancedQuest[] = [];
    const updatedQuests: EnhancedQuest[] = [];
    
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
          if (!objective.isCompleted && newProgress >= (objective.value as number)) {
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

  private calculateObjectiveProgress(objective: QuestObjective, gameState: GameState): number {
    const { player } = gameState;
    
    switch (objective.type) {
      case 'REACH_REALM': {
        // Use normalized realm key (supports legacy string realm or numeric realmId)
        const playerRealmKey = getRealmKeyFromPlayer(player as any);
        return playerRealmKey === objective.value ? 1 : 0;
      }
        
      case 'HAVE_STAT': {
        const statValue = (player as any)[objective.target];
        return typeof statValue === 'number' ? Math.min(statValue, objective.value as number) : 0;
      }
        
      case 'COLLECT_ITEM': {
        const itemCount = player.inventory
          .filter(item => item.id === objective.target)
          .reduce((sum, item) => sum + (item.quantity || 1), 0);
        return Math.min(itemCount, objective.value as number);
      }
        
      case 'SKILL_LEVEL': {
        if (objective.target === 'any') {
          const maxSkillLevel = Math.max(...Object.values(player.skills).map(skill => skill.level));
          return Math.min(maxSkillLevel, objective.value as number);
        } else {
          const skill = player.skills[objective.target];
          return skill ? Math.min(skill.level, objective.value as number) : 0;
        }
      }
        
      case 'DEFEAT_RIVAL': {
        const defeatedCount = player.defeatedRivals?.length || 0;
        return Math.min(defeatedCount, objective.value as number);
      }
        
      case 'CULTIVATE_TIMES':
        // This would need to be tracked separately in game state
        return (player as any).dailyCultivationCount || 0;
        
      case 'JOIN_SECT':
        return player.sect ? 1 : 0;
        
      case 'COMPLETE_BREAKTHROUGH':
        // This would need to be tracked in game state
        return (player as any).breakthroughsCompleted || 0;
        
      case 'WIN_BATTLES':
        // This would need to be tracked in game state
        return (player as any).battlesWon || 0;
        
      default:
        return 0;
    }
  }

  private grantObjectiveRewards(objective: QuestObjective, gameState: GameState): void {
    if (!objective.rewards) return;
    
    for (const reward of objective.rewards) {
      this.applyReward(reward, gameState);
    }
  }

  private grantQuestRewards(quest: EnhancedQuest, gameState: GameState): void {
    const { player } = gameState;
    
    // Grant experience
    if (quest.experience > 0) {
      player.experience = (player.experience || 0) + quest.experience;
    }
    
    // Apply scaled rewards
    const scaledRewards = PlaytestScaling.applyScaledEffects(
      { rewards: quest.rewards }, 
      { source: 'quest' as const }
    );
    
    for (const reward of scaledRewards.rewards || quest.rewards) {
      this.applyReward(reward, gameState);
    }
  }

  private applyReward(reward: QuestReward, gameState: GameState): void {
    const { player } = gameState;
    
    // Runtime shim: some tests create rewards with type 'relic' even though the
    // static QuestReward union doesn't include it. Support that shape here.
    try {
      const maybeType: any = (reward as any).type;
      if (maybeType === 'relic') {
        const rid = String((reward as any).target || '');
        try { RelicRegistry.claimRelic(rid); } catch (e) { /* ignore */ }
        try {
          const eq = RelicRegistry.relicToEquipment(rid);
          if (eq) {
            const pp: any = player as any;
            if (!pp.equipment) pp.equipment = { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null };
            if (!pp.equipment[eq.slot]) {
              const updated = RelicRegistry.equipRelicOnPlayer(pp, rid);
              gameState.player = updated as any;
            }
          }
        } catch (e) { /* non-fatal */ }
        return;
      }
    } catch (e) { /* ignore */ }

    switch (reward.type) {
      default:
        break;
      case 'stat':
        (player as any)[reward.target] = ((player as any)[reward.target] || 0) + reward.amount;
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
        } else {
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
              const pp: any = player as any;
              if (!pp.equipment) pp.equipment = { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null };
              if (!pp.equipment[eq.slot]) {
                const updated = RelicRegistry.equipRelicOnPlayer(pp, rid);
                gameState.player = updated as any;
              }
            }
          }
        } catch (e) { /* non-fatal */ }
        break;
      }
        
      case 'currency':
        if (reward.target === 'yuan') {
          player.yuan = (player.yuan || 0) + reward.amount;
        } else if (reward.target === 'spirit_stones') {
          // Add to low-grade stones by default
          player.spiritStones = { ...player.spiritStones, low: (player.spiritStones?.low || 0) + reward.amount } as any;
        }
        break;
        
      case 'reputation':
        if (reward.target === 'world') {
          // player.reputation is an object; increase a 'world' key instead
          player.reputation = player.reputation || {} as any;
          player.reputation['world'] = (player.reputation['world'] || 0) + reward.amount;
        } else if (player.sect && reward.target === 'sect') {
          player.sectReputations[player.sect] = (player.sectReputations[player.sect] || 0) + reward.amount;
        }
        break;
        
      case 'unlock':
        // Set unlock flags
        gameState.story.storyFlags[reward.target] = true;
        break;
    }
  }

  private activateFollowUpQuests(completedQuest: EnhancedQuest, gameState: GameState): void {
    // Find quests that have this quest as a prerequisite
    const followUpQuests = Array.from(this.quests.values()).filter(quest =>
      quest.status === 'inactive' && 
      quest.prerequisites?.includes(completedQuest.id) &&
      this.arePrerequisitesMet(quest, gameState)
    );
    
    for (const quest of followUpQuests) {
      this.activateQuest(quest.id, gameState);
    }
  }

  setCompletionCallback(questId: string, callback: (quest: EnhancedQuest, gameState: GameState) => void): void {
    this.completionCallbacks.set(questId, callback);
  }

  getQuestProgress(questId: string): { completed: number; total: number; percentage: number } {
    const quest = this.quests.get(questId);
    if (!quest) return { completed: 0, total: 0, percentage: 0 };
    
    const requiredObjectives = quest.objectives.filter(obj => !obj.isOptional);
    const completedObjectives = requiredObjectives.filter(obj => obj.isCompleted);
    
    return {
      completed: completedObjectives.length,
      total: requiredObjectives.length,
      percentage: requiredObjectives.length > 0 ? (completedObjectives.length / requiredObjectives.length) * 100 : 0
    };
  }

  getObjectiveProgress(questId: string, objectiveId: string): { current: number; target: number; percentage: number } {
    const quest = this.quests.get(questId);
    if (!quest) return { current: 0, target: 0, percentage: 0 };
    
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return { current: 0, target: 0, percentage: 0 };
    
    const current = objective.currentProgress || 0;
    const target = objective.value as number;
    
    return {
      current,
      target,
      percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0
    };
  }
}