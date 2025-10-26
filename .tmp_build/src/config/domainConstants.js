"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIGH_UPKEEP_WARNING_THRESHOLD = exports.FORCE_CAPTURE_PENALTIES = exports.BASE_ATTRITION_CAP = exports.MAX_ATTRITION_PCT = exports.DEFAULT_ATTRITION_MULTIPLIER = void 0;
// Centralized domain-related tuning constants
exports.DEFAULT_ATTRITION_MULTIPLIER = 1.5; // force-capture multiplier
exports.MAX_ATTRITION_PCT = 0.99; // cap attrition at 99%
exports.BASE_ATTRITION_CAP = 0.9; // normal max attrition
exports.FORCE_CAPTURE_PENALTIES = {
    influencePenalty: 10,
    reputationPenalty: 5,
};
exports.HIGH_UPKEEP_WARNING_THRESHOLD = 0.5; // 50% of faction treasury
