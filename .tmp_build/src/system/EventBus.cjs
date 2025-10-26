"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventBus {
    constructor() {
        this.handlers = new Map();
    }
    on(event, h) {
        const arr = this.handlers.get(event) || [];
        arr.push(h);
        this.handlers.set(event, arr);
        return () => this.off(event, h);
    }
    off(event, h) {
        const arr = this.handlers.get(event) || [];
        this.handlers.set(event, arr.filter(x => x !== h));
    }
    emit(event, payload) {
        const arr = this.handlers.get(event) || [];
        for (const h of arr) {
            try {
                h(payload);
            }
            catch (e) { /* swallow for now */ }
        }
    }
    async emitAsync(event, payload) {
        const arr = this.handlers.get(event) || [];
        await Promise.allSettled(arr.map(h => h(payload)));
    }
}
exports.default = new EventBus();
