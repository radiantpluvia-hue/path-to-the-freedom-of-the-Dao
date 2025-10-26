"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LawSystemClass {
    constructor() {
        this.events = [];
    }
    onTerritoryCaptured(payload) {
        this.events.push({ type: 'territoryCaptured', payload, ts: Date.now() });
    }
    // Apply scheduled law effects against the game state (taxation example)
    applyScheduledLaws(gs) {
        // simple: for every territory owned by a faction, transfer 1% resources to faction treasury
        const territories = (gs.world || {}).territories || {};
        const factions = (gs.world || {}).factions || {};
        for (const tid of Object.keys(territories)) {
            const t = territories[tid];
            if (t && t.ownerFactionId) {
                const gain = Math.max(0, Math.floor((t.garrison && t.garrison.troops || 0) * 0.01));
                const f = factions[t.ownerFactionId] || null;
                if (f) {
                    f.treasury = f.treasury || { gold: 0 };
                    f.treasury.gold = (f.treasury.gold || 0) + gain;
                }
            }
        }
    }
    getEvents() { return [...this.events]; }
}
exports.default = new LawSystemClass();
