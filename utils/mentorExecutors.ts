import { GameState } from './types';
import { getRealmById } from '../gameData';

// Seeded RNG for deterministic outcomes
function seededRandom(state: GameState, seed: string): number {
  const fullSeed = `${state.world.year}_${state.player.name}_${seed}`;
  let hash = 0;
  for (let i = 0; i < fullSeed.length; i++) {
    const char = fullSeed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647;
}

export const mentorExecutors = {
  mentor_hidden_manual_search: (state: GameState, args: any) => {
    const mentorId = args?.mentorId || 'unknown';
    const seed = `hidden_manual_${mentorId}_${state.world.year}`;
    const roll = seededRandom(state, seed);

    if (mentorId === 'mentor_shadow_sovereign') {
      // Shadow Ledger effect - steal from rivals
      if (roll < 0.3) {
        // Store ledger on player root to match src/types.ts shape
        state.player.shadowLedger = (state.player.shadowLedger || 0) + 1;
        // Deterministic rival selection and steal amount
        const stealAmount = Math.floor(roll * 50) + 10;
        state.player.stats.qi = (state.player.stats.qi || 0) + stealAmount;
        return { success: true, stolen: stealAmount };
      }
    }

    if (mentorId === 'mentor_hidden_profound') {
      // Providence Veil - delayed rewards; keep on player root to avoid typing mismatch
      state.player.providenceVeil = (state.player.providenceVeil || 0) + 1;
      const delayDays = Math.floor(roll * 30) + 7;
      state.world.flags[`providence_reward_${state.world.year + delayDays}`] = true;
    }

    return { success: roll < 0.5 };
  },

  mentor_tribulation_trial: (state: GameState, args: any) => {
    const mentorId = args?.mentorId || 'unknown';
    // Assumes state.player.realmId is the current realm's ID
    const currentRealm = getRealmById(state.player.realmId || 0);
    const seed = `tribulation_${mentorId}_${currentRealm ? currentRealm.name : 'unknown'}`;
    const roll = seededRandom(state, seed);

    if (mentorId === 'mentor_flame_emperor') {
      // Flame Affinity bonus — stored on player root
      const flameBonus = state.player.flameAffinity || 0;
      const successChance = 0.6 + (flameBonus * 0.1);
      return { success: roll < successChance, flameResonance: true };
    }

    if (mentorId === 'mentor_mountain_sealer') {
      // Law-Flex - alter local rules
      if (roll < 0.4) {
        state.world.flags = state.world.flags || {};
        state.world.flags[`law_flex_active_${state.world.year + 10}`] = true;
        return { success: true, lawFlexed: true };
      }
    }

    return { success: roll < 0.5 };
  },

  mentor_supervised_duel: (state: GameState, args: any) => {
    const mentorId = args?.mentorId || 'unknown';
    const seed = `duel_${mentorId}_${state.player.combatPower || 0}`;
    const roll = seededRandom(state, seed);

    if (mentorId === 'mentor_rebellious_blade') {
      // Blade Resonance - intent echo buff
      const victory = roll < 0.7; // Higher success with sword mentor
      if (victory) {
        state.player.buffs = state.player.buffs || {};
        state.player.buffs.intentEcho = {
          duration: 20,
          procChance: 0.4,
          damage: Math.floor((state.player.combatPower || 0) * 0.25)
        };
      }
      return { victory, intentEcho: victory };
    }

    return { victory: roll < 0.5 };
  },

  mentor_sabotage_investigation: (state: GameState, args: any) => {
    const mentorId = args?.mentorId || 'unknown';
    const seed = `investigation_${mentorId}_${state.world.year}`;
    const roll = seededRandom(state, seed);

    if (mentorId === 'mentor_shadow_sovereign') {
      // Negative faction ripples for cunning choices
      const factionDamage = Math.floor(roll * 20) + 5;
      (state.player as any).factionReputations = (state.player as any).factionReputations || {};
      (state.player as any).factionReputations.rivals = ((state.player as any).factionReputations.rivals || 0) - factionDamage;
      return { success: true, factionDamage };
    }

    if (mentorId === 'mentor_serene_melody') {
      // Honor Ward - righteous faction bonus
      const factionBonus = Math.floor(roll * 15) + 10;
      (state.player as any).factionReputations = (state.player as any).factionReputations || {};
      (state.player as any).factionReputations.righteous_sects = ((state.player as any).factionReputations.righteous_sects || 0) + factionBonus;
      return { success: true, factionBonus };
    }

    return { success: roll < 0.6 };
  },

  mentor_legacy_trial: (state: GameState, args: any) => {
    // A trial that gives a legacy token if the roll is high enough, deterministic
    const mentorId = args?.mentorId || 'unknown';
    const seed = `legacy_trial_${mentorId}_${state.player.name || ''}`;
    const roll = seededRandom(state, seed);
    if (roll > 0.7) {
      state.player.legacyTokens = (state.player.legacyTokens || 0) + 1;
      return { success: true, legacyToken: true };
    }
    return { success: false };
  },

  mentor_ritual_guidance: (state: GameState, args: any) => {
    // Ritual guidance: deterministic bonus to spirit or insight
    const mentorId = args?.mentorId || 'unknown';
    const seed = `ritual_guidance_${mentorId}_${state.world.year}`;
    const roll = seededRandom(state, seed);
    if (roll < 0.5) {
  state.player.stats = state.player.stats || { hp: 0, qi: 0, atk: 0, def: 0, speed: 0 };
      state.player.stats.spirit = (state.player.stats.spirit || 0) + 10;
      return { success: true, stat: 'spirit', amount: 10 };
    } else {
  state.player.stats = state.player.stats || { hp: 0, qi: 0, atk: 0, def: 0, speed: 0 };
      state.player.stats.insight = (state.player.stats.insight || 0) + 7;
      return { success: true, stat: 'insight', amount: 7 };
    }
  },
};