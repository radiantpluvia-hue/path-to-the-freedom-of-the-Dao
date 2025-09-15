"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalExecutors = void 0;
const eventExecutors_global_1 = require("./eventExecutors_global");
exports.globalExecutors = {
    "global_epochal_tournament": eventExecutors_global_1.epochalTournamentExecutor
};
