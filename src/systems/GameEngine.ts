// Adjust imports to match actual exported members
import { GameState, CombatInstance, CombatResult, RivalEncounter } from '../types';
import { RivalSystem } from './RivalSystem';
import { CombatSystem } from './CombatSystem';
import { computeCombatPower } from './combatConfig';
import { MentorTeachingSystem } from './MentorTeachingSystem';
import { SectFactionSystem as SectSystem } from './SectSystem';
import { MarketSystem } from './MarketSystem';
import { checkQuestCompletion } from './QuestSystem';

// Adjust class to use correct method names and handle missing methods gracefully
export class GameEngine {
  private rivalSystem: RivalSystem;
  private combatSystem: CombatSystem;
  private mentorSystem: MentorTeachingSystem;
  private sectSystem: SectSystem;
  private marketSystem: MarketSystem;

  constructor(
    rivalSystem: RivalSystem,
    combatSystem: CombatSystem,
    mentorSystem: MentorTeachingSystem,
    sectSystem: SectSystem,
    marketSystem: MarketSystem
  ) {
    this.rivalSystem = rivalSystem;
    this.combatSystem = combatSystem;
    this.mentorSystem = mentorSystem;
    this.sectSystem = sectSystem;
    this.marketSystem = marketSystem;
  }

  public handleRivalEncounter(rivalId: string, gameState: GameState): RivalEncounter | null {
    const rival = gameState.systems.rivals[rivalId];
    if (!rival) return null;

    const cooldown = gameState.systems.rivalCooldowns[rivalId];
    if (cooldown && cooldown > gameState.world.day) {
      return null;
    }

    // Use canEncounterRival method instead
    if (typeof this.rivalSystem.canEncounterRival === 'function') {
      const canEncounter = this.rivalSystem.canEncounterRival(rivalId, gameState.world.day);
      if (!canEncounter) return null;

      // Create encounter manually since generateEncounter doesn't exist
      const encounter: RivalEncounter = {
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

  public initiateRivalCombat(rivalId: string, gameState: GameState): CombatInstance | null {
    const rival = gameState.systems.rivals[rivalId];
    if (!rival) return null;

    const combatInstance: CombatInstance = {
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

  public processCombatTurn(action: any, gameState: GameState): CombatResult | null {
    if (!gameState.systems.activeCombat) return null;

    const combat = gameState.systems.activeCombat;

    // For now, create a simple combat result based on action
    // This is a placeholder - in a real implementation, you'd use the CombatSystem
    const result: CombatResult = {
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

  private applyCombatConsequences(result: CombatResult, gameState: GameState): void {
    const combat = gameState.systems.activeCombat;
    if (!combat) return;

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

  public conductTeachingSession(mentorId: string, teachingId: string, gameState: GameState): any {
    if (typeof this.mentorSystem.attemptTeaching === 'function') {
      const result = this.mentorSystem.attemptTeaching(teachingId, gameState);

      if (result.result.success) {
        gameState.systems.teachingProgress[teachingId] = result.updatedProgress!;
        this.applyTeachingRewards(result.result, gameState);
        gameState.player.mentorAffinity[mentorId] =
          (gameState.player.mentorAffinity[mentorId] || 0) + 5;
      }

      return result;
    }

    return null;
  }

  public getAvailableTeachings(mentorId: string, gameState: GameState): any[] {
    if (typeof this.mentorSystem.getAvailableTeachings === 'function') {
      return this.mentorSystem.getAvailableTeachings(mentorId, gameState);
    }
    return [];
  }

  public joinSect(sectId: string, gameState: GameState): boolean {
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

  public completeSectMission(missionId: string, gameState: GameState): void {
    if (typeof this.sectSystem.getCurrentSect === 'function' &&
        typeof this.sectSystem.adjustSectReputation === 'function') {
      const currentSect = this.sectSystem.getCurrentSect();
      if (currentSect) {
        this.sectSystem.adjustSectReputation(currentSect, 10);
      }
    }

    gameState.systems.currentSectMissions =
      gameState.systems.currentSectMissions.filter(id => id !== missionId);

    this.applySectMissionRewards(missionId, gameState);
  }

  public processMarketTransaction(marketId: string, itemId: string, gameState: GameState): boolean {
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

  public getAvailableMarkets(gameState: GameState): any[] {
    return this.marketSystem.getAvailableMarkets(gameState.player);
  }

  public updateQuestProgress(gameState: GameState): string[] {
    const completedQuests = checkQuestCompletion(gameState);

    completedQuests.forEach((questId: string) => {
      this.applyQuestRewards(questId, gameState);
      gameState.story.completedQuests.push(questId);
    });

    return completedQuests;
  }

  private updateRivalRelationshipsForSectChange(sectId: string, _gameState: GameState): void {
    if (typeof this.sectSystem.getSectRivals === 'function' &&
        typeof this.sectSystem.getSectAllies === 'function') {
      const rivalIds = this.sectSystem.getSectRivals(sectId);
      const allyIds = this.sectSystem.getSectAllies(sectId);

      rivalIds.forEach(rivalId => {
        if (typeof this.rivalSystem.updateRivalRelationship === 'function') {
          this.rivalSystem.updateRivalRelationship(rivalId, -20);
        }
      });

      allyIds.forEach(allyId => {
        if (typeof this.rivalSystem.updateRivalRelationship === 'function') {
          this.rivalSystem.updateRivalRelationship(allyId, 10);
        }
      });
    }
  }

  private updateMarketAccessForSect(sectId: string, gameState: GameState): void {
    gameState.world.marketRefreshTimers[sectId] = gameState.world.day;
  }

  private updateSectQuests(_sectId: string, _gameState: GameState): void {
    // Note: getAvailableMissions method doesn't exist, so we'll skip this for now
    // In a real implementation, you'd populate sect quests here
  }

  private updateFactionReputations(result: CombatResult, _gameState: GameState): void {
    if (typeof this.sectSystem.getFactionEnemies === 'function' &&
        typeof this.sectSystem.adjustFactionStanding === 'function') {
      const factions = this.sectSystem.getFactionEnemies(result.participants[0]);
      const reputationChange = result.winner === 'player' ? 5 : -5;

      factions.forEach(factionId => {
        this.sectSystem.adjustFactionStanding(factionId, reputationChange);
      });
    }
  }

  private applyCombatRewards(result: CombatResult, gameState: GameState): void {
    if (result.rewards.experience) {
      gameState.player.level += Math.floor(result.rewards.experience / 100);
    }

    if (result.rewards.items) {
      gameState.player.inventory.push(...result.rewards.items);
    }
  }

  private applyTeachingRewards(result: any, gameState: GameState): void {
    if (result.bonusRewards) {
      Object.entries(result.bonusRewards).forEach(([key, value]) => {
        if (key === 'insight') {
          gameState.player.insight += value as number;
        } else if (key === 'combatPower') {
              // If the entity prefers using a computed combatPower, respect that; otherwise, add as-is.
              if (gameState.player && (gameState.player as any)._preferEntityCombatPower) {
                gameState.player.combatPower = computeCombatPower(gameState.player);
              } else {
                gameState.player.combatPower += value as number;
              }
            }
      });
    }
  }

  private applySectMissionRewards(missionId: string, gameState: GameState): void {
    gameState.player.reputation[missionId] =
      (gameState.player.reputation[missionId] || 0) + 10;
  }

  private applyQuestRewards(questId: string, gameState: GameState): void {
    // Apply rewards for completed quest
    // This is a placeholder - in a real implementation, you'd look up quest rewards
    gameState.player.level += 1;
    // Note: experience property may not exist on PlayerState, so we'll skip it for now
  }

  private updateFactionStandingForMarket(_marketId: string, _gameState: GameState): void {
    // Market transactions can affect faction standings (placeholder)
    // placeholder
  }

  public advanceTime(days: number, gameState: GameState): void {
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

  private checkForNewEvents(gameState: GameState): void {
    Object.values(gameState.systems.rivals).forEach(rival => {
      if (Math.random() < 0.1) {
        this.handleRivalEncounter(rival.id, gameState);
      }
    });

    if (gameState.player.sect && Math.random() < 0.05) {
      this.generateSectMission(gameState);
    }
  }

  private generateSectMission(gameState: GameState): void {
    const mission = {
      id: `sect_mission_${Date.now()}`,
      title: 'Sect Mission',
      description: 'Complete this mission for your sect',
      type: 'sect'
    };

    gameState.systems.currentSectMissions.push(mission.id);
  }
}
