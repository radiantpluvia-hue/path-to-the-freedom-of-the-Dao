// Tuning constants for practice / technique mastery mechanics
export const COST_QI = 30; // Qi cost per practice session
export const ADD_FATIGUE = 4; // Fatigue added per practice
export const PRACTICE_XP = 4; // XP gained per practice (more than combat)
export const RANK_XP = 5; // XP required to increase mastery rank

// Botch thresholds and chances
export const BOTCH_HIGH_FATIGUE_THRESHOLD = 25; // newFatigue >= this uses high chance
export const BOTCH_HIGH_CHANCE = 0.5; // 50%
export const BOTCH_LOW_FATIGUE_THRESHOLD = 20; // currentFatigue >= this uses low chance
export const BOTCH_LOW_CHANCE = 0.2; // 20%
export const BOTCH_EXTRA_FATIGUE = 5; // extra fatigue applied on botch

// UI
export const INLINE_MESSAGE_DURATION_MS = 3500;

export default {
  COST_QI,
  ADD_FATIGUE,
  PRACTICE_XP,
  RANK_XP,
  BOTCH_HIGH_FATIGUE_THRESHOLD,
  BOTCH_HIGH_CHANCE,
  BOTCH_LOW_FATIGUE_THRESHOLD,
  BOTCH_LOW_CHANCE,
  BOTCH_EXTRA_FATIGUE,
  INLINE_MESSAGE_DURATION_MS
};
