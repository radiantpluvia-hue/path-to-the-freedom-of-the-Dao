"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RivalChoiceHandler = void 0;
exports.createDefaultChoiceHandler = createDefaultChoiceHandler;
const eventResolver_1 = require("../../eventResolver");
// A simple default implementation for rival/encounter choices.
class RivalChoiceHandler {
    handleChoice(gs, choice) {
        // Support tokenized effects to allow richer encounter choices.
        // Recognized tokens:
        // - relationship: { rivalId: number }
        // - setFlag: { path: string, value?: any }
        // - addItem: { id: string, name?: string, qty?: number }
        // - stats: { atk?: number, def?: number, speed?: number, [k:string]: number }
        // If effect keys are plain stat keys or others, fall back to applyEventEffects for compatibility.
        const effects = (choice.effects || {});
        const newGs = JSON.parse(JSON.stringify(gs));
        const narrativeParts = [];
        // Handle structured tokens first
        if (effects.relationship && typeof effects.relationship === 'object') {
            // Example: relationship: { rivalId: 'rival_01', delta: 5 }
            const rel = effects.relationship;
            const rid = rel.rivalId || rel.rival || rel.id;
            const delta = typeof rel.delta === 'number' ? rel.delta : (typeof rel === 'number' ? rel : 0);
            if (rid) {
                newGs.player.rivalRelationships = newGs.player.rivalRelationships || {};
                newGs.player.rivalRelationships[rid] = (newGs.player.rivalRelationships[rid] || 0) + delta;
                narrativeParts.push(`Relationship with ${rid} ${delta >= 0 ? 'improved' : 'worsened'} by ${Math.abs(delta)}.`);
            }
        }
        if (effects.setFlag && typeof effects.setFlag === 'object') {
            const f = effects.setFlag;
            const path = f.path || f.key || f.flag;
            if (path) {
                // set in world flags for simplicity
                newGs.world = newGs.world || {};
                newGs.world.flags = newGs.world.flags || {};
                newGs.world.flags[path] = typeof f.value === 'undefined' ? true : f.value;
                narrativeParts.push(`${String(path)} set.`);
            }
        }
        if (effects.addItem && typeof effects.addItem === 'object') {
            const it = effects.addItem;
            const id = it.id || it.item || (typeof it === 'string' ? it : null);
            if (id) {
                newGs.player.inventory = newGs.player.inventory || [];
                const qty = typeof it.qty === 'number' ? it.qty : (it.quantity || it.q || 1);
                newGs.player.inventory.push({ id, name: it.name || id.replace(/_/g, ' '), qty });
                narrativeParts.push(`You obtained ${qty} x ${id}.`);
            }
        }
        if (effects.stats && typeof effects.stats === 'object') {
            newGs.player.stats = newGs.player.stats || {};
            for (const k of Object.keys(effects.stats)) {
                const v = effects.stats[k];
                if (typeof v === 'number') {
                    newGs.player.stats[k] = (newGs.player.stats[k] || 0) + v;
                    narrativeParts.push(`${k} ${v >= 0 ? 'increased' : 'decreased'} by ${Math.abs(v)}.`);
                }
            }
        }
        // Fallback/compatibility: if there are other keys not handled above, delegate to applyEventEffects
        const handledKeys = new Set(['relationship', 'setFlag', 'addItem', 'stats']);
        const remaining = {};
        for (const k of Object.keys(effects || {})) {
            if (!handledKeys.has(k))
                remaining[k] = effects[k];
        }
        if (Object.keys(remaining).length > 0) {
            const { newPlayerState, narrative } = (0, eventResolver_1.applyEventEffects)(gs.player, remaining);
            newGs.player = newPlayerState;
            if (narrative)
                narrativeParts.push(narrative);
        }
        const narrative = narrativeParts.join(' ');
        return { newState: newGs, narrative };
    }
}
exports.RivalChoiceHandler = RivalChoiceHandler;
// Convenience factory for default handler
function createDefaultChoiceHandler() {
    return new RivalChoiceHandler();
}
