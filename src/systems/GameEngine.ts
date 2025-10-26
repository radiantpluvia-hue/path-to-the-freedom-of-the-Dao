// Adjust imports to match actual exported members
import { GameState, CombatInstance, CombatResult, RivalEncounter } from '../types';
import type { RivalSystem } from './RivalSystem';
import type { CombatSystem } from './CombatSystem';
import { computeCombatPower } from './combatConfig';
import type { MentorTeachingSystem } from './MentorTeachingSystem';
import type { SectFactionSystem as SectSystem } from './SectSystem';
import type { MarketSystem } from './MarketSystem';
import { checkQuestCompletion } from './QuestSystem';
// domainSystem is not required at module runtime here; keep code minimal to avoid
// pulling unnecessary runtime modules into the client bundle.
import { getRng } from '../utils/rng';

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
        const upd = result.updatedProgress;
        if (typeof upd !== 'undefined') {
          gameState.systems.teachingProgress[teachingId] = upd;
        }
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
    // SectFactionSystem exposes getPlayerSect() and adjustSectReputation()
    if (typeof (this.sectSystem as any).getPlayerSect === 'function' &&
        typeof (this.sectSystem as any).adjustSectReputation === 'function') {
      const currentSect = (this.sectSystem as any).getPlayerSect();
      if (typeof currentSect === 'string' && currentSect) {
        (this.sectSystem as any).adjustSectReputation(currentSect, 10);
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
    // SectFactionSystem doesn't expose typed helpers for rivals/allies in the current build,
    // so use a permissive access pattern to avoid compile errors while preserving behavior.
    const getSectRivals = (this.sectSystem as any).getSectRivals;
    const getSectAllies = (this.sectSystem as any).getSectAllies;
    if (typeof getSectRivals === 'function' && typeof getSectAllies === 'function') {
      const rivalIds: string[] = getSectRivals(sectId) || [];
      const allyIds: string[] = getSectAllies(sectId) || [];

      rivalIds.forEach((rivalId: string) => {
        if (typeof this.rivalSystem.updateRivalRelationship === 'function') {
          this.rivalSystem.updateRivalRelationship(rivalId, -20);
        }
      });

      allyIds.forEach((allyId: string) => {
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
    const getFactionEnemies = (this.sectSystem as any).getFactionEnemies;
    const adjustFactionStanding = (this.sectSystem as any).adjustFactionStanding;
    if (typeof getFactionEnemies === 'function' && typeof adjustFactionStanding === 'function') {
      const factions: string[] = getFactionEnemies(result.participants[0]) || [];
      const reputationChange = result.winner === 'player' ? 5 : -5;

      factions.forEach((factionId: string) => {
        adjustFactionStanding(factionId, reputationChange);
      });
    }
  }

  private applyCombatRewards(result: CombatResult, gameState: GameState): void {
    if (result.rewards.experience) {
      gameState.player.level = (gameState.player.level ?? 0) + Math.floor(result.rewards.experience / 100);
    }

    if (result.rewards.items) {
      gameState.player.inventory.push(...result.rewards.items);
    }
  }

  private applyTeachingRewards(result: any, gameState: GameState): void {
    if (result.bonusRewards) {
      Object.entries(result.bonusRewards).forEach(([key, value]) => {
        if (key === 'insight') {
    gameState.player.insight = (gameState.player.insight ?? 0) + (value as number);
        } else if (key === 'combatPower') {
              // If the entity prefers using a computed combatPower, respect that; otherwise, add as-is.
              if (gameState.player && (gameState.player as any)._preferEntityCombatPower) {
                gameState.player.combatPower = computeCombatPower(gameState.player) ?? (gameState.player.combatPower ?? 0);
              } else {
                gameState.player.combatPower = (gameState.player.combatPower ?? 0) + (value as number);
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
  gameState.player.level = (gameState.player.level ?? 0) + 1;
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

  private async checkForNewEvents(gameState: GameState): Promise<void> {
  const rngFn = getRng(gameState);
  const rng = typeof rngFn === 'function' ? rngFn : getRng(gameState);
    Object.values(gameState.systems.rivals).forEach(rival => {
      if (rng() < 0.1) {
        this.handleRivalEncounter(rival.id, gameState);
      }
    });

    // Hidden encounter checks (rare, high-tier)
    try {
      const hiddenEncountersMod = await import('../data/hiddenEncounters').catch(() => null);
      const HIDDEN_ENCOUNTERS = hiddenEncountersMod ? (hiddenEncountersMod as any).HIDDEN_ENCOUNTERS || (hiddenEncountersMod as any).default || [] : [];
      const realmHelpersMod = await import('../utils/realmHelpers').catch(() => null);
      const getRealmIdFromPlayer = realmHelpersMod ? (realmHelpersMod as any).getRealmIdFromPlayer || (() => -1) : (() => -1);
      const playerRealmId = getRealmIdFromPlayer(gameState.player as any);
      const requiredRealmId = 23;
      if (playerRealmId >= requiredRealmId) {
        gameState.world = gameState.world || {};
        gameState.world.flags = gameState.world.flags || {};
        const lastKidGod = gameState.world.flags.lastKidGodSpawn || 0;
        const kidGodCooldownDays = 365;
        if (!(gameState.world.day && (gameState.world.day - lastKidGod) < kidGodCooldownDays)) {
          for (const enc of HIDDEN_ENCOUNTERS) {
            try {
              if (typeof enc.spawnCondition === 'function' && !enc.spawnCondition(gameState)) continue;
              const chance = typeof enc.chance === 'number' ? enc.chance : 0.01;
              if (rng() < chance) {
                try {
                  const hiddenRivalsMod = await import('../data/hiddenRivals').catch(() => null);
                  const HIDDEN_RIVALS = hiddenRivalsMod ? (hiddenRivalsMod as any).HIDDEN_RIVALS || (hiddenRivalsMod as any).default || [] : [];
                  if (Array.isArray(HIDDEN_RIVALS)) {
                    for (const rivalTemplate of HIDDEN_RIVALS) {
                      try {
                        if (typeof (this.rivalSystem as any).getRival !== 'function') continue;
                        if (!(this.rivalSystem as any).getRival(rivalTemplate.id)) {
                          if (typeof (this.rivalSystem as any).addRival === 'function') {
                            (this.rivalSystem as any).addRival(JSON.parse(JSON.stringify(rivalTemplate)));
                          }
                        }
                      } catch (e) {
                        // ignore individual rival injection failures
                      }
                    }
                  }
                } catch (e) {
                  // ignore injection failure
                }

                const encounter = enc.createEncounter(gameState);
                gameState.systems.rivalEncounters.push(encounter);
                try {
                  if (gameState.world && typeof gameState.world.day === 'number') {
                    gameState.world.flags.lastKidGodSpawn = gameState.world.day;
                  } else {
                    gameState.world.flags.lastKidGodSpawn = Date.now();
                  }
                } catch (e) { void e; }
                try {
                  const analyticsMod = await import('../systems/Analytics').catch(() => null);
                  if (analyticsMod && analyticsMod.default && typeof analyticsMod.default.record === 'function') analyticsMod.default.record('hiddenEncounterSpawned', { id: enc.id });
                } catch (e) { /* ignore */ }
              }
            } catch (e) {
              // ignore per-encounter failures
            }
          }
        }
      }
    } catch (e) {
      // non-fatal
    }

    if (gameState.player.sect && rngFn() < 0.05) {
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
