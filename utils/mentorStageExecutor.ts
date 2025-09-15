import { GameState } from './types';

interface MicrogameResult {
    success: boolean;
    score?: number;
    quality?: number;
    level?: number;
}

interface StageReward {
    daoComprehension: number;
    skillPoints: number;
    specialFlag: string;
}

interface StageData {
    mentor: string;
    stage: number;
    reward: StageReward;
}

type MentorBonusHandler = (
    state: GameState,
    stageData: StageData,
    microgameResult: MicrogameResult,
    performanceMultiplier: number
) => string | null;

const mentorBonusHandlers: Record<string, MentorBonusHandler> = {
    'The Shadow Sovereign': (state, stageData, microgameResult, performanceMultiplier) => {
        if (performanceMultiplier > 0.8) {
            state.player.shadowLedger = (state.player.shadowLedger || 0) + 1;
            return "Your schemes impressed even The Shadow Sovereign. ";
        }
        return null;
    },
    'The Hidden Profound': (state, stageData, microgameResult, performanceMultiplier) => {
        (state.player as any).providenceVeil = ((state.player as any).providenceVeil || 0) + stageData.stage;
        return "Your hidden cultivation deepens. ";
    },
    'The Flame Emperor': (state, stageData, microgameResult, performanceMultiplier) => {
        if (performanceMultiplier > 0.7) {
            (state.player as any).flameAffinity = ((state.player as any).flameAffinity || 0) + 1;
            return "Your flames burn brighter! ";
        }
        return null;
    },
    'The Rebellious Blade': (state, stageData, microgameResult, performanceMultiplier) => {
        if (microgameResult.level && microgameResult.level > 3) {
            state.player.buffs = state.player.buffs || {};
            state.player.buffs.intentEcho = {
                duration: 20,
                procChance: 0.4,
                // Use overall combat power from player root; fallback to 0 if undefined
                damage: Math.floor(((state.player.combatPower || 0)) * 0.25)
            };
            return "Your sword intent resonates with perfect clarity! ";
        }
        return null;
    },
};

export function mentorStageExecutor(
    state: GameState,
    stageData: StageData,
    microgameResult: MicrogameResult
): { success: boolean; rewards: StageReward; narrative: string } {

  const { mentor, stage, reward } = stageData;
  const { success, score = 0, quality = 0, level = 0 } = microgameResult;
  
  // Base rewards
  let finalRewards = { ...reward };
  let narrative = `Stage ${stage} with ${mentor} `;
  
  if (success) {
    // Success multipliers based on performance
    const performanceMultiplier = Math.max(score, quality, level) / 100;
    finalRewards.daoComprehension = Math.floor(reward.daoComprehension * (1 + performanceMultiplier));
    finalRewards.skillPoints = Math.floor(reward.skillPoints * (1 + performanceMultiplier * 0.5));
    
    narrative += "completed successfully! ";
    
        // Mentor-specific bonuses
        const bonusHandler = mentorBonusHandlers[mentor];
        if (bonusHandler) {
            const bonusNarrative = bonusHandler(state, stageData, microgameResult, performanceMultiplier);
            if (bonusNarrative) {
                narrative += bonusNarrative;
            }
        }
  } else {
    // Failure - reduced rewards but still some progress
    finalRewards.daoComprehension = Math.floor(reward.daoComprehension * 0.3);
    finalRewards.skillPoints = Math.floor(reward.skillPoints * 0.3);
    narrative += "was challenging, but you learned from the struggle. ";
  }
  
  // Apply rewards to state (store on player root to align with PlayerState type)
  (state.player as any).daoComprehension = ((state.player as any).daoComprehension || 0) + finalRewards.daoComprehension;
  (state.player as any).skillPoints = ((state.player as any).skillPoints || 0) + finalRewards.skillPoints;
  
  // Set special flags
  if (finalRewards.specialFlag) {
    state.world.flags = state.world.flags || {};
    state.world.flags[finalRewards.specialFlag] = true;
  }
  
  return {
    success,
    rewards: finalRewards,
    narrative: narrative + `Gained ${finalRewards.daoComprehension} Dao comprehension and ${finalRewards.skillPoints} skill points.`
  };
}