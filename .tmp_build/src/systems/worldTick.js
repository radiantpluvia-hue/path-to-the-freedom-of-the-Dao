"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldTick = void 0;
const EventBus_1 = __importDefault(require("../system/EventBus"));
class WorldTicker {
    constructor() {
        this.running = false;
    }
    async tick(opts) {
        // emit a synchronous pre-tick event
        EventBus_1.default.emit('preTick', opts);
        // future: run async systems
        await EventBus_1.default.emitAsync('tick', opts);
        EventBus_1.default.emit('postTick', opts);
    }
    async runOnce(opts) {
        return this.tick(opts);
    }
}
exports.WorldTick = new WorldTicker();
