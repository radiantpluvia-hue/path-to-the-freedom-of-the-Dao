"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rumorSystem = void 0;
const worldState_1 = require("./worldState");
exports.rumorSystem = {
    postRumor(r) {
        const now = Date.now();
        const rum = { id: r.id || 'r_' + Math.random().toString(36).slice(2, 9), source: r.source || 'unknown', content: r.content, truthiness: typeof r.truthiness === 'number' ? r.truthiness : 0.5, expiry: r.expiryMs, postedAt: now };
        worldState_1.worldState.pushEvent({ id: 'rumor_' + rum.id, type: 'rumorPosted', payload: { rumor: rum } });
        worldState_1.worldState.pushEvent({ id: 'rumor_log_' + Math.random().toString(36).slice(2, 6), type: 'rumorLog', payload: { rumorId: rum.id } });
        // store in worldState.rumors as well
        worldState_1.worldState.postRumor({ id: rum.id, content: rum.content, truthiness: rum.truthiness, expiry: rum.expiry });
        return rum;
    },
    getRumors(filter) {
        const all = worldState_1.worldState.getRumors();
        const now = Date.now();
        return all.filter((r) => {
            if (filter && typeof filter.minTruthiness === 'number' && r.truthiness < filter.minTruthiness)
                return false;
            if (filter && filter.activeOnly && r.expiry && r.expiry < now)
                return false;
            return true;
        });
    },
    expireRumors() {
        const now = Date.now();
        const current = worldState_1.worldState.getRumors();
        const active = current.filter((r) => !(r.expiry && r.expiry < now));
        // Overwrite the rumor list via mutation
        worldState_1.worldState.applyMutation(s => { s.rumors = active; });
        return active;
    },
    generateRumorFromEvent(eventData) {
        // Simple rumor generation logic: content derived from title + embellishment
        const truthiness = Math.max(0.1, Math.random() * 0.9);
        const content = eventData.title ? `${eventData.title} has been reported nearby.` : `Strange happenings observed.`;
        const rum = this.postRumor({ source: 'event', content, truthiness, expiryMs: Date.now() + 1000 * 60 * 60 * 24 * 7 });
        return rum;
    }
};
