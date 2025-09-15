"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onYearTick = onYearTick;
const eventExecutors_global_1 = require("../events/executors/eventExecutors_global");
const eventExecutors_global_registry_1 = require("../events/executors/eventExecutors_global.registry");
// Call once per in-game “year” or tick that represents a year
function onYearTick(state) {
    if ((0, eventExecutors_global_1.shouldRunEpochTournament)(state)) {
        const exec = eventExecutors_global_registry_1.globalExecutors["global_epochal_tournament"];
        if (exec)
            return exec(state, { rankCount: 100 });
    }
    return state;
}
