export type MiniGamePhase = 'intro' | 'challenge' | 'judgment' | 'reward' | 'failed';

export interface MiniGameResult {
  success: boolean;
  finalPhase: MiniGamePhase;
  rewardPower?: number;
  failureBacklash?: number;
}

// A tiny mental-world mini-game: phases with a simple strength check and a choice
export function runMentalWorldMiniGame(userMentalStrength: number, choices: { humility: boolean; recallHint?: boolean }, difficultyScale = 1): MiniGameResult {
  // intro always passes
  const intro = 'intro';

  // challenge: compute target using difficultyScale and a randomness-free deterministic function
  const baseDifficulty = 60 * difficultyScale;
  // humility and recallHint reduce difficulty
  const modifier = (choices.humility ? -10 : 0) + (choices.recallHint ? -5 : 0);
  const target = Math.max(10, Math.round(baseDifficulty + modifier));

  if (userMentalStrength >= target) {
    // pass to judgment
    const rewardPower = Math.round((userMentalStrength - target) * 0.5) + Math.round(10 * difficultyScale);
    return { success: true, finalPhase: 'reward', rewardPower };
  }

  const backlash = Math.max(1, Math.round((target - userMentalStrength) / 2));
  return { success: false, finalPhase: 'failed', failureBacklash: backlash };
}
