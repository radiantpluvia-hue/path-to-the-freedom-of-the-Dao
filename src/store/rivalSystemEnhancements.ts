// Enhanced Rival System Integration for useGameStore.ts
// This file contains improved implementations of rival relationship management methods

import { RivalSystem, SectFactionSystem } from '@/systems';
import { GameState } from '@/types';

/**
 * Enhanced rival relationship adjustment with improved synchronization
 */
export function adjustRivalRelationshipEnhanced(
  rivalSystem: RivalSystem,
  gameState: GameState,
  rivalId: string,
  change: number,
  currentDay: number
): { success: boolean; newRelationship: number; error?: string } {
  try {
    // Enhanced input validation
    if (!rivalId || typeof rivalId !== 'string' || rivalId.trim() === '') {
      return { success: false, newRelationship: 0, error: 'Invalid rival ID' };
    }

    if (typeof change !== 'number' || isNaN(change) || !isFinite(change)) {
      return { success: false, newRelationship: 0, error: 'Invalid relationship change value' };
    }

    // Clamp change to reasonable bounds to prevent extreme adjustments
    const clampedChange = Math.max(-50, Math.min(50, change));
    if (clampedChange !== change) {
      console.warn(`Relationship change clamped from ${change} to ${clampedChange} for rival ${rivalId}`);
    }

    // Check if rival exists before attempting update
    const existingRival = rivalSystem.getRival(rivalId);
    if (!existingRival) {
      return { success: false, newRelationship: 0, error: `Rival ${rivalId} not found` };
    }

    // Store original relationship for rollback if needed
    const originalRelationship = existingRival.relationship;

    // Update RivalSystem first (single source of truth)
    try {
      rivalSystem.updateRivalRelationship(rivalId, clampedChange, currentDay);
    } catch (error) {
      console.error(`Failed to update rival relationship in RivalSystem for ${rivalId}:`, error);
      return { success: false, newRelationship: originalRelationship, error: 'Failed to update RivalSystem' };
    }

    // Verify the update was successful and get the updated rival
    const updatedRival = rivalSystem.getRival(rivalId);
    if (!updatedRival) {
      console.error(`Rival ${rivalId} disappeared after update attempt`);
      return { success: false, newRelationship: originalRelationship, error: 'Rival disappeared after update' };
    }

  const syncedRelationship = updatedRival.relationship;

    // Validate relationship bounds (RivalSystem should handle this, but double-check)
    const clampedRelationship = Math.max(-100, Math.min(100, syncedRelationship));

    if (clampedRelationship !== syncedRelationship) {
      console.warn(`Relationship for ${rivalId} was clamped from ${syncedRelationship} to ${clampedRelationship}`);
      // Update RivalSystem with clamped value if needed
      try {
        rivalSystem.updateRivalRelationship(rivalId, clampedRelationship - syncedRelationship, currentDay);
      } catch (error) {
        console.error(`Failed to apply relationship clamping for ${rivalId}:`, error);
        // Attempt rollback
        try {
          rivalSystem.updateRivalRelationship(rivalId, originalRelationship - syncedRelationship, currentDay);
        } catch (rollbackError) {
          console.error(`Failed to rollback relationship for ${rivalId}:`, rollbackError);
        }
        return { success: false, newRelationship: originalRelationship, error: 'Failed to apply relationship clamping' };
      }
    }

    return {
      success: true,
      newRelationship: clampedRelationship,
      error: undefined
    };
  } catch (error) {
    console.error(`Error adjusting rival relationship for ${rivalId}:`, error);
    return { success: false, newRelationship: 0, error: `Unexpected error: ${error}` };
  }
}

/**
 * Enhanced faction battle resolution with cascading effects
 */
