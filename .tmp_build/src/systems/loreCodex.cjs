"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loreCodex = void 0;
const worldState_1 = require("./worldState");
exports.loreCodex = {
    addFragment(fragment) {
        const f = { id: fragment.id || 'l_' + Math.random().toString(36).slice(2, 9), title: fragment.title, content: fragment.content, era: fragment.era || worldState_1.worldState.getState().era, tags: fragment.tags || [], discoveredAt: Date.now() };
        // persist as an event and in event log
        worldState_1.worldState.pushEvent({ id: 'lore_' + f.id, type: 'loreDiscovered', payload: { fragment: f } });
        // we also store in worldState.eventLog already; optionally keep a separate codex in state
        worldState_1.worldState.applyMutation(s => { s['codex'] = s['codex'] || []; s['codex'].push(f); });
        return f;
    },
    listFragments(filter) {
        const s = worldState_1.worldState.getState();
        const codex = s.codex || [];
        return codex.filter((f) => { if (filter && filter.era && f.era !== filter.era)
            return false; if (filter && filter.tag && !(f.tags || []).includes(filter.tag))
            return false; return true; });
    },
    // AstralWandering: rare reward for long uninterrupted sessions
    tryAstralWander(session) {
        // long session metadata: score based on session.currentProgress
        const score = session.currentProgress || 0;
        if (score < 200)
            return null; // threshold
        if (Math.random() < 0.2) {
            const frag = this.addFragment({ title: 'Astral Vision', content: 'A fleeting vision of the Dao', tags: ['astral', 'vision'] });
            return frag;
        }
        return null;
    }
};
