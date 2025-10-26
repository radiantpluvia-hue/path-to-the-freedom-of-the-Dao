"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.npcManager = void 0;
const worldState_1 = require("./worldState");
const relationshipManager_1 = require("./relationshipManager");
let npcs = [];
function loadTemplates() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const t = require('../../data/npcs/basic_npcs.json');
        if (Array.isArray(t)) {
            npcs = t.map((x) => ({ id: x.id, name: x.name, realmProgress: x.startingProgress || 0, currentRealm: x.startingRealm || 1, affiliation: x.affiliation }));
        }
    }
    catch (e) { /* ignore */ }
}
loadTemplates();
exports.npcManager = {
    listNPCs() { return JSON.parse(JSON.stringify(npcs)); },
    tickNPCs(dtSeconds) {
        // simple progression: each NPC gains small realmProgress; random breakthrough if over threshold
        const events = [];
        for (const n of npcs) {
            n.realmProgress += dtSeconds * 0.1; // slow passive progress
            if (n.realmProgress >= 100) {
                n.realmProgress = 0;
                n.currentRealm += 1;
                // emit npcBreakthrough
                const ev = worldState_1.worldState.pushEvent({ id: 'npc_br_' + n.id + '_' + Date.now(), type: 'npcBreakthrough', payload: { npcId: n.id, newRealm: n.currentRealm } });
                events.push(ev);
                // ripple: modify relationships randomly (favor/envy)
                relationshipManager_1.relationshipManager.modifyRelationship(n.id, 'player', { favor: -1, envy: 2 }, 'breakthrough_ripple');
            }
        }
        return events;
    },
    getNPC(id) { return JSON.parse(JSON.stringify(npcs.find(x => x.id === id))); }
};
