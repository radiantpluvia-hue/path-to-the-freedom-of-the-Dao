"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalExecutors = void 0;
const eventExecutors_global_1 = require("./eventExecutors_global");
exports.globalExecutors = {
    "global_epochal_tournament": eventExecutors_global_1.epochalTournamentExecutor,
    "global_forced_ascension": eventExecutors_global_1.forcedAscensionExecutor,
    "global_check_alignment_unlocks": eventExecutors_global_1.global_check_alignment_unlocks,
    "global_alignment_unlocks_combined": eventExecutors_global_1.global_alignment_unlocks_combined
};