export function resolveFactionBattleEnhanced(
  rivalSystem: RivalSystem,
  sectFactionSystem: SectFactionSystem,
  battleId: string,
  outcome: 'victory' | 'defeat',
  gameState: GameState
): { success: boolean; effects: any[]; error?: string } {
  try {
    // Update RivalSystem record
    rivalSystem.resolveFactionBattle(battleId, outcome);

    const battleIndex = gameState.player.factionBattles.findIndex(b => b.id === battleId);
    if (battleIndex === -1) {
      return { success: false, effects: [], error: 'Battle not found' };
    }

    const battle = gameState.player.factionBattles[battleIndex];
    const effects: any[] = [];

    // Get the player's faction (first faction in the array)
    const playerFaction = battle.factions[0];
    const enemyFaction = battle.factions[1];

    // Base standing changes
    const baseStandingChange = outcome === 'victory' ? 15 : -10;
    const baseEnemyStandingChange = outcome === 'victory' ? -8 : 5;

    effects.push({
      type: 'faction_standing',
      faction: playerFaction,
      change: baseStandingChange,
      reason: `Faction battle ${outcome}`
    });

    effects.push({
      type: 'faction_standing',
      faction: enemyFaction,
      change: baseEnemyStandingChange,
      reason: `Faction battle ${outcome}`
    });

    // Sect reputation impacts if player belongs to a sect
    if (gameState.player.sect && playerFaction === gameState.player.sect) {
      const sectReputationChange = outcome === 'victory' ? 10 : -5;
      effects.push({
        type: 'sect_reputation',
        sect: gameState.player.sect,
        change: sectReputationChange,
        reason: `Sect faction battle ${outcome}`
      });
    }

    // Rival relationship impacts for faction leaders
    const factionRivals = rivalSystem.getAllRivals().filter(r =>
      r.faction === enemyFaction && r.relationship < 0
    );

    factionRivals.forEach(rival => {
      const relationshipChange = outcome === 'victory' ? 5 : -3;
      effects.push({
        type: 'rival_relationship',
        rivalId: rival.id,
        change: relationshipChange,
        reason: `Faction battle ${outcome} against ${enemyFaction}`
      });
    });

    // Long-term consequences for major faction conflicts
    if (battle.type === 'war') {
      effects.push({
        type: 'world_event',
        event: `major_faction_conflict_${outcome}`,
        factions: [playerFaction, enemyFaction],
        duration: 30, // days
        reason: `Major faction conflict resolution`
      });
    }

    return { success: true, effects, error: undefined };
  } catch (error) {
    console.error(`Error resolving faction battle ${battleId}:`, error);
    return { success: false, effects: [], error: `Unexpected error: ${error}` };
  }
}

/**
 * Enhanced encounter cooldown logic with personality modifiers
 */
export function canEncounterRivalEnhanced(
  rivalSystem: RivalSystem,
  rivalId: string,
  currentDay: number,
  playerLevel: number
): { canEncounter: boolean; cooldownDays: number; reason?: string } {
  try {
    // Validate input
    if (!rivalId || typeof rivalId !== 'string' || rivalId.trim() === '') {
      return { canEncounter: false, cooldownDays: 0, reason: 'Invalid rival ID' };
    }

    // Check if rival exists
    const rival = rivalSystem.getRival(rivalId);
    if (!rival) {
      return { canEncounter: false, cooldownDays: 0, reason: 'Rival not found' };
    }

    // Check if rival is defeated (defeated rivals might have different encounter rules)
    if (rival.defeated) {
      const daysSinceLastEncounter = currentDay - rival.lastEncounter;
      const defeatedRivalCooldown = 30; // 30 days cooldown for defeated rivals
      if (daysSinceLastEncounter >= defeatedRivalCooldown) {
        return { canEncounter: true, cooldownDays: 0 };
      } else {
        return {
          canEncounter: false,
          cooldownDays: defeatedRivalCooldown - daysSinceLastEncounter,
          reason: 'Defeated rival cooldown'
        };
      }
    }

    // Validate current day
    if (typeof currentDay !== 'number' || isNaN(currentDay) || currentDay < 0) {
      return { canEncounter: false, cooldownDays: 0, reason: 'Invalid game day' };
    }

    // Use RivalSystem's encounter cooldown logic
    const canEncounter = rivalSystem.canEncounterRival(rivalId, currentDay);

    if (!canEncounter) {
      const cooldownDays = rivalSystem.getEncounterCooldownById(rivalId);
      return { canEncounter: false, cooldownDays, reason: 'Standard cooldown' };
    }

    // Additional validation: check if player meets minimum requirements for encounter
    const rivalRealm = rival.level || 1;

    // Prevent encounters with rivals too far above player level (more than 20 levels)
    if (rivalRealm > playerLevel + 20) {
      return {
        canEncounter: false,
        cooldownDays: 0,
        reason: `Rival too powerful (${rivalRealm} vs ${playerLevel})`
      };
    }

    // Personality-based modifiers
    if (rival.personality) {
      const personality = rival.personality.toLowerCase();

      // Aggressive rivals have shorter cooldowns
      if (personality.includes('aggressive') || personality.includes('hostile')) {
        // Allow encounter even if slightly early
        const baseCooldown = rivalSystem.getEncounterCooldownById(rivalId);
        if (baseCooldown <= 2) {
          return { canEncounter: true, cooldownDays: 0 };
        }
      }

      // Cautious rivals have longer cooldowns
      if (personality.includes('cautious') || personality.includes('defensive')) {
        const baseCooldown = rivalSystem.getEncounterCooldownById(rivalId);
        if (baseCooldown < 5) {
          return { canEncounter: false, cooldownDays: 5, reason: 'Cautious rival extended cooldown' };
        }
      }
    }

    return { canEncounter: true, cooldownDays: 0 };
  } catch (error) {
    console.error(`Error checking rival encounter availability for ${rivalId}:`, error);
    return { canEncounter: false, cooldownDays: 0, reason: 'Unexpected error' };
  }
}

