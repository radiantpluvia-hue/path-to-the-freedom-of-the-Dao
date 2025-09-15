"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executorIds = void 0;
exports.getExecutor = getExecutor;
const eventExecutors_act1_1 = require("./eventExecutors_act1.cjs");
const eventExecutors_act2_1 = require("./eventExecutors_act2.cjs");
const eventExecutors_act3_1 = require("./eventExecutors_act3.cjs");
const eventExecutors_act4_1 = require("./eventExecutors_act4.cjs");
const eventExecutors_act5_1 = require("./eventExecutors_act5.cjs");
const eventExecutors_act6_1 = require("./eventExecutors_act6.cjs");
const eventExecutors_act7_1 = require("./eventExecutors_act7.cjs");
const eventExecutors_mentors_1 = __importDefault(require("./eventExecutors_mentors.cjs"));
const eventExecutors_global_registry_1 = require("./eventExecutors_global.registry.cjs");
const eventExecutors_stubs_1 = __importDefault(require("./eventExecutors_stubs.cjs"));
const merged = {
    ...eventExecutors_global_registry_1.globalExecutors,
    ...eventExecutors_act1_1.act1EventExecutors,
    ...eventExecutors_act2_1.act2EventExecutors,
    ...eventExecutors_act3_1.act3EventExecutors,
    ...eventExecutors_act4_1.act4EventExecutors,
    ...eventExecutors_act5_1.act5EventExecutors,
    ...eventExecutors_act6_1.act6EventExecutors,
    ...eventExecutors_act7_1.act7EventExecutors,
    ...eventExecutors_mentors_1.default,
    ...eventExecutors_stubs_1.default
};
const makeSafeStub = (id) => {
    return (state, _choice) => {
        try {
            // non-destructive no-op that records that the executor ran
            state = { ...state };
            (state.__meta || (state.__meta = { eventsRan: [] }));
            if (!state.__meta.eventsRan.includes(id))
                state.__meta.eventsRan.push(id);
        }
        catch (e) {
            // swallow intentionally
        }
        return state;
    };
};
function getExecutor(id) {
    return merged[id] || makeSafeStub(id);
}
exports.executorIds = Object.keys(merged);
exports.default = merged;
