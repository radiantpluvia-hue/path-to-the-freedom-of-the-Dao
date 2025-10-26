// Centralized domain-related tuning constants
export const DEFAULT_ATTRITION_MULTIPLIER = 1.5; // force-capture multiplier
export const MAX_ATTRITION_PCT = 0.99; // cap attrition at 99%
export const BASE_ATTRITION_CAP = 0.9; // normal max attrition

export const FORCE_CAPTURE_PENALTIES = {
  influencePenalty: 10,
  reputationPenalty: 5,
};

export const HIGH_UPKEEP_WARNING_THRESHOLD = 0.5; // 50% of faction treasury