/**
 * Batch rival relationship updates for performance
 */
export function batchUpdateRivalRelationships(
  rivalSystem: RivalSystem,
  updates: Array<{ rivalId: string; change: number }>,
  currentDay: number
): { success: boolean; results: Array<{ rivalId: string; success: boolean; newRelationship: number; error?: string }> } {
  const results: Array<{ rivalId: string; success: boolean; newRelationship: number; error?: string }> = [];

  try {
    // Process updates in batch
    for (const update of updates) {
      try {
        const result = adjustRivalRelationshipEnhanced(
          rivalSystem,
          {} as GameState, // We don't need full game state for this
          update.rivalId,
          update.change,
          currentDay
        );

        results.push({
          rivalId: update.rivalId,
          success: result.success,
          newRelationship: result.newRelationship,
          error: result.error
        });
      } catch (error) {
        results.push({
          rivalId: update.rivalId,
          success: false,
          newRelationship: 0,
          error: `Batch update error: ${error}`
        });
      }
    }

    const allSuccessful = results.every(r => r.success);
    return { success: allSuccessful, results };
  } catch (error) {
    console.error('Error in batch rival relationship update:', error);
    return { success: false, results: [] };
  }
}

/**
 * Validate rival system integrity
 */
export function validateRivalSystemIntegrity(
  rivalSystem: RivalSystem,
  gameState: GameState
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate RivalSystem integration
    if (!rivalSystem) {
      errors.push('RivalSystem not initialized');
      return { isValid: false, errors, warnings };
    }

    const allRivals = rivalSystem.getAllRivals();
    allRivals.forEach(rival => {
      // Check for invalid relationship values
      if (typeof rival.relationship !== 'number' || isNaN(rival.relationship)) {
        errors.push(`Invalid relationship value for rival ${rival.id}: ${rival.relationship}`);
      }

      // Check for invalid encounter data
      if (typeof rival.lastEncounter !== 'number' || rival.lastEncounter < 0) {
        warnings.push(`Invalid last encounter data for rival ${rival.id}: ${rival.lastEncounter}`);
      }

      // Validate rival data consistency with local state
      const localRelationship = gameState.player.rivalRelationships[rival.id];
      if (localRelationship !== undefined && Math.abs(localRelationship - rival.relationship) > 5) {
        warnings.push(`Relationship mismatch for rival ${rival.id}: local=${localRelationship}, system=${rival.relationship}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    errors.push(`Validation process error: ${error}`);
    return { isValid: false, errors, warnings };
  }
}
