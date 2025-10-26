"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AnalyticsClass {
    constructor() {
        this.events = [];
    }
    record(eventName, payload) {
        this.events.push({ eventName, payload, ts: Date.now() });
    }
    getEvents() { return [...this.events]; }
    clear() { this.events = []; }
}
exports.default = new AnalyticsClass();
