"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INLINE_MESSAGE_DURATION_MS = exports.BOTCH_EXTRA_FATIGUE = exports.BOTCH_LOW_CHANCE = exports.BOTCH_LOW_FATIGUE_THRESHOLD = exports.BOTCH_HIGH_CHANCE = exports.BOTCH_HIGH_FATIGUE_THRESHOLD = exports.RANK_XP = exports.PRACTICE_XP = exports.ADD_FATIGUE = exports.COST_QI = void 0;
// Tuning constants for practice / technique mastery mechanics
exports.COST_QI = 30; // Qi cost per practice session
exports.ADD_FATIGUE = 4; // Fatigue added per practice
exports.PRACTICE_XP = 4; // XP gained per practice (more than combat)
exports.RANK_XP = 5; // XP required to increase mastery rank
// Botch thresholds and chances
exports.BOTCH_HIGH_FATIGUE_THRESHOLD = 25; // newFatigue >= this uses high chance
exports.BOTCH_HIGH_CHANCE = 0.5; // 50%
exports.BOTCH_LOW_FATIGUE_THRESHOLD = 20; // currentFatigue >= this uses low chance
exports.BOTCH_LOW_CHANCE = 0.2; // 20%
exports.BOTCH_EXTRA_FATIGUE = 5; // extra fatigue applied on botch
// UI
exports.INLINE_MESSAGE_DURATION_MS = 3500;
exports.default = {
    COST_QI: exports.COST_QI,
    ADD_FATIGUE: exports.ADD_FATIGUE,
    PRACTICE_XP: exports.PRACTICE_XP,
    RANK_XP: exports.RANK_XP,
    BOTCH_HIGH_FATIGUE_THRESHOLD: exports.BOTCH_HIGH_FATIGUE_THRESHOLD,
    BOTCH_HIGH_CHANCE: exports.BOTCH_HIGH_CHANCE,
    BOTCH_LOW_FATIGUE_THRESHOLD: exports.BOTCH_LOW_FATIGUE_THRESHOLD,
    BOTCH_LOW_CHANCE: exports.BOTCH_LOW_CHANCE,
    BOTCH_EXTRA_FATIGUE: exports.BOTCH_EXTRA_FATIGUE,
    INLINE_MESSAGE_DURATION_MS: exports.INLINE_MESSAGE_DURATION_MS
};
