"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initEventListeners;
const EventBus_1 = __importDefault(require("../system/EventBus"));
const systemSingletons_1 = require("../systems/systemSingletons");
void systemSingletons_1.rivalSystem;
const Analytics_1 = __importDefault(require("../systems/Analytics"));
const LawSystem_1 = __importDefault(require("../systems/LawSystem"));
// Concrete handlers: analytics recorder and law/dao reaction hooks. RivalSystem
// singleton is available for future richer integrations.
EventBus_1.default.on('territoryCaptured', (payload) => {
    try {
        Analytics_1.default.record('territoryCaptured', payload);
    }
    catch (e) { /* ignore */ }
    try {
        LawSystem_1.default.onTerritoryCaptured(payload);
    }
    catch (e) { /* ignore */ }
    // RivalSystem integration could be added here when payload contains rival ids
});
EventBus_1.default.on('influenceApplied', (payload) => {
    try {
        Analytics_1.default.record('influenceApplied', payload);
    }
    catch (e) { /* ignore */ }
});
EventBus_1.default.on('influenceDecayed', (payload) => {
    try {
        Analytics_1.default.record('influenceDecayed', payload);
    }
    catch (e) { /* ignore */ }
});
function initEventListeners() { }
